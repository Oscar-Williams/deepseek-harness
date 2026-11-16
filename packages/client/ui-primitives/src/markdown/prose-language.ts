/** Font-only Japanese hints for natural-language Markdown blocks. */
import type * as Md from 'mdast'

/**
 * Read a language explicitly supplied by a supported parser node.
 * @param node - parsed Markdown node; raw HTML remains literal.
 * @returns the authored language attribute, including an explicit empty value.
 */
export function explicitContentLanguage(node: Md.Nodes): string | undefined {
  const attributes = node.data !== undefined && 'hProperties' in node.data ? node.data.hProperties : undefined
  return typeof attributes === 'object' && attributes !== null && 'lang' in attributes
    && typeof attributes.lang === 'string' ? attributes.lang : undefined
}

/**
 * Whether an explicit language permits Japanese inference.
 * @param language - content-owned language, absent when only the shell supplies one.
 * @returns false for explicit non-Japanese or unknown content languages.
 */
export function permitsJapaneseInference(language: string | undefined): boolean {
  return language === undefined || /^ja(?:-|$)/i.test(language)
}

/**
 * Find kana in prose while excluding code, formulae, raw HTML and URL text.
 * @param node - natural-language block or one of its inline children.
 * @returns whether the visible prose contains Japanese kana letters.
 */
export function containsJapaneseProse(node: Md.Nodes): boolean {
  if (explicitContentLanguage(node) !== undefined) return false
  if (node.type === 'text') return /[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(node.value.replace(/(?:https?:\/\/|mailto:)\S+/g, ''))
  if (['code', 'inlineCode', 'math', 'inlineMath', 'html', 'image', 'definition'].includes(node.type)) return false
  return 'children' in node && node.children.some(containsJapaneseProse)
}

/**
 * Attributes for a prose block, preserving explicit content language.
 * @param node - paragraph, heading, cell or tight-list paragraph.
 * @param language - inherited content-owned language.
 * @param blocked - whether a content ancestor explicitly disallows inference.
 * @returns authored language and an optional font hint; no inferred lang is emitted.
 */
export function proseAttributes(
  node: Md.Nodes, language: string | undefined, blocked: boolean,
): { lang?: string; 'data-dsh-cjk'?: 'ja' } {
  const own = explicitContentLanguage(node)
  const attributes: { lang?: string; 'data-dsh-cjk'?: 'ja' } = own === undefined ? {} : { lang: own }
  if (!blocked && language === undefined && permitsJapaneseInference(own) && containsJapaneseProse(node)) {
    attributes['data-dsh-cjk'] = 'ja'
  }
  return attributes
}
