/** Contextual Japanese terminology and ownership of regional font fallbacks. */
import { globSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'
import { transform } from 'lightningcss'
import type { ReturnedDeclaration } from 'lightningcss'
import { JSDOM } from 'jsdom'

const ROOT = resolve(import.meta.dirname, '..')
const FONT_OWNERS = new Map([
  ['packages/client/ui-theme/src/font-policy.ts', 'Shared regional policy, including pre-plugin bootstrap.'],
  ['packages/client/ui-theme/src/styles/brand-font.css', 'Bundled Montserrat faces and their license.'],
  ['packages/client/ui-theme/src/styles/base.css', 'Theme aliases and the brand-family token.'],
  ['packages/client/web/src/base.css', 'Framework-free document fallback before theme delivery.'],
  ['packages/client/web/src/boot-page.module.css', 'Framework-free boot failure surface.'],
  ['apps/desktop/renderer/welcome.css', 'Independent localized welcome window.'],
  ['apps/desktop/renderer/update-dialog.css', 'Independent localized update window.'],
  ['apps/desktop/renderer/policy-login-loading.html', 'Independent localized login-wait window.'],
])
const REGIONAL_FACE = /PingFang|Microsoft YaHei|Hiragino Sans GB|SimSun|SimHei|Yu Gothic|Meiryo|Noto Sans (?:CJK |JP|SC|TC|KR)/i
const INHERITED = /^(?:inherit|initial|unset|revert(?:-layer)?)$/
const THEME_FONT_VARIABLE = /^(?:--(?:dsw-font|dsh-font-family)-[\w-]+|--ds-font-family-code|--dsh-gate-expression)$/
const GENERIC_FAMILIES = new Set([
  'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded',
  'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'math', 'emoji', 'fangsong',
])
const SHORTHAND_STYLE = /^(?:normal|italic|oblique|small-caps|bold|bolder|lighter|(?:ultra-|extra-|semi-)?(?:condensed|expanded))$/i
const SHORTHAND_SIZE = /^(?:(?:xx?-)?(?:small|large)|xxx-large|medium|smaller|larger)$/i
type FontTokens = Extract<ReturnedDeclaration, { property: 'unparsed' }>['value']['value']

/** One actionable source-ownership or dictionary diagnostic. */
export interface JapaneseExperienceViolation {
  /** Repository-relative source path. */
  file: string
  /** Dictionary key or source concern. */
  key: string
  /** Explanation scoped to the affected use. */
  reason: string
}

/** Context rules apply to named entries, not every occurrence of a loanword. */
export const JAPANESE_TERM_RULES = [
  { owner: 'ui-goal', keys: ['phase.active.disarmed'], rejected: /非アクティブ/, reason: 'An active disarmed goal is waiting for continuation; use 再開待ち.' },
  { owner: 'ui-goal', keys: ['action.clear'], rejected: /クリア/, reason: 'Clearing removes the goal; use 目標を解除.' },
  { owner: 'ui-conversation', keys: ['queue.count', 'queue.edit', 'queue.save', 'input.send.queue', 'settings.enter.queue'], rejected: /キュー/, reason: 'Pending messages use 送信待ち in this surface.' },
  { owner: 'ui-conversation', keys: ['input.send.steer', 'settings.enter.steer', 'queue.steer'], rejected: /ステア/, reason: 'Describe adding instructions to a running task.' },
  { owner: 'ui-jobs', keys: ['section.clear'], rejected: /クリア/, reason: 'This action clears finished jobs, including failures and cancellations.' },
  { owner: 'ui-settings-agent-loop', keys: ['readOnly'], rejected: /保存されます|保存できます/, reason: 'The read-only environment does not save these edits.' },
  { owner: 'ui-settings-shell', keys: ['readOnly'], rejected: /保存されます|保存できます/, reason: 'The read-only environment does not save these edits.' },
  { owner: 'ui-settings-subagent', keys: ['readOnly'], rejected: /保存されます|保存できます/, reason: 'The read-only environment does not save these edits.' },
  { owner: 'ui-settings-web-search', keys: ['readOnly'], rejected: /保存されます|保存できます/, reason: 'The read-only environment does not save these edits.' },
] as const

function object(node: ts.Expression): ts.ObjectLiteralExpression | undefined {
  while (ts.isSatisfiesExpression(node) || ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) node = node.expression
  return ts.isObjectLiteralExpression(node) ? node : undefined
}

/**
 * Extract literal Japanese entries without loading a browser or feature module.
 * @param file - dictionary path.
 * @param source - TypeScript source.
 * @returns typed Japanese keys and values.
 */
export function japaneseEntries(file: string, source: string): Map<string, string> {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
  const entries = new Map<string, string>()
  for (const statement of tree.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== 'ja' || declaration.initializer === undefined) continue
      for (const property of object(declaration.initializer)?.properties ?? []) {
        if (!ts.isPropertyAssignment(property) || !ts.isStringLiteralLike(property.initializer)) continue
        if (ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name)) {
          entries.set(property.name.text, property.initializer.text)
        }
      }
    }
  }
  return entries
}

