// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { MarkdownText } from './markdown-test-components.tsx'
import { parseGfm } from '../src/markdown/parse.ts'
import { containsJapaneseProse, explicitContentLanguage } from '../src/markdown/prose-language.ts'
import { createReferenceTargets, renderBlocks } from '../src/markdown/render.tsx'
import { markdownLabels } from './labels.client.ts'

afterEach(() => {
  cleanup()
  document.documentElement.lang = 'en'
})

it.each(['en', 'zh-CN'])('uses Japanese prose hints under the %s shell without setting lang', (locale) => {
  document.documentElement.lang = locale
  const { container } = render(<MarkdownText text={'# 日本語の目標\n\n入力を確認します。\n\n- ｶﾅを確認'} />)
  expect(container.querySelector('h1')?.getAttribute('data-dsh-cjk')).toBe('ja')
  expect(container.querySelector('p')?.getAttribute('data-dsh-cjk')).toBe('ja')
  expect(container.querySelector('li [data-dsh-cjk]')).toBeTruthy()
  expect(container.querySelector('[lang]')).toBeNull()
  expect(container.querySelector('[data-dsh-content]')).toBeTruthy()
})

it.each(['zh-Hant', 'ko', 'en', ''])('protects the explicit content language %j', (lang) => {
  const { container } = render(<MarkdownText text="日本語の入力を確認" lang={lang} />)
  expect(container.querySelector('[data-dsh-content]')?.getAttribute('lang')).toBe(lang)
  expect(container.querySelector('[data-dsh-cjk]')).toBeNull()
})

it('marks table text and leaves fenced and inline code outside inference', () => {
  const { container } = render(<MarkdownText text={'| 説明 | 値 |\n| --- | --- |\n| 入力を確認 | 保存 |\n\n`コード`\n\n~~~js\nconst 変数 = "テスト"\n~~~'} />)
  expect(container.querySelector('td[data-dsh-cjk="ja"]')).toBeTruthy()
  expect(container.querySelector('code[data-dsh-cjk], pre[data-dsh-cjk]')).toBeNull()
  const inline = container.querySelector('p code')
  expect(inline?.parentElement?.hasAttribute('data-dsh-cjk')).toBe(false)
})

it.each(['ー・', 'https://example.com/にほんご', '`テスト`'])('ignores a punctuation, URL or code-only hint: %s', (text) => {
  const { container } = render(<MarkdownText text={text} />)
  expect(container.querySelector('[data-dsh-cjk]')).toBeNull()
})

it('preserves source text and the raw-HTML handling', () => {
  const { container } = render(<MarkdownText text={'<div lang="ko">日本語</div>'} />)
  expect(container.querySelector('div[lang="ko"]')).toBeNull()
  expect(container.textContent).toBe('<div lang="ko">日本語</div>')
})

it('keeps the leading prose node while streaming and respects a content-language change', () => {
  const text = '入力を確認します。\n\nSecond paragraph.\n\nThird paragraph.'
  const { container, rerender } = render(<MarkdownText text={text} streaming />)
  const first = container.querySelector('p')
  expect(first?.getAttribute('data-dsh-cjk')).toBe('ja')
  rerender(<MarkdownText text={text + '\n\nFourth paragraph.'} streaming />)
  expect(container.querySelector('p')).toBe(first)
  rerender(<MarkdownText text={text} streaming lang="ko" />)
  expect(container.querySelector('[data-dsh-cjk]')).toBeNull()
})

it('does not use an explicitly tagged child as a hint for its surrounding prose', () => {
  const root = parseGfm('中文 **かな**')
  const paragraph = root.children[0]
  if (paragraph?.type !== 'paragraph') throw new Error('Missing paragraph')
  const emphasis = paragraph.children.find(node => node.type === 'strong')
  if (emphasis === undefined) throw new Error('Missing strong text')
  emphasis.data = { hProperties: { lang: 'ko' } }
  expect(explicitContentLanguage(emphasis)).toBe('ko')
  expect(containsJapaneseProse(paragraph)).toBe(false)
})

it('preserves authored code languages separately from programming-language labels', () => {
  const root = parseGfm('`かな`\n\n```ts\nconst 日本語 = "確認"\n```')
  const paragraph = root.children[0]
  const fence = root.children[1]
  if (paragraph?.type !== 'paragraph' || fence?.type !== 'code') throw new Error('Missing code fixture')
  const inline = paragraph.children[0]
  if (inline?.type !== 'inlineCode') throw new Error('Missing inline code')
  inline.data = { hProperties: { lang: 'ko' } }
  fence.data = { hProperties: { lang: 'zh-Hant' } }
  const { container } = render(<div data-dsh-content>{renderBlocks(root.children.map((node, key) => ({ node, key })), {
    streaming: false, labels: markdownLabels, fileMentions: undefined, pathImages: undefined,
    omitHtml: false, targets: createReferenceTargets(), footnoteOrder: [], footnoteCounts: new Map(),
  })}</div>)
  expect(container.querySelector('p code')?.getAttribute('lang')).toBe('ko')
  expect(container.querySelector('div[lang="zh-Hant"] pre')).toBeTruthy()
  expect(container.querySelector('[lang="ts"]')).toBeNull()
  expect(container.querySelector('[data-dsh-cjk]')).toBeNull()
})
