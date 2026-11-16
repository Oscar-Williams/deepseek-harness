const { chromium } = require(process.argv[2])
const { createServer } = require('node:http')
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const root = process.argv[3]
const output = process.argv[4]
const checkout = process.argv[5]
const project = path.join(output, 'jp-flow-workspace')
fs.mkdirSync(project, { recursive: true })
const overlay = path.join(output, 'isolated-web.overlay.yml')
const directoryPicker = fs.readFileSync(path.join(root,'apps/web/tests/pin-browse-picker.overlay.yml'), 'utf8')
fs.writeFileSync(overlay, directoryPicker + '\n- id: workspace-controller\n  config:\n    documentsDirectory: ' + JSON.stringify(path.join(output, 'Documents')) + '\n')

const japaneseInput = '日本語の入力を確認'
const responseText = '保存した内容を読み取りました。' + '\n\n' + '~~~js' + '\nconst 変数 = "作業を保存"\n~~~'
const messages = [
  ['message_start',{message:{id:'japanese-rendering-fixture',type:'message',role:'assistant',content:[],model:'deepseek-v4-pro',usage:{input_tokens:2,output_tokens:0}}}],
  ['content_block_start',{index:0,content_block:{type:'text',text:''}}],
  ['content_block_delta',{index:0,delta:{type:'text_delta',text:responseText}}],
  ['content_block_stop',{index:0}],
  ['message_delta',{delta:{stop_reason:'end_turn'},usage:{output_tokens:24}}],
  ['message_stop',{}],
]
const sanitize = value => String(value).replace(/http:\/\/127\.0\.0\.1:\d+\S*/g, '<local URL>')
let last = 'provider start'
let providerRequests = 0
const result = { commit:checkout, platform:process.platform, provider:'isolated locally streamed fixture via normal DSH Web protocol' }
const provider = createServer((request, response) => {
  request.resume()
  request.on('end', async () => {
    if (request.method !== 'POST') {
      response.writeHead(200, {'content-type':'application/json'})
      response.end('{"data":[]}')
      return
    }
    providerRequests++
    response.writeHead(200, { 'content-type':'text/event-stream' })
    for (const [type, payload] of messages) {
      if (response.destroyed) return
      response.write('event: ' + type + '\ndata: ' + JSON.stringify({type,...payload}) + '\n\n')
      await new Promise(resolve => setTimeout(resolve, 40))
    }
    response.end()
  })
})
let child
let browser
async function run() {
  await new Promise(resolve => provider.listen(0,'127.0.0.1',resolve))
  child = spawn(process.execPath, [path.join(root,'apps/cli/lib/bin.js'), 'web','--patch',overlay,'--no-open','--port','0'], {
    cwd:project,
    windowsHide:true,
    env:{...process.env, DSH_HOME:path.join(output,'jp-flow-profile'), DSH_AGENTS_HOME:path.join(output,'jp-flow-agents'),
      DEEPSEEK_API_KEY:'local-proof-key',DEEPSEEK_BASE_URL:'http://127.0.0.1:' + provider.address().port,
      TSX_TSCONFIG_PATH:path.join(root,'tsconfig.json')},
    stdio:['ignore','pipe','pipe'],
  })
  const url = await new Promise((resolve,reject)=>{
    const timer = setTimeout(()=>reject(new Error('Built Web Host did not become ready')),90_000)
    let log = ''
    for (const stream of [child.stdout,child.stderr]) {
      stream.on('data', chunk=>{
        log += chunk
        fs.appendFileSync(path.join(output,'jp-flow-host.log'), sanitize(chunk))
        const local = log.match(/http:\/\/127\.0\.0\.1:\d+\S+/)?.[0]
        if (local) { clearTimeout(timer); resolve(local) }
      })
    }
    child.on('error',error=>{clearTimeout(timer);reject(error)})
    child.on('exit', code => {clearTimeout(timer); reject(new Error('Host exited before readiness ('+code+')'))})
  })
  browser = await chromium.launch({channel:'msedge',headless:true})
  result.browser = browser.version()
  const page = await browser.newPage({locale:'ja-JP',viewport:{width:1470,height:900},colorScheme:'light'})
  page.setDefaultTimeout(10000)
  await page.goto(url)
  await page.waitForFunction(()=>document.documentElement.lang==='ja')
  last = 'first-run notice'
  for (const [name, button] of [['プレビューに関するお知らせ','続ける'],['はじめに','閉じる']]) {
    const dialog = page.getByRole('dialog',{name,exact:true})
    if (await dialog.waitFor({timeout:3500}).then(()=>true,()=>false)) {
      await dialog.getByRole('button',{name:button,exact:true}).click()
      await dialog.waitFor({state:'hidden'})
    }
  }
  last = 'workspace and Japanese composer'
  const composer = page.locator('[data-composer-input][contenteditable="true"]')
  if (!(await composer.count())) {
    await page.getByRole('button',{name:'ワークスペースを追加',exact:true}).click()
    const directory = page.getByRole('dialog', { name:'ワークスペースディレクトリを選択' })
    await directory.getByRole('button',{name:'パスを編集',exact:true}).click()
    const edit = directory.getByRole('textbox',{name:'パスを編集',exact:true})
    await edit.fill(project)
    await edit.press('Enter')
    await directory.getByRole('button',{name:'開く',exact:true}).click()
  }
  await composer.waitFor()
  const cdp = await page.context().newCDPSession(page)
  await composer.evaluate(el => {
    window.compositionEvents = []
    for (const type of ['compositionstart','compositionupdate','compositionend']) {
      el.addEventListener(type,event => window.compositionEvents.push({type,data:event.data,isTrusted:event.isTrusted}))
    }
  })
  await composer.click()
  await cdp.send('Input.imeSetComposition',{text:'にほんご',selectionStart:0,selectionEnd:4})
  await cdp.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})
  await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})
  await cdp.send('Input.insertText',{text:japaneseInput})
  await page.waitForFunction(text=>document.querySelector('[data-composer-input]').textContent===text,japaneseInput)
  const ime = await composer.evaluate(el=>({
    text:el.textContent,
    events:window.compositionEvents,
    editorGuarded:el.translate===false && Boolean(el.closest('.notranslate[translate="no"]')),
    toolbarGuarded:[...document.querySelectorAll('button')].some(btn=>btn.getAttribute('aria-label')==='メッセージを送信' && btn.translate===false),
  }))
  if (!ime.editorGuarded || !ime.toolbarGuarded || !ime.events.some(event=>event.type==='compositionend' && event.data===japaneseInput)) {
    throw new Error('Composer event failed ' + JSON.stringify(ime))
  }
  if(providerRequests !== 0) throw new Error('Enter sent the draft during composition')
  result.ime={ ...ime, requestsDuringComposition:providerRequests }
  last = 'local Japanese conversation'
  await page.getByRole('button',{name:'メッセージを送信',exact:true}).click()
  const answer=page.locator('p').filter({hasText:/^保存した内容を読み取りました。$/})
  await answer.waitFor({timeout:25_000})
  const code=page.locator('pre').filter({hasText:'作業を保存'}).first()
  const eligible = await answer.evaluate(el=>el.translate)
  if (!eligible || !(await code.count())) throw new Error('Assistant message eligibility or code rendering is missing')
  result.conversation = {answer:await answer.innerText(), translationEligible:eligible, codeRendered:true}
  await page.screenshot({path:path.join(output,'web-japanese-session.png')})
  last = 'trajectory table'
  await page.getByRole('tab',{name:'実行履歴',exact:true}).click()
  const traceTable = page.locator('[data-trajectory-scroll] table')
  await traceTable.waitFor()
  await page.evaluate(() => document.fonts.ready)
  const traces = await traceTable.evaluate(table => {
    const fontTexts = []
    const walker = document.createTreeWalker(table, NodeFilter.SHOW_TEXT)
    for(let text=walker.nextNode();text && fontTexts.length<8;text=walker.nextNode()){
      if(!/[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text.textContent)) continue
      const element=text.parentElement
      const bounds=element.getBoundingClientRect()
      const style=getComputedStyle(element)
      if(bounds.width<=1||bounds.height<=1||style.visibility!=='visible') continue
      element.id='dsh-ja-trajectory-proof-'+fontTexts.length
      fontTexts.push({ id:element.id, cell:text.textContent.trim().slice(0,80), family:style.fontFamily })
    }
    return fontTexts
  })
  if (traces.length===0) throw new Error('No visible Japanese trajectory text was rendered')
  await cdp.send('DOM.enable')
  await cdp.send('CSS.enable')
  const {root:traceDocument}=await cdp.send('DOM.getDocument')
  for(const trace of traces){
    const {nodeId:traceId}=await cdp.send('DOM.querySelector',{nodeId:traceDocument.nodeId,selector:'#'+trace.id})
    const {fonts}=await cdp.send('CSS.getPlatformFontsForNode',{nodeId:traceId})
    trace.fonts=fonts.map(font=>({family:font.familyName,glyphs:font.glyphCount}))
  }
  result.trajectory=traces
  if(!traces.some(trace=>trace.fonts.some(font=>font.family==='Yu Gothic UI'&&font.glyphs>0))){
    throw new Error('Japanese trajectory font was not drawn: ' + JSON.stringify(traces))
  }
  await page.getByRole('tab',{name:'チャット',exact:true}).click()
  last = 'real terminal available'
  const expand=page.locator('[data-sidebar-right-expand]')
  if (await expand.isVisible()) await expand.click()
  const entry=page.locator('[data-sidebar-right-guide-entry="terminal"]')
  if (!await entry.isVisible()) await page.locator('[data-dockkit-add-tab]').click()
  await entry.getByRole('button',{name:/新しいターミナル/}).click()
  const terminalRows=page.locator('.xterm-rows:visible')
  const terminalInput=page.locator('.xterm-helper-textarea:visible')
  await terminalInput.waitFor({timeout:17000})
  await page.waitForFunction(() => document.querySelector('.xterm-rows')?.textContent.includes('>'))
  async function command(text) {
    await terminalInput.click()
    await page.keyboard.insertText(text)
    await page.keyboard.press('Enter')
  }
  const marker = '入力と保存を確認'
  await command('chcp 65001')
  await command('prompt DSH$G$S')
  await command('cls')
  await command('set DSH_LOCALE_TEST_MARKER=17349')
  await command('echo ' + marker + ':%DSH_LOCALE_TEST_MARKER%')
  await page.waitForFunction(text=>document.querySelector('.xterm-rows')?.textContent.includes(text),marker+':17349',{timeout:8500})

  await terminalRows.evaluate(el=>{window.localeProofRows=el})
  await cdp.send('DOM.enable')
  await cdp.send('CSS.enable')
  async function fontReport(locale) {
    await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))})
    const rows = await terminalRows.evaluate((container,marker)=>{
      const row=[...container.children].findLast(el=>el.textContent.includes(marker))
      if (!row) return null
      row.id='jp-proof-terminal-row'
      return { family:getComputedStyle(row).fontFamily, sameNode:window.localeProofRows===document.querySelector('.xterm-rows') }
    },marker)
    if (!rows) {
      const rowTexts = await terminalRows.evaluate(el => [...el.children].map(row => row.textContent))
      throw new Error('Marker not found on the PTY output row: ' + JSON.stringify(rowTexts.map(text=>text.replace(/^[A-Z]:\\.*?>/,'<workspace>'))))
    }
    const {root:dom}=await cdp.send('DOM.getDocument')
    const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:dom.nodeId,selector:'#jp-proof-terminal-row'})
    const {fonts}=await cdp.send('CSS.getPlatformFontsForNode',{nodeId})
    return { locale, ...rows, actual:fonts.map(font=>({family:font.familyName,glyphs:font.glyphCount})) }
  }
  const before=await fontReport('ja')
  last='language switching with the same terminal'
  await page.getByRole('button',{name:'アカウントメニュー',exact:true}).click()
  await page.getByRole('menuitem',{name:'設定',exact:true}).click()
  await page.getByRole('dialog',{name:'設定',exact:true}).getByRole('button',{name:'日本語',exact:true}).click()
  await page.getByRole('menuitem',{name:'中文',exact:true}).click()
  await page.waitForFunction(()=>document.documentElement.lang==='zh-CN')
  await page.keyboard.press('Escape')
  await terminalRows.waitFor()
  const after=await fontReport('zh-CN')
  if (!/^.*Yu Gothic UI/.test(before.family) || !/Microsoft YaHei/.test(after.family) || /Yu Gothic UI/.test(after.family) || !after.sameNode) {
    throw new Error('Terminal font/identity assertion failed ' + JSON.stringify({before,after}))
  }
  last = 'Japanese character forms in the Chinese interface'
  await page.getByRole('button',{name:'账号菜单',exact:true}).click()
  await page.getByRole('menuitem',{name:'设置',exact:true}).click()
  const settings = page.getByRole('dialog',{name:'设置',exact:true})
  await settings.getByRole('button',{name:'更多字体设置',exact:true}).click()
  await settings.getByRole('button',{name:'CJK 字形',exact:true}).click()
  await page.getByRole('menuitem',{name:'日文',exact:true}).click()
  await page.waitForFunction(()=>document.body.dataset.dshCjkGlyphRegion==='ja')
  const interfaceFonts = await page.locator('body').evaluate(el => getComputedStyle(el).getPropertyValue('--dsh-font-family-text-resolved'))
  await page.keyboard.press('Escape')
  await terminalRows.waitFor()
  const override=await fontReport('zh-CN / ja')
  if (!override.sameNode || !/Yu Gothic UI/.test(override.family) || !/Microsoft YaHei/.test(interfaceFonts)) {
    throw new Error('Changing character forms must update the same terminal and preserve Chinese controls')
  }
  await command('echo still-%DSH_LOCALE_TEST_MARKER%')
  await page.waitForFunction(()=>document.querySelector('.xterm-rows')?.textContent.includes('still-17349'))
  result.terminal = { before,after, override, interfaceFonts, sameProcessEnvironment:true, terminalRenderedOutput:'still-17349' }
  await terminalRows.screenshot({path:path.join(output,'web-terminal-switch.png')})
}
run().catch(error=>{process.exitCode=1;result.failure={step:last,message:sanitize(error.message)}; console.error(JSON.stringify(result.failure))})
  .finally(async()=>{
    await browser?.close()
    if (child && child.exitCode === null && child.signalCode === null) {
      const closed = new Promise(resolve => child.once('close', resolve))
      child.kill()
      await closed
    }
    provider.closeAllConnections()
    provider.close()
    fs.writeFileSync(path.join(output,'web-flow-result.json'),JSON.stringify(result,null,2)+'\n')
    console.log(JSON.stringify(result))
  })