/**
 * Check only reviewed entries in the owning Japanese dictionary.
 * @param file - source path.
 * @param source - dictionary source; other languages are ignored.
 * @returns contextual terminology violations.
 */
export function terminologyViolations(file: string, source: string): JapaneseExperienceViolation[] {
  const owner = file.replaceAll('\\', '/').split('/')[2]
  const entries = japaneseEntries(file, source)
  return JAPANESE_TERM_RULES.filter(rule => rule.owner === owner).flatMap(rule =>
    rule.keys.flatMap((key) => {
      const text = entries.get(key)
      return text !== undefined && rule.rejected.test(text) ? [{ file, key, reason: rule.reason }] : []
    }))
}

/**
 * Find font declarations outside the shared policy and named independent surfaces.
 * @param file - normalized repository path.
 * @param source - CSS, HTML, TypeScript or TSX source.
 * @returns violations; comments and user-facing dictionary values are not declarations.
 */
export function fontOwnershipViolations(file: string, source: string): JapaneseExperienceViolation[] {
  if (FONT_OWNERS.has(file) || /\/(?:locale|locales)\//.test(file) || /\/locales?\.ts$/.test(file)) return []
  if (!/font|PingFang|YaHei|Hiragino|SimSun|SimHei|Yu Gothic|Meiryo|Noto Sans/i.test(source)) return []
  const concerns = new Set<string>()
  const css = (text: string): void => {
    const aliases = new Map<string, FontTokens>()
    const pending: Array<{ tokens: FontTokens; shorthand: boolean }> = []
    function inspect(tokens: FontTokens, shorthand: boolean, seen = new Set<string>()): { usesTheme: boolean; namedFamily: boolean } {
      let usesTheme = false
      let namedFamily = false
      for (const item of tokens) {
        if (item.type === 'var' && !seen.has(item.value.name.ident)) {
          const { name, fallback } = item.value
          const value = aliases.get(name.ident)
          const visited = new Set([...seen, name.ident])
          const resolved = value === undefined ? undefined : inspect(value, shorthand, visited)
          usesTheme ||= resolved?.usesTheme ?? THEME_FONT_VARIABLE.test(name.ident)
          namedFamily ||= resolved?.namedFamily === true
          if (fallback != null) {
            const fallbackFonts = inspect(fallback, shorthand, visited)
            usesTheme ||= fallbackFonts.usesTheme
            namedFamily ||= fallbackFonts.namedFamily
          }
        }
        if (item.type === 'token') {
          const token = item.value
          if (token.type === 'string' || (token.type === 'ident' && !GENERIC_FAMILIES.has(token.value.toLowerCase())
            && !INHERITED.test(token.value) && !(shorthand && (SHORTHAND_STYLE.test(token.value) || SHORTHAND_SIZE.test(token.value))))) {
            namedFamily = true
          }
        }
      }
      return { usesTheme, namedFamily }
    }
    transform({
      filename: file, code: Buffer.from(text),
      visitor: {
        Declaration(declaration) {
          if (declaration.property === 'font-family' && declaration.value.some(face => !INHERITED.test(face))) concerns.add('font-family must consume a theme variable')
          if (declaration.property === 'font') concerns.add('font shorthand must consume a theme variable')
          if (declaration.property === 'custom' && REGIONAL_FACE.test(JSON.stringify(declaration.value.value))) concerns.add('regional font data belongs to ui-theme')
          if (declaration.property === 'custom') aliases.set(declaration.value.name, declaration.value.value)
          if (declaration.property === 'unparsed' && REGIONAL_FACE.test(JSON.stringify(declaration.value.value))) concerns.add('regional fallback belongs to ui-theme')
          if (declaration.property === 'unparsed' && ['font', 'font-family'].includes(declaration.value.propertyId.property)) {
            const tokens = declaration.value.value
            const token = tokens[0]
            const inherits = tokens.length === 1 && token?.type === 'token' && token.value.type === 'ident' && INHERITED.test(token.value.value)
            if (!inherits) pending.push({ tokens, shorthand: declaration.value.propertyId.property === 'font' })
          }
        },
      },
    })
    for (const { tokens, shorthand } of pending) {
      const { usesTheme, namedFamily } = inspect(tokens, shorthand)
      if (!usesTheme || namedFamily) concerns.add('font variables must resolve through the theme without a component-owned font family')
    }
  }
  const embeddedCss = (text: string): void => {
    if (!/font(?:-family)?\s*:/.test(text)) return
    if (/<[!a-z]/i.test(text)) {
      const fragment = JSDOM.fragment(text)
      for (const style of fragment.querySelectorAll('style')) css(style.textContent)
      for (const element of fragment.querySelectorAll('[style]')) css('*{' + element.getAttribute('style') + '}')
    } else css(text.includes('{') ? text : '*{' + text + '}')
  }
  if (file.endsWith('.css')) css(source)
  else if (file.endsWith('.html')) embeddedCss(source)
  else {
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
    const visit = (node: ts.Node): void => {
      if (ts.isStringLiteralLike(node)) {
        if (REGIONAL_FACE.test(node.text)) concerns.add('regional font data belongs to ui-theme')
        if (ts.isPropertyAssignment(node.parent)
          && (ts.isIdentifier(node.parent.name) || ts.isStringLiteralLike(node.parent.name))
          && ['fontFamily', 'font-family', 'font'].includes(node.parent.name.text)
          && !INHERITED.test(node.text)) css('*{' + (node.parent.name.text === 'font' ? 'font' : 'font-family') + ':' + node.text + '}')
        if (ts.isBinaryExpression(node.parent) && node.parent.right === node
          && ts.isPropertyAccessExpression(node.parent.left) && ['fontFamily', 'font'].includes(node.parent.left.name.text)
          && !INHERITED.test(node.text)) css('*{' + (node.parent.left.name.text === 'font' ? 'font' : 'font-family') + ':' + node.text + '}')
        if (ts.isCallExpression(node.parent) && ts.isPropertyAccessExpression(node.parent.expression)
          && node.parent.expression.name.text === 'setProperty' && node.parent.arguments[1] === node) {
          const property = node.parent.arguments[0]
          if (property !== undefined && ts.isStringLiteralLike(property) && ['font-family', 'font'].includes(property.text)
            && !INHERITED.test(node.text)) css('*{' + property.text + ':' + node.text + '}')
        }
        embeddedCss(node.text)
      }
      if (ts.isTemplateExpression(node)) {
        embeddedCss(node.head.text + node.templateSpans.map(span => 'var(--dsh-gate-expression)' + span.literal.text).join(''))
      }
      ts.forEachChild(node, visit)
    }
    visit(tree)
  }
  return [...concerns].map(reason => ({ file, key: 'font', reason }))
}

/** Inventory is deliberately wider than Client packages: extensions also render UI. */
function sourceFiles(): string[] {
  return [...new Set([
    ...globSync('packages/*/*/src/**/*.{css,ts,tsx,html}', { cwd: ROOT }),
    ...globSync('apps/{web,desktop}/{src,renderer}/**/*.{css,ts,tsx,html}', { cwd: ROOT }),
  ])].map(file => file.replaceAll('\\', '/')).filter(file => !file.endsWith('.d.ts')).sort()
}

function main(): void {
  const files = sourceFiles()
  const dictionaries = files.filter(file => file.endsWith('/src/client/locales.ts'))
  const css = files.filter(file => file.endsWith('.css'))
  if (dictionaries.length < 48 || css.length < 180) throw new Error('verify-japanese-experience: source discovery narrowed; expected at least 48 dictionaries and 180 stylesheets')
  for (const rule of JAPANESE_TERM_RULES) {
    const file = dictionaries.find(path => path.includes('/' + rule.owner + '/'))
    if (file === undefined) throw new Error('Missing reviewed dictionary: ' + rule.owner)
    const entries = japaneseEntries(file, readFileSync(resolve(ROOT, file), 'utf8'))
    for (const key of rule.keys) if (!entries.has(key)) throw new Error('Missing reviewed entry: ' + file + ' [' + key + ']')
  }
  const violations = files.flatMap((file) => {
    const source = readFileSync(resolve(ROOT, file), 'utf8')
    return [...file.endsWith('/locales.ts') ? terminologyViolations(file, source) : [], ...fontOwnershipViolations(file, source)]
  })
  for (const violation of violations) console.error(violation.file + ' [' + violation.key + ']: ' + violation.reason)
  if (violations.length > 0) process.exitCode = 1
  else console.log('verify-japanese-experience: ' + dictionaries.length + ' dictionaries, ' + css.length + ' stylesheets; contextual terminology and font ownership passed.')
}

if (import.meta.filename === resolve(process.argv[1] ?? '')) main()
