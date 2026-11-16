/** Regional font data and the shared bootstrap/runtime resolution policy. */
import type { FontFamilies } from './theme-settings.ts'

/** Regions accepted by the durable CJK preference. */
export const CJK_GLYPH_REGIONS = ['auto', 'ja', 'zh-Hans', 'zh-Hant', 'ko'] as const

/** A persisted region, or automatic selection from UI and browser languages. */
export type CjkGlyphRegion = typeof CJK_GLYPH_REGIONS[number]

/** A concrete regional family, or the platform's language-neutral fallback. */
export type FontRegion = Exclude<CjkGlyphRegion, 'auto'> | 'system'

/** Font lists shared by CSS, the startup script and the live theme. */
export const FONT_STACKS = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
  code: '"SF Mono", "JetBrains Mono", "Fira Code", Consolas, "Liberation Mono", Menlo, Courier',
  terminal: 'SFMono-Regular, Menlo, Consolas',
  icons: '"Symbols Nerd Font Mono", "Symbols Nerd Font"',
  ja: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Hiragino Kaku Gothic Pro", "Yu Gothic UI", "Yu Gothic", "Meiryo UI", Meiryo, "Noto Sans JP", "Noto Sans CJK JP"',
  'zh-Hans': '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Noto Sans CJK SC"',
  'zh-Hant': '"PingFang TC", "PingFang HK", "Microsoft JhengHei UI", "Microsoft JhengHei", "Noto Sans TC", "Noto Sans CJK TC", "Noto Sans CJK HK"',
  ko: '"Apple SD Gothic Neo", AppleGothic, "Malgun Gothic", "Noto Sans KR", "Noto Sans CJK KR"',
} as const

/** Fully expanded lists: canvas consumers cannot resolve CSS custom properties. */
export interface ResolvedFonts {
  /** Interface controls follow a CJK interface language. */
  readonly interfaceText: string
  /** Unmarked prose uses the content preference. */
  readonly contentText: string
  /** Latin code faces precede the content region's CJK fonts. */
  readonly code: string
  /** Terminal faces include the optional symbol font. */
  readonly terminal: string
}

/**
 * Identify a CJK region without assigning a region to an unrelated language.
 * @param locale - BCP 47 language tag; explicit script subtags precede region hints.
 * @returns a regional family, or undefined for non-CJK languages.
 */
export function cjkRegionOf(locale: string): Exclude<FontRegion, 'system'> | undefined {
  const parts = locale.toLowerCase().replaceAll('_', '-').split('-')
  const primary = parts[0]
  if (primary === 'ja') return 'ja'
  if (primary === 'ko') return 'ko'
  if (primary !== 'zh' && primary !== 'cmn' && primary !== 'yue') return undefined
  if (parts.includes('hans')) return 'zh-Hans'
  if (parts.includes('hant')) return 'zh-Hant'
  return primary === 'yue' || parts.some(part => ['tw', 'hk', 'mo'].includes(part)) ? 'zh-Hant' : 'zh-Hans'
}

/**
 * Resolve interface and content independently, preserving user font priority.
 * The explicit dependencies also allow the bootstrap to embed this pure function.
 * @param preference - accepted durable region preference.
 * @param locale - current interface language.
 * @param languages - browser languages in preference order.
 * @param custom - normalized user font lists by role.
 * @param stacks - shared font data (passed explicitly by the bootstrap).
 * @param classify - region classifier (passed explicitly by the bootstrap).
 * @returns expanded immutable family lists for DOM and canvas consumers.
 */
export function resolveFontFamilies(
  preference: CjkGlyphRegion,
  locale: string,
  languages: readonly string[],
  custom: FontFamilies,
  stacks: Readonly<Record<keyof typeof FONT_STACKS, string>> = FONT_STACKS,
  classify: typeof cjkRegionOf = cjkRegionOf,
): ResolvedFonts {
  const ui = classify(locale)
  const browser = languages.map(classify).find(region => region !== undefined)
  const content: FontRegion = preference === 'auto' ? ui ?? browser ?? 'system' : preference
  const controls: FontRegion = ui ?? (preference === 'auto' ? browser ?? 'system' : preference)
  const regional = (region: FontRegion): string => region === 'system' ? '' : stacks[region]
  const join = (...families: string[]): string => families.filter(Boolean).join(', ')
  return Object.freeze({
    interfaceText: join(custom.text, regional(controls), stacks.system),
    contentText: join(custom.text, regional(content), stacks.system),
    code: join(custom.code, stacks.code, regional(content), 'ui-monospace, monospace'),
    terminal: join(custom.terminal, stacks.terminal, stacks.icons, regional(content), 'ui-monospace, monospace'),
  })
}

/**
 * CSS variables for explicit language fragments before and after plugin startup.
 * @returns root declarations generated from the same font data as the resolver.
 */
export function regionalFontCss(): string {
  const variables = {
    '--dsh-font-family-text-system': FONT_STACKS.system,
    '--dsh-font-family-code-latin': FONT_STACKS.code,
    '--dsh-font-family-cjk-ja': FONT_STACKS.ja,
    '--dsh-font-family-cjk-hans': FONT_STACKS['zh-Hans'],
    '--dsh-font-family-cjk-hant': FONT_STACKS['zh-Hant'],
    '--dsh-font-family-cjk-ko': FONT_STACKS.ko,
  }
  return ':root{' + Object.entries(variables).map(([name, value]) => name + ':' + value).join(';') + '}'
}
