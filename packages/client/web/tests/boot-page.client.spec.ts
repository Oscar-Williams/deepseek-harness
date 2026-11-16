// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BootPage } from '../src/boot-page.ts'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function mount() {
  const el = document.createElement('div')
  document.body.append(el)
  return { el, page: new BootPage(el) }
}

describe('BootPage', () => {
  it('draws the loading skeleton before any plugin state arrives', () => {
    const { el } = mount()
    expect(el.firstElementChild?.getAttribute('data-dsh-boot')).toBe('')
    expect(el.textContent).toContain('HARNESS')
    expect(el.textContent).toContain('Loading plugins…')
  })

  it('shows Japanese boot copy and keeps the failure diagnostics verbatim', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('ja-JP')
    const { el, page } = mount()
    expect(el.firstElementChild?.getAttribute('lang')).toBe('ja')
    expect(el.textContent).toContain('プラグインを読み込んでいます…')
    page.fail('loader: 初期化に失敗')
    expect(el.textContent).toContain('プラグインを読み込めませんでした')
    expect(el.textContent).toContain('loader: 初期化に失敗')
  })

  it('uses the Desktop preference for a boot failure that arrived before native locale', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US')
    vi.stubGlobal('__DSH_LOCALE__', { read: async () => ({ languages: ['en-US'], preference: 'ja' }) })
    const { el, page } = mount()
    page.fail('loader failure')
    await vi.waitFor(() => expect(el.firstElementChild?.getAttribute('lang')).toBe('ja'))
    expect(el.textContent).toContain('プラグインを読み込めませんでした')
    expect(el.textContent).toContain('loader failure')
  })

  it.each([
    { preference: 1, languages: ['ja-JP'] },
    { preference: null, languages: [1] },
    null,
  ])('retains the browser language when native initialization is malformed', async (value) => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('ja-JP')
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('__DSH_LOCALE__', { read: async () => value })
    const { el } = mount()
    await vi.waitFor(() => expect(warning).toHaveBeenCalledWith(
      'web boot: using browser language after native initialization failed', expect.any(TypeError),
    ))
    expect(el.firstElementChild?.getAttribute('lang')).toBe('ja')
    expect(el.textContent).toContain('プラグインを読み込んでいます…')
  })

  it('keeps loading while entries are active or loading', () => {
    const { el, page } = mount()
    page.setTotal(2)
    const spinner = el.querySelector<HTMLElement>('[data-dsh-boot-spinner]')
    expect(spinner?.style.getPropertyValue('--dsh-boot-arc')).toBe('72deg')
    page.setState('a', 'active')
    expect(spinner?.style.getPropertyValue('--dsh-boot-arc')).toBe('180deg')
    page.setState('b', 'loading')
    expect(el.querySelector('[data-dsh-boot-spinner]')).toBe(spinner)
    page.setState('b', 'active')
    expect(spinner?.style.getPropertyValue('--dsh-boot-arc')).toBe('288deg')
    expect(el.textContent).toContain('Loading plugins…')
    expect(el.textContent).not.toContain('Failed to load plugins')
  })

  it('lists failed entries', () => {
    const { el, page } = mount()
    page.setState('@deepseek-ai/dsh-client-ui-layout', 'failed')
    page.setState('ok', 'active')
    page.setState('@deepseek-ai/dsh-client-ui-tool', 'failed')
    expect(el.textContent).toContain('@deepseek-ai/dsh-client-ui-layout')
    expect(el.textContent).toContain('@deepseek-ai/dsh-client-ui-tool')
    expect(el.textContent).not.toContain('ok')
    expect(el.textContent).not.toContain('Loading plugins…')
  })

  it('shows the complete sweep report', () => {
    const { el, page } = mount()
    const report = 'web boot: 1 entry did not activate\nx: pending (waiting for service: y)'
    page.fail(report)
    page.setState('a', 'active')
    expect(el.textContent).toContain(report)
    expect(el.textContent).not.toContain('Loading plugins…')
  })

  it('detaches on disposal', () => {
    const { el, page } = mount()
    page.dispose()
    expect(el.childNodes).toHaveLength(0)
  })
})
