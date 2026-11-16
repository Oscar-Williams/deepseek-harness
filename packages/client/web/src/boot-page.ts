/**
 * Framework-free boot page and failure report. It remains available when a
 * client plugin fails because React arrives only with the UI renderer.
 * @module @deepseek-ai/dsh-client-web/src/boot-page
 */
import type { LoaderEntryState } from './loader-status.ts'
import css from './boot-page.module.css'

const BOOT_COPY = {
  en: { loading: 'Loading plugins…', failed: 'Failed to load plugins' },
  ja: { loading: 'プラグインを読み込んでいます…', failed: 'プラグインを読み込めませんでした' },
} as const

/** Create a div with one module class and optional text. */
function div(className: string | undefined, text?: string): HTMLDivElement {
  const el = document.createElement('div')
  el.className = className ?? ''
  if (text !== undefined) el.textContent = text
  return el
}

/** Kernel-owned page mounted below the application's root element. */
export class BootPage {
  private readonly root: HTMLDivElement
  private readonly card: HTMLDivElement
  private readonly wordmark: HTMLDivElement
  private readonly spinner: HTMLDivElement
  private readonly hint: HTMLDivElement
  private readonly states = new Map<string, LoaderEntryState>()
  private readonly active = new Set<string>()
  private language: keyof typeof BOOT_COPY = 'en'
  private total = 0
  private failure: string | undefined

  /**
   * Build and attach the boot page.
   * @param container - Application mount point.
   */
  constructor(container: HTMLElement) {
    this.root = div(css.boot)
    this.root.dataset.dshBoot = ''
    this.card = div(css.card)
    this.wordmark = div(css.wordmark, 'HARNESS')
    this.spinner = div(css.spinner)
    this.spinner.dataset.dshBootSpinner = ''
    this.hint = div(css.hint)
    this.card.append(this.wordmark, this.spinner, this.hint)
    this.root.append(this.card)
    container.append(this.root)
    const view = container.ownerDocument.defaultView as (Window & {
      __DSH_LOCALE__?: { read(): Promise<unknown> }
    }) | null
    const browserLanguage = view?.navigator.language ?? 'en'
    this.setLanguage(browserLanguage)
    // The boot page precedes the locale plugin, so validate its native IPC reply here.
    void view?.__DSH_LOCALE__?.read().then((value) => {
      if (typeof value !== 'object' || value === null
        || !('preference' in value) || (value.preference !== null && typeof value.preference !== 'string')
        || !('languages' in value) || !Array.isArray(value.languages)
        || !value.languages.every((language: unknown) => typeof language === 'string')) {
        throw new TypeError('web boot: invalid native language initialization')
      }
      this.setLanguage(value.preference ?? value.languages[0] ?? browserLanguage)
    }).catch((error: unknown) => {
      console.warn('web boot: using browser language after native initialization failed', error)
    })
    this.updateProgress()
  }

  /**
   * Set the number of loader entries represented by the progress arc.
   * @param total - Complete boot roster size.
   */
  setTotal(total: number): void {
    this.total = total
    this.updateProgress()
  }

  /**
   * Project one loader entry's fiber state.
   * @param id - Loader entry name.
   * @param state - Projected fiber state.
   */
  setState(id: string, state: LoaderEntryState): void {
    this.states.set(id, state)
    if (state === 'active') this.active.add(id)
    this.updateProgress()
    this.render()
  }

  /**
   * Display the boot failure report.
   * @param message - Failure report text.
   */
  fail(message: string): void {
    this.failure = message
    this.render()
  }

  /** Detach the page before or after the UI renderer takes the mount point. */
  dispose(): void {
    this.root.remove()
  }

  private setLanguage(tag: string): void {
    this.language = /^ja(?:-|$)/i.test(tag) ? 'ja' : 'en'
    this.root.lang = this.language
    this.hint.textContent = BOOT_COPY[this.language].loading
    this.render()
  }

  /** Redraw the state-dependent content below the wordmark. */
  private render(): void {
    const failed = [...this.states].filter(([, state]) => state === 'failed').map(([id]) => id)
    if (this.failure === undefined && failed.length === 0) {
      if (this.spinner.parentElement !== this.card) {
        this.card.replaceChildren(this.wordmark, this.spinner, this.hint)
      }
      return
    }
    const report = div(css.failed)
    report.append(div(css.failedTitle, BOOT_COPY[this.language].failed))
    for (const id of failed) report.append(div(css.failedItem, id))
    if (this.failure !== undefined) report.append(div(css.failedItem, this.failure))
    this.card.replaceChildren(this.wordmark, report)
  }

  /** Grow the rotating arc monotonically as loader entries activate. */
  private updateProgress(): void {
    const ratio = this.total === 0 ? 0 : Math.min(this.active.size / this.total, 1)
    this.spinner.style.setProperty('--dsh-boot-arc', `${String(Math.round(72 + ratio * 216))}deg`)
  }
}
