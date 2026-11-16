import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const styles = readFileSync(new URL('../src/styles/base.css', import.meta.url), 'utf8')

function families(token: string): string[] {
  const declaration = new RegExp('^\\s*' + token + ':\\s*([^;]+);', 'm').exec(styles)
  return declaration?.[1]?.split(',').map(face => face.trim().replace(/^['"]|['"]$/g, '')) ?? []
}

it('keeps Japanese OS faces ahead of optional Japanese fonts', () => {
  const ja = families('--dsh-font-family-cjk-ja')
  expect(ja).toEqual(expect.arrayContaining(['Hiragino Sans', 'Yu Gothic UI', 'Yu Gothic', 'Noto Sans JP']))
  expect(ja.indexOf('Hiragino Sans')).toBeLessThan(ja.indexOf('Noto Sans JP'))
  expect(ja.indexOf('Yu Gothic UI')).toBeLessThan(ja.indexOf('Yu Gothic'))
  expect(ja.indexOf('Yu Gothic')).toBeLessThan(ja.indexOf('Noto Sans JP'))
})

it.each([
  ['ja', 'Hiragino Sans'], ['ko', 'Malgun Gothic'], ['hant', 'Microsoft JhengHei'],
])('provides a regional fallback for %s', (region, installedFace) => {
  const stack = families('--dsh-font-family-cjk-' + region)
  expect(stack).toContain(installedFace)
  expect(stack).not.toContain('PingFang SC')
  expect(stack).not.toContain('Microsoft YaHei')
})
