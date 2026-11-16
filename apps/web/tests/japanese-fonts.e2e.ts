/** Japanese composer guidance over a persisted recorded conversation. */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { expect, it, onTestFinished } from 'vitest'
import {
  captureStableAria, compareOrRefreshGolden, launchWebScaffold, seedSession, webSnapshotMode,
} from './scaffold.ts'
import { pinBrowserClock, WEB_FIXTURE_TIME } from './support.ts'

const directory = fileURLToPath(new URL('../../../snapshots/web/japanese-fonts', import.meta.url))
const fixture = fileURLToPath(new URL('../../../snapshots/web/seeded-history/session.v3.jsonl', import.meta.url))

it('reads a recorded conversation and shows Japanese composer guidance', async () => {
  const scaffold = await launchWebScaffold()
  onTestFinished(() => scaffold.close())
  // Cold history rendering reuses the recording on every OS without executing its shell calls.
  await seedSession(scaffold, await readFile(fixture, 'utf8'), 'japanese-fonts', undefined, { createdAt: WEB_FIXTURE_TIME })
  const browser = await chromium.launch()
  onTestFinished(() => browser.close())
  const page = await browser.newPage({
    locale: 'ja-JP', viewport: { width: 1440, height: 960 }, timezoneId: 'Asia/Shanghai',
  })
  await pinBrowserClock(page)
  await page.goto(scaffold.authenticatedUrl)
  const group = page.getByRole('treeitem').first()
  await group.click()
  await page.getByRole('treeitem').nth(1).click()
  await page.getByText('DONE', { exact: true }).waitFor()
  const composer = page.locator('[data-composer-input]').first()
  expect(await composer.getAttribute('aria-label')).toBe('メッセージやタスクを入力。/ でコマンド、@ でファイルやセッションを参照')
  await compareOrRefreshGolden(join(directory, 'ui.expected.md'),
    await captureStableAria(page, '[class*="centerCol"]', scaffold.workspaceCwd), webSnapshotMode())
})
