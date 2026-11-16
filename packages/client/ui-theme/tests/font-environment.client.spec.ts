// @vitest-environment jsdom
/** Bootstrap, live locale changes and persisted region share one font policy. */
import { runInNewContext } from 'node:vm'
import { Context } from '@deepseek-ai/cordis'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { stubConfigForm } from '@deepseek-ai/dsh-client-test-runtime'
import { ThemeRuntime, type ThemeSettings } from '@deepseek-ai/dsh-client-ui-theme/client'
import { afterEach, expect, it, onTestFinished, vi } from 'vitest'
import { bootThemeInjections } from '../src/boot-theme.ts'
import { resolveFontFamilies } from '../src/font-policy.ts'

const originalLanguage = document.documentElement.lang
const originalStyle = document.body.getAttribute('style')
const defaults: ThemeSettings = {
  preference: 'system', fontSize: 14, codeFontSize: 11, terminalFontSize: 13,
  textFontFamily: '', codeFontFamily: '', terminalFontFamily: '',
}

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.lang = originalLanguage
  if (originalStyle === null) document.body.removeAttribute('style')
  else document.body.setAttribute('style', originalStyle)
  delete document.body.dataset.dshCjkGlyphRegion
  delete document.documentElement.dataset.dsThemeSource
  document.body.removeAttribute('data-ds-dark-theme')
})

it('keeps Chinese controls while persisting and reloading the Japanese content region', () => {
  document.documentElement.lang = 'zh-CN'
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  const host = stubConfigForm<ThemeSettings>()
  const theme = new ThemeRuntime(ctx, host.scope)
  theme.setCjkGlyphRegion('ja')
  expect(host.set).toHaveBeenCalledWith('cjkGlyphRegion', 'ja')
  expect(theme.getTheme().resolvedFonts.interfaceText).toContain('Microsoft YaHei')
  expect(theme.getTheme().resolvedFonts.contentText).toContain('Yu Gothic UI')
  const secondHost = stubConfigForm<ThemeSettings>()
  secondHost.publish({ status: 'ready', value: { ...defaults, cjkGlyphRegion: 'ja' }, revision: 1, writable: true })
  expect(new ThemeRuntime(ctx, secondHost.scope).getTheme().resolvedFonts).toEqual(theme.getTheme().resolvedFonts)
})

it('reads missing legacy preference as auto', () => {
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  const host = stubConfigForm<ThemeSettings>()
  host.publish({ status: 'ready', value: defaults, revision: 1, writable: true })
  expect(new ThemeRuntime(ctx, host.scope).getTheme().cjkGlyphRegion).toBe('auto')
})

it('updates on locale and browser-language changes, then releases both listeners', async () => {
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  const locale = new LocaleRuntime(ctx)
  ctx.provide('locale', locale)
  locale.setLocale('en')
  const languages = vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US', 'ja-JP'])
  const theme = new ThemeRuntime(ctx, stubConfigForm<ThemeSettings>().scope)
  expect(theme.getTheme().resolvedFonts.contentText).toContain('Yu Gothic UI')
  locale.setLocale('zh')
  expect(theme.getTheme().resolvedFonts.interfaceText).toContain('Microsoft YaHei')
  locale.setLocale('en')
  languages.mockReturnValue(['en-US', 'ko-KR'])
  window.dispatchEvent(new Event('languagechange'))
  expect(theme.getTheme().resolvedFonts.terminal).toContain('Malgun Gothic')
  await ctx.fiber.dispose()
  const snapshot = theme.getTheme()
  languages.mockReturnValue(['ja-JP'])
  window.dispatchEvent(new Event('languagechange'))
  expect(theme.getTheme()).toBe(snapshot)
})

it('produces the same resolved lists at bootstrap and live adoption', () => {
  document.documentElement.lang = 'zh-CN'
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['ja-JP'])
  const custom = { text: 'Custom Text', code: 'Custom Code', terminal: 'Custom Terminal' }
  for (const row of bootThemeInjections('light', undefined, custom, 'ja')) {
    if (row.kind === 'script') runInNewContext(row.text, { document, navigator })
  }
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  const theme = new ThemeRuntime(ctx, stubConfigForm<ThemeSettings>().scope)
  const fonts = theme.getTheme().resolvedFonts
  expect(fonts).toEqual(resolveFontFamilies('ja', 'zh-CN', ['ja-JP'], { text: '"Custom Text"', code: '"Custom Code"', terminal: '"Custom Terminal"' }))
  for (const [key, variable] of [
    ['interfaceText', '--dsh-font-family-text-resolved'], ['contentText', '--dsh-font-family-content-resolved'],
    ['code', '--dsh-font-family-code-resolved'], ['terminal', '--dsh-font-family-terminal-resolved'],
  ] as const) expect(document.body.style.getPropertyValue(variable)).toBe(fonts[key])
})
