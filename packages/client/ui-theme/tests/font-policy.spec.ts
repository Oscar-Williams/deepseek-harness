import { describe, expect, it } from 'vitest'
import { cjkRegionOf, FONT_STACKS, resolveFontFamilies } from '../src/font-policy.ts'

const custom = { text: '', code: '', terminal: '' }

describe('regional font selection', () => {
  it.each([
    ['ja-JP', 'ja'], ['ko-KR', 'ko'], ['zh-CN', 'zh-Hans'],
    ['zh-Hant', 'zh-Hant'], ['zh-HK', 'zh-Hant'], ['cmn-Hant', 'zh-Hant'],
    ['yue', 'zh-Hant'], ['zh-Hans-TW', 'zh-Hans'], ['en-US', undefined],
  ])('classifies %s', (locale, region) => {
    expect(cjkRegionOf(locale)).toBe(region)
  })

  it('uses the first CJK browser language for an English interface', () => {
    const fonts = resolveFontFamilies('auto', 'en', ['en-US', 'ja-JP', 'zh-CN'], custom)
    expect(fonts.interfaceText).toContain('"Yu Gothic UI"')
    expect(fonts.code).not.toContain('Microsoft YaHei')
  })

  it('keeps Chinese controls while unmarked content uses a Japanese preference', () => {
    const fonts = resolveFontFamilies('ja', 'zh-CN', ['zh-CN'], custom)
    expect(fonts.interfaceText).toContain('Microsoft YaHei')
    expect(fonts.contentText).toContain('"Yu Gothic UI"')
    expect(fonts.contentText).not.toContain('Microsoft YaHei')
    expect(fonts.terminal.indexOf('Consolas')).toBeLessThan(fonts.terminal.indexOf('Yu Gothic UI'))
    expect(fonts.terminal).toContain('Symbols Nerd Font')
  })

  it('lets a CJK interface precede browser preferences in automatic mode', () => {
    const fonts = resolveFontFamilies('auto', 'ko', ['ja-JP'], custom)
    expect(fonts.contentText).toContain('Malgun Gothic')
    expect(fonts.contentText).not.toContain('Yu Gothic')
  })

  it('uses the platform fallback without forcing a Chinese region', () => {
    const fonts = resolveFontFamilies('auto', 'en', ['fr', 'en'], custom)
    expect(fonts.contentText).toBe(FONT_STACKS.system)
    expect(fonts.code).not.toContain('Microsoft YaHei')
  })

  it('keeps custom fonts before every regional fallback', () => {
    const fonts = resolveFontFamilies('ja', 'en', [], { text: '"User Text"', code: '"User Code"', terminal: '"User Terminal"' })
    expect(fonts.interfaceText).toMatch(/^"User Text",/)
    expect(fonts.contentText).toMatch(/^"User Text",/)
    expect(fonts.code).toMatch(/^"User Code",/)
    expect(fonts.terminal).toMatch(/^"User Terminal",/)
  })

  it('contains the Windows Japanese candidates in priority order', () => {
    const names = FONT_STACKS.ja.split(',').map(value => value.trim())
    for (const name of ['"Yu Gothic UI"', '"Yu Gothic"', '"Meiryo UI"', 'Meiryo', '"Noto Sans JP"', '"Noto Sans CJK JP"']) {
      expect(names).toContain(name)
    }
    expect(names.indexOf('"Yu Gothic UI"')).toBeLessThan(names.indexOf('"Yu Gothic"'))
    expect(names.indexOf('"Yu Gothic"')).toBeLessThan(names.indexOf('"Noto Sans JP"'))
  })
})
