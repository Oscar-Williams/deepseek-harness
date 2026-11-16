/**
 * Theme bootstrap row for the browser's pre-plugin interval. Each index
 * render embeds the current durable built-in preference, font sizes, and
 * font-family lists. Head CSS colors the document canvas before script
 * execution; the body script installs the palette selector and font variables
 * that the client presenters adopt.
 */

import type { IndexInjection } from '@deepseek-ai/dsh-host-webserver'
import { FONT_STACKS, cjkRegionOf, regionalFontCss, resolveFontFamilies, type CjkGlyphRegion } from './font-policy.ts'
import {
  DEFAULT_FONT_SIZES, DEFAULT_PREFERENCE, FONT_ROLES, FONT_SIZE_SPECS, fontFamilyVariable, normalizeFontFamily,
  type FontFamilies, type FontSizes, type ThemePreference,
} from './theme-settings.ts'

const LIGHT_BACKGROUND = '#fff'
const DARK_BACKGROUND = '#151517'

/** CSS that colors the document canvas before any script executes. */
function bootThemeStyle(preference: ThemePreference): string {
  const light = `:root{color-scheme:light}body{background-color:${LIGHT_BACKGROUND};--dsh-boot-bg:${LIGHT_BACKGROUND}}`
  const dark = `:root{color-scheme:dark}body{background-color:${DARK_BACKGROUND};--dsh-boot-bg:${DARK_BACKGROUND}}`
  if (preference === 'light') return regionalFontCss() + light
  if (preference === 'dark') return regionalFontCss() + dark
  return regionalFontCss() + `${light}@media(prefers-color-scheme:dark){${dark}}`
}

/** Build the body script that installs the palette selector and font variables. */
function bootThemeBodyScript(
  preference: ThemePreference, fontSizes: FontSizes, fontFamilies: FontFamilies, cjkGlyphRegion: CjkGlyphRegion,
): string {
  const sizes = FONT_ROLES.map(role =>
    `\n  document.body.style.setProperty(${JSON.stringify(FONT_SIZE_SPECS[role].variable)}, ${JSON.stringify(`${fontSizes[role]}px`)})`).join('')
  const families = FONT_ROLES.flatMap((kind) => {
    const list = normalizeFontFamily(fontFamilies[kind])
    return list === '' ? [] : [`\n  document.body.style.setProperty(${JSON.stringify(fontFamilyVariable(kind))}, ${JSON.stringify(list)})`]
  }).join('')
  return `(() => {
  const preference = ${JSON.stringify(preference)}
  const systemDark = preference === 'system'
    && typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-color-scheme: dark)').matches
  const dark = preference === 'dark' || systemDark
  const classify = (${cjkRegionOf.toString()})
  const resolve = (${resolveFontFamilies.toString()})
  const fonts = resolve(${JSON.stringify(cjkGlyphRegion)}, document.documentElement.lang,
    typeof navigator === 'undefined' ? [] : navigator.languages,
    ${JSON.stringify({ text: normalizeFontFamily(fontFamilies.text), code: normalizeFontFamily(fontFamilies.code), terminal: normalizeFontFamily(fontFamilies.terminal) })},
    ${JSON.stringify(FONT_STACKS)}, classify)
  document.body.dataset.dshCjkGlyphRegion = ${JSON.stringify(cjkGlyphRegion)}
  for (const [role, token] of Object.entries({
    interfaceText: '--dsh-font-family-text-resolved', contentText: '--dsh-font-family-content-resolved',
    code: '--dsh-font-family-code-resolved', terminal: '--dsh-font-family-terminal-resolved',
  })) document.body.style.setProperty(token, fonts[role])
  document.documentElement.dataset.dsThemeSource = preference
  document.body.toggleAttribute('data-ds-dark-theme', dark)${sizes}${families}
})()`
}

/**
 * Theme bootstrap rows: head CSS colors the document canvas before
 * first paint, then the body script installs the palette selector and font
 * size and font families before the shell mount and module script.
 * @param preference - Current Host-backed built-in preference.
 * @param fontSizes - Current Host-backed font sizes in px by role.
 * @param fontFamilies - Current Host-backed font lists; each is normalized before embedding.
 * @param cjkGlyphRegion - Content region preserved until live settings arrive.
 * @returns head and body script rows in execution order.
 */
export function bootThemeInjections(
  preference: ThemePreference = DEFAULT_PREFERENCE,
  fontSizes: FontSizes = DEFAULT_FONT_SIZES,
  fontFamilies: FontFamilies = { text: '', code: '', terminal: '' },
  cjkGlyphRegion: CjkGlyphRegion = 'auto',
): IndexInjection[] {
  return [
    { kind: 'style', text: bootThemeStyle(preference) },
    { kind: 'script', placement: 'body', text: bootThemeBodyScript(preference, fontSizes, fontFamilies, cjkGlyphRegion) },
  ]
}
