/** Positive and negative boundaries of the focused Japanese experience gate. */
import { describe, expect, it } from 'vitest'
import { fontOwnershipViolations, japaneseEntries, terminologyViolations } from './verify-japanese-experience.ts'

describe('contextual Japanese terminology', () => {
  it('reads quoted keys through satisfies and ignores other locale objects', () => {
    const source = "const en = { 'action.clear': 'クリア' }; const ja = ({ 'action.clear': '目標を解除' } as const) satisfies Record<string, string>"
    expect([...japaneseEntries('locales.ts', source)]).toEqual([['action.clear', '目標を解除']])
    expect(terminologyViolations('packages/client/ui-goal/src/client/locales.ts', source)).toEqual([])
  })
  it('rejects an inactive translation of a goal waiting for continuation', () => {
    expect(terminologyViolations('packages/client/ui-goal/src/client/locales.ts', "const ja = { 'phase.active.disarmed': '非アクティブな目標' }")).toHaveLength(1)
  })
  it('allows the same loanwords in unrelated developer terminology', () => {
    const source = "const ja = { 'command.clear': 'clear コマンド', 'checkpoint': 'チェックポイント', 'state': 'アクティブ' }"
    expect(terminologyViolations('packages/client/ui-commands/src/client/locales.ts', source)).toEqual([])
  })
  it.each(['input.send.queue', 'settings.enter.queue', 'queue.count'])('rejects an opaque message-queue label at %s', (key) => {
    const file = 'packages/client/ui-conversation/src/client/locales.ts'
    expect(terminologyViolations(file, "const ja = { '" + key + "': 'キュー' }")).toHaveLength(1)
    expect(terminologyViolations(file, "const ja = { '" + key + "': '送信待ちに追加' }")).toEqual([])
  })
  it('rejects a read-only promise to save and allows an explicit statement that edits are not saved', () => {
    const file = 'packages/client/ui-settings-shell/src/client/locales.ts'
    expect(terminologyViolations(file, "const ja = { readOnly: '変更は保存されます' }")).toHaveLength(1)
    expect(terminologyViolations(file, "const ja = { readOnly: '変更は保存されません' }")).toEqual([])
  })
})

describe('font ownership', () => {
  it.each([
    ['css', 'a { font-family: "Microsoft YaHei", sans-serif }'],
    ['css', 'a { font: 14px Arial }'],
    ['css', 'a { font: var(--dsw-font-xs-13) Arial }'],
    ['css', 'a { font-family: Inter, var(--dsw-font-family) }'],
    ['css', 'a { font-family: var(--dsw-font-family, Arial) }'],
    ['css', 'a { font-family:var(--unowned-font, Arial) }'],
    ['css', 'a{--local-font:Arial;font-family:var(--local-font)}'],
    ['css', 'a{--local-font:var(--local-font);font-family:var(--local-font)}'],
    ['css', 'a { --my-cjk: "PingFang SC"; font-family:var(--my-cjk) }'],
    ['tsx', 'const style = { fontFamily: "Microsoft YaHei" }'],
    ['tsx', 'const style = { fontFamily: "Inter, var(--dsw-font-family)" }'],
    ['tsx', 'const css = `a { font-family: Arial }`'],
    ['html', '<style>a {font-family:Arial}</style><p>text</p>'],
    ['html', '<p style="font-family:Arial">text</p>'],
    ['tsx', 'element.style.fontFamily = "Arial"'],
    ['tsx', 'element.style.setProperty("font-family", "Arial")'],
  ])('rejects a new bypass in %s', (extension, source) => {
    expect(fontOwnershipViolations('packages/client/ui-example/src/view.' + extension, source).length).toBeGreaterThan(0)
  })
  it.each([
    ['css', 'a{font-family:var(--dsw-font-family);font:inherit}'],
    ['css', 'a{font: 500 12px/16px var(--ds-font-family-code, monospace)}'],
    ['css', '/* font-family:Arial */ a{font-family:inherit}'],
    ['css', 'a{--local-font:var(--dsw-font-markdown-code-block);font:var(--local-font)}'],
    ['tsx', 'const style = { fontFamily: theme.resolvedFonts.terminal }'],
    ['tsx', 'const style = { fontFamily: "var(--ds-font-family-code)" }'],
    ['html', '<!-- <p style="font-family:Arial"> -->'],
    ['tsx', 'const style = `a{font-family:var(--dsw-font-family);width:${width}px}`'],
  ])('allows theme consumers and comments in %s', (extension, source) => {
    expect(fontOwnershipViolations('packages/client/ui-example/src/view.' + extension, source)).toEqual([])
  })
  it('keeps named bootstrap and native-window owners, while catching a new neighboring owner', () => {
    const css = 'a{font-family:"Yu Gothic UI",sans-serif}'
    expect(fontOwnershipViolations('apps/desktop/renderer/welcome.css', css)).toEqual([])
    expect(fontOwnershipViolations('apps/desktop/renderer/another-window.css', css)).toHaveLength(1)
    expect(fontOwnershipViolations('packages/client/ui-example/src/locales.ts', "const ja={text:'Yu Gothic UI'}")).toEqual([])
  })
})
