/** Regional font acceptance on the built Web application, with same-element drawing controls. */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, firefox, webkit, type Locator, type Page } from 'playwright'
import { afterAll, beforeAll, expect, it, onTestFinished } from 'vitest'
import { launchWebScaffold, seedSession, type WebScaffold } from './scaffold.ts'

const engines = { chromium, firefox, webkit }
const selected = (process.env.DSH_FONT_BROWSERS ?? 'chromium').split(',')
const output = resolve(process.env.DSH_FONT_OUTPUT ?? 'output/japanese-fonts')
const fixture = fileURLToPath(new URL('../../../snapshots/web/seeded-history/session.v3.jsonl', import.meta.url))
const prose = '日本語の本文を確認します。直考骨経'
const heading = '日本語の見出しと字形：直考骨経'
const table = '日本語の表を確認：直考骨経'
const pureHan = '漢字字形確認直骨返令葛'
const code = '直考骨経返令葛'
let scaffold: WebScaffold

beforeAll(async () => {
  scaffold = await launchWebScaffold({ developerTools: true })
  // Cold rendering exercises production Markdown without invoking a provider.
  const recording = await readFile(fixture, 'utf8')
  const text = '# ' + heading + '\n\n' + prose + '\n\n' + pureHan + '\n\n| 説明 | 値 |\n| --- | --- |\n| ' + table + ' | 字形 |\n\n~~~text\n' + code + '\n~~~'
  const seeded = recording.replaceAll('"text":"DONE"', '"text":' + JSON.stringify(text))
  expect(seeded).not.toBe(recording)
  await seedSession(scaffold, seeded, 'regional-fonts')
  await mkdir(output, { recursive: true })
})
afterAll(async () => { await scaffold?.close() })

async function installedFace(page: Page, candidates: readonly string[]): Promise<string> {
  const found = await page.evaluate(async (faces) => {
    const localNames: Record<string, readonly string[]> = {
      'Yu Gothic UI': ['Yu Gothic UI Regular', 'YuGothicUI-Regular'],
      'Hiragino Sans': ['Hiragino Sans W3', 'HiraginoSans-W3'],
      'PingFang SC': ['PingFang SC Regular', 'PingFangSC-Regular'],
      'Noto Sans CJK JP': ['Noto Sans CJK JP Regular', 'NotoSansCJKjp-Regular'],
      'Noto Sans CJK SC': ['Noto Sans CJK SC Regular', 'NotoSansCJKsc-Regular'],
      'Noto Sans JP': ['Noto Sans JP Regular', 'NotoSansJP-Regular'],
      'Noto Sans SC': ['Noto Sans SC Regular', 'NotoSansSC-Regular'],
    }
    for (const [index, family] of faces.entries()) {
      for (const local of [family, ...localNames[family] ?? []]) {
        try {
          // local() accepts full/PostScript names, which can differ from the CSS family.
          await new FontFace('dsh-local-probe-' + index, 'local("' + local + '")').load()
          return family
        } catch { /* Try the next installed full name. */ }
      }
    }
    return undefined
  }, [...candidates])
  if (found === undefined) throw new Error('No installed font among: ' + candidates.join(', '))
  return found
}

async function openConversation(page: Page): Promise<void> {
  await page.goto(scaffold.authenticatedUrl)
  await page.getByRole('treeitem').first().click()
  await page.getByRole('treeitem').nth(1).click()
  await page.getByRole('heading', { name: heading, exact: true }).waitFor()
}

async function drawingControl(target: Locator, expectedFace: string, otherFace: string, name: string, codeRole = false) {
  const style = await target.getAttribute('style')
  const paintedStyle = await target.evaluate((element) => {
    const { fontFamily, fontFeatureSettings } = getComputedStyle(element)
    return { fontFamily, fontFeatureSettings }
  })
  const prefix = codeRole ? await target.evaluate(element => getComputedStyle(element).getPropertyValue('--dsh-font-family-code-latin') + ', ') : ''
  const actual = await target.screenshot()
  try {
    await target.evaluate((element, family) => {
      element.style.setProperty('font-family', family, 'important')
      // Keep each regional reference on its own defaults under the same language.
      element.style.setProperty('font-feature-settings', '"locl" off', 'important')
    }, prefix + '"' + expectedFace + '"')
    const reference = await target.screenshot()
    await target.evaluate((element, family) => { element.style.setProperty('font-family', family, 'important') }, prefix + '"' + otherFace + '"')
    const negative = await target.screenshot()
    const matches = await target.page().evaluate(async (images) => {
      const decoded: ImageData[] = []
      for (const bytes of images) {
        const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/png' }))
        try {
          const canvas = document.createElement('canvas')
          canvas.width = bitmap.width
          canvas.height = bitmap.height
          const context = canvas.getContext('2d')
          if (context === null) throw new Error('Canvas is unavailable for PNG comparison')
          context.drawImage(bitmap, 0, 0)
          decoded.push(context.getImageData(0, 0, bitmap.width, bitmap.height))
        } finally { bitmap.close() }
      }
      const equal = (first: ImageData, other: ImageData) =>
        first.width === other.width && first.height === other.height
        && first.data.every((value, index) => value === other.data[index])
      const [painted, expected, opposite] = decoded
      if (painted === undefined || expected === undefined || opposite === undefined) throw new Error('Missing font control image')
      return {
        matchesExpected: equal(painted, expected),
        matchesOther: equal(painted, opposite),
        regionalControlsDiffer: !equal(expected, opposite),
      }
    }, [Array.from(actual), Array.from(reference), Array.from(negative)])
    await writeFile(join(output, name + '-actual.png'), actual)
    if (!matches.matchesExpected || !matches.regionalControlsDiffer) {
      await writeFile(join(output, name + '-reference.png'), reference)
      await writeFile(join(output, name + '-other.png'), negative)
    }
    expect.soft(matches.regionalControlsDiffer, 'the two control fonts must draw differently: ' + name).toBe(true)
    expect.soft(matches.matchesExpected, 'actual pixels must equal the installed regional reference: ' + name).toBe(true)
    expect.soft(matches.matchesOther, 'actual pixels must differ from the other region: ' + name).toBe(false)
    return { name, expectedFace, otherFace, paintedStyle, ...matches }
  } finally {
    await target.evaluate((element, previous) => {
      if (previous === null) element.removeAttribute('style')
      else element.setAttribute('style', previous)
    }, style)
  }
}

for (const name of selected) {
  if (!(name in engines)) throw new Error('Unsupported DSH_FONT_BROWSERS entry: ' + name)
  const engine = engines[name as keyof typeof engines]
  it(name + ' draws Japanese prose and applies regional priorities in the built application', async () => {
    await scaffold.ctx.settings.update('locale', { preference: 'ja' })
    await scaffold.ctx.settings.update('ui-theme', { cjkGlyphRegion: 'auto' })
    const browser = await engine.launch(name === 'chromium' && process.env.DSH_FONT_CHROMIUM_CHANNEL !== undefined
      ? { channel: process.env.DSH_FONT_CHROMIUM_CHANNEL } : {})
    const resources: { page?: Page } = {}
    onTestFinished(async () => {
      try {
        if (resources.page !== undefined && !resources.page.isClosed()) await resources.page.screenshot({ path: join(output, name + '-final-state.png') })
      } finally { await browser.close() }
    })
    const page = await browser.newPage({ locale: 'ja-JP', viewport: { width: 1440, height: 960 } })
    resources.page = page
    await openConversation(page)
    const japanese = await installedFace(page, ['Hiragino Sans', 'Yu Gothic UI', 'Meiryo', 'Noto Sans JP', 'Noto Sans CJK JP'])
    const chinese = await installedFace(page, ['PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', 'Noto Sans CJK SC'])
    const targets = [
      page.getByRole('heading', { name: heading, exact: true }),
      page.locator('[data-dsh-content] p').filter({ hasText: prose }),
      page.getByRole('cell', { name: table, exact: true }),
      page.locator('pre code').filter({ hasText: code }),
    ]
    const comparisons: Array<Awaited<ReturnType<typeof drawingControl>>> = []
    const report: Record<string, object | string> = { platform: process.platform, browser: browser.version(), engine: name, japanese, chinese, comparisons, commit: process.env.GITHUB_SHA ?? 'local-working-tree' }
    if (name === 'chromium') {
      const cdp = await page.context().newCDPSession(page)
      try {
        await cdp.send('DOM.enable')
        await cdp.send('CSS.enable')
        const documentNode = await cdp.send('DOM.getDocument')
        const fonts: object[] = []
        for (const [index, target] of targets.entries()) {
          await target.evaluate((element, id) => { element.setAttribute('data-font-probe', String(id)) }, index)
          const node = await cdp.send('DOM.querySelector', { nodeId: documentNode.root.nodeId, selector: '[data-font-probe="' + index + '"]' })
          const result = await cdp.send('CSS.getPlatformFontsForNode', { nodeId: node.nodeId })
          fonts.push(result)
          const paintedFamilies = result.fonts.filter(font => font.glyphCount > 0).map(font => font.familyName)
          expect(paintedFamilies.some(family => /Hiragino|Yu Gothic|Meiryo|Noto Sans (?:CJK )?JP/.test(family))).toBe(true)
          expect(paintedFamilies.some(family => /PingFang SC|Microsoft YaHei|Noto Sans (?:CJK )?SC/.test(family))).toBe(false)
        }
        report.drawnFonts = fonts
      } finally { await cdp.detach() }
    }
    await writeFile(join(output, name + '-results.json'), JSON.stringify(report, null, 2) + '\n')
    for (const [index, target] of targets.entries()) {
      comparisons.push(await drawingControl(target, japanese, chinese, name + '-' + index, index === 3))
    }
    await page.screenshot({ path: join(output, name + '-japanese-application.png') })
    // Chinese chrome keeps its region; kana prose still picks Japanese.
    await scaffold.ctx.settings.update('locale', { preference: 'zh' })
    await page.waitForFunction(() => document.documentElement.lang === 'zh-CN')
    expect(await targets[1]!.getAttribute('data-dsh-cjk')).toBe('ja')
    comparisons.push(await drawingControl(targets[0]!, japanese, chinese, name + '-chinese-ui-japanese-heading'))
    comparisons.push(await drawingControl(targets[1]!, japanese, chinese, name + '-chinese-ui-japanese-prose'))
    const interfaceFonts = await page.locator('body').evaluate(element => getComputedStyle(element).getPropertyValue('--dsh-font-family-text-resolved'))
    expect(interfaceFonts).toContain('Microsoft YaHei')
    const unmarked = page.locator('[data-dsh-content] p').filter({ hasText: pureHan })
    expect(await unmarked.getAttribute('data-dsh-cjk')).toBeNull()
    expect(await unmarked.evaluate(element => getComputedStyle(element).fontFamily)).toContain('Microsoft YaHei')
    await scaffold.ctx.settings.update('ui-theme', { cjkGlyphRegion: 'ja' })
    await page.waitForFunction(() => document.body.dataset.dshCjkGlyphRegion === 'ja')
    expect(await page.locator('body').evaluate(element => getComputedStyle(element).getPropertyValue('--dsh-font-family-text-resolved'))).toContain('Microsoft YaHei')
    expect(await targets[3]!.evaluate(element => getComputedStyle(element).fontFamily)).toContain('Yu Gothic UI')
    comparisons.push(await drawingControl(unmarked, japanese, chinese, name + '-manual-pure-han'))
    comparisons.push(await drawingControl(targets[3]!, japanese, chinese, name + '-manual-code', true))
    await unmarked.evaluate((element) => { element.setAttribute('lang', 'zh-Hans') })
    try {
      comparisons.push(await drawingControl(unmarked, chinese, japanese, name + '-explicit-hans-with-manual-ja'))
    } finally { await unmarked.evaluate((element) => { element.removeAttribute('lang') }) }
    const previous = await page.locator('body').evaluate(element => element.style.getPropertyValue('--dsh-font-family-text'))
    await page.locator('body').evaluate((element, family) => { element.style.setProperty('--dsh-font-family-text', '"' + family + '"') }, chinese)
    try { comparisons.push(await drawingControl(targets[1]!, chinese, japanese, name + '-custom-font-priority')) }
    finally {
      await page.locator('body').evaluate((element, value) => {
        if (value === '') element.style.removeProperty('--dsh-font-family-text')
        else element.style.setProperty('--dsh-font-family-text', value)
      }, previous)
    }
    await page.reload()
    await page.getByRole('heading', { name: heading, exact: true }).waitFor()
    expect(await page.locator('body').getAttribute('data-dsh-cjk-glyph-region')).toBe('ja')
    await scaffold.ctx.settings.update('locale', { preference: 'en' })
    await scaffold.ctx.settings.update('ui-theme', { cjkGlyphRegion: 'auto' })
    await page.waitForFunction(() => document.documentElement.lang === 'en' && document.body.dataset.dshCjkGlyphRegion === 'auto')
    expect(await page.locator('body').evaluate(element => getComputedStyle(element).getPropertyValue('--dsh-font-family-text-resolved'))).toContain('Yu Gothic UI')
    comparisons.push(await drawingControl(unmarked, japanese, chinese, name + '-english-ui-japanese-preference'))

    // Exercise the reported macOS Firefox class of problem even when both
    // the interface and browser default to English.
    const englishPage = await browser.newPage({ locale: 'en-US', viewport: { width: 1440, height: 960 } })
    try {
      await openConversation(englishPage)
      expect(await englishPage.locator('html').getAttribute('lang')).toBe('en')
      expect(await englishPage.evaluate(() => navigator.languages.some(locale => /^ja(?:-|$)/i.test(locale)))).toBe(false)
      const japaneseProse = englishPage.locator('[data-dsh-content] p').filter({ hasText: prose })
      expect(await japaneseProse.getAttribute('data-dsh-cjk')).toBe('ja')
      comparisons.push(await drawingControl(japaneseProse, japanese, chinese, name + '-english-ui-japanese-prose'))
    } finally { await englishPage.close() }
    // Explicit-language CSS controls live inside a labeled content subtree.
    const explicit = await page.evaluate(() => {
      const root = document.createElement('div')
      root.dataset.dshContent = ''
      root.setAttribute('aria-label', 'controlled content-language font probe')
      root.innerHTML = '<p lang="zh-Hant">直考骨経<span lang="ko">直考骨経</span><span lang="en">直考骨経</span></p>'
      document.body.append(root)
      try {
        return [...root.querySelectorAll('[lang]')].map(element => ({ lang: element.getAttribute('lang'), family: getComputedStyle(element).fontFamily }))
      } finally { root.remove() }
    })
    expect(explicit[0]?.family).toContain('Microsoft JhengHei')
    expect(explicit[1]?.family).toContain('Malgun Gothic')
    expect(explicit[2]?.family).toContain('Yu Gothic UI')
    report.explicitLanguageCssControls = explicit
    await writeFile(join(output, name + '-results.json'), JSON.stringify(report, null, 2) + '\n')
  })
}
