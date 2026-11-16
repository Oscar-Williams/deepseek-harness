# rc.3 复现与采用

基线为官方 `38a6a5c965aa99ab525161efb7cc5cf1fe62fced`，候选为 `e944ab650c861cb7dc697dab718b88fdff884890`。按[提交表](../README.md#提交与采用)选择改动时，先采用共享字体策略，再采用正文适配与后续检查。文案可以单独应用到基线。分支提供完整上游历史。

```powershell
git clone --filter=blob:none --single-branch --branch fix/japanese-product-experience-rc3 https://github.com/Oscar-Williams/deepseek-harness.git dsh-japanese-source
Set-Location -LiteralPath ./dsh-japanese-source
git switch --detach e944ab650c861cb7dc697dab718b88fdff884890
corepack pnpm install --frozen-lockfile
$env:DSH_GATE_CONCURRENCY = '1'
corepack pnpm run build:artifacts --serial
corepack pnpm run build:check --serial
```

## 主窗口的字形选择

将 `DSH_HOME` 指向空的临时目录后，从源码运行 Web。工作区使用测试文件，浏览器独立配置避免借用日常会话。

```powershell
$env:DSH_HOME = Join-Path ([IO.Path]::GetTempPath()) ('dsh-ja-' + [guid]::NewGuid().ToString('N'))
corepack pnpm dsh web --patch apps/web/tests/pin-browse-picker.overlay.yml --no-open --port 0
```

1. 在「设置 → 常规」选日本語。展开「その他のフォント設定」，把「漢字の字形」设为「自動」。查看含假名的正文、行内代码和围栏代码。
2. 切到中文，自动模式下用含假名和纯汉字的两段回复作对照。日文段落使用日文字形，中文控件和未标注的纯汉字段落使用简体。
3. 在「更多字体设置 → CJK 字形」选择「日文」，查看纯汉字段落、代码与终端。重载后检查选择仍在。回到「自动」并将界面换成 English，以浏览器的日语偏好验证地区回退。使用指定字体时对照原有自定义设置。
4. Chrome/Edge 的 DevTools 可记录 `CSS.getPlatformFontsForNode`。Firefox 的检查器 Fonts 面板可查看实际字体。码位「直、考、骨、経」用于观察字形。设置作用于整条实际渲染路径。

## 定向测试、会话和终端

安装项目所用 Playwright 浏览器，或在 Windows 指定已安装的 `chrome` / `msedge`。录制会话通过现有持久化接口恢复，Web 字形用例检查设置重载、显式语种、代码和绘制对照。

```powershell
$env:DSH_SNAPSHOT = 'replay'
$env:DSH_FONT_CHROMIUM_CHANNEL = 'chrome'
corepack pnpm exec vitest run --config vitest.web.config.ts apps/web/tests/japanese-fonts.e2e.ts apps/web/tests/regional-fonts.e2e.ts --maxWorkers=1
corepack pnpm run check:i18n
corepack pnpm run verify-client-ui-i18n
```

Windows 可在独立目录获取审阅分支并运行 [Windows Web 复现脚本](windows-web-flow.cjs)。脚本由正常 CLI 启动隔离 Host，回环 SSE 返回样例消息，使用已安装的 Edge。脚本记录 Chromium 组合事件、整个输入区的翻译保护、会话渲染、真实 cmd 和切换前后的字体，最后关闭本轮创建的浏览器与 Host。

```powershell
$review = Join-Path (Split-Path $PWD.Path -Parent) 'dsh-japanese-review'
git clone --single-branch --branch review/japanese-experience https://github.com/Oscar-Williams/deepseek-harness.git $review
$playwright = node -p "require.resolve('playwright',{paths:[require('node:path').resolve('apps/web')]})"
$run = Join-Path ([IO.Path]::GetTempPath()) ('dsh-ja-proof-' + [guid]::NewGuid().ToString('N'))
$commit = git rev-parse HEAD
node (Join-Path $review 'repro/windows-web-flow.cjs') $playwright $PWD.Path $run $commit
```

实机组合输入在 Windows 已安装「日语 → 基本输入法 → Microsoft IME」时操作。在输入框聚焦后切换到日本語，点 `A` 切到 `あ`。输入 `nihongo` 且可见 `にほんご`，用空格选词，再按一次 Enter 确认。确认后检查草稿仍在且没有新增消息。继续输入后，明确点发送，查看稿件和回复。浏览器翻译复验只使用样例会话，核对正文与整块输入区。

## 桌面与原生安装器

先正常退出已安装的 DSH App。测试 Desktop 时分别为 `DSH_HOME` 和 `DSH_DESKTOP_USER_DATA_DIR` 指定空目录，再从源码运行 `corepack pnpm run dev:desktop`。窗口语言缓存和 Host 设置均位于候选目录。欢迎、登录等待、普通与强制更新可以使用隔离 IPC 或更新夹具制造相应状态。

Windows 安装器样例需要交互式 Windows x64 桌面，以及项目原有的 MSVC、Windows SDK 和桌面构建依赖。生产 NSIS 配置由 `apps/desktop/scripts/test-windows-installer.mjs` 调用，使用独立测试产品标识和模拟载荷。本次选择日文、简体两种语言，并将侧栏图片指向同次生成的资源目录。下面的临时 runner 复现这两处样例配置，结束后移除临时脚本。

```powershell
$checkout = $PWD.Path
$original = Join-Path $checkout 'apps/desktop/scripts/test-windows-installer.mjs'
$temporary = Join-Path (Split-Path -Parent $original) ('japanese-installer-review-' + [guid]::NewGuid().ToString('N') + '.mjs')
$runner = [IO.File]::ReadAllText($original)
$localeOriginal = 'for (const locale of readInstallerLocales()) {'
$localeReplacement = "for (const locale of readInstallerLocales().filter(locale => ['ja_JP', 'zh_CN'].includes(locale.id))) {"
$nsisOriginal = 'nsis: { ...config.nsis, guid, include, installerLanguages: [language] }'
$nsisReplacement = "nsis: { ...config.nsis, guid, include, installerLanguages: [language], installerSidebar: join(output, 'ui', 'uninstaller-sidebar.bmp'), uninstallerSidebar: join(output, 'ui', 'uninstaller-sidebar.bmp') }"
if (-not $runner.Contains($localeOriginal) -or -not $runner.Contains($nsisOriginal)) {
    throw 'Installer runner differs from the pinned source. Review the fixture setup first.'
}
[IO.File]::WriteAllText($temporary, $runner.Replace($localeOriginal, $localeReplacement).Replace($nsisOriginal, $nsisReplacement), [Text.UTF8Encoding]::new($false))
try {
    node $temporary
    if ($LASTEXITCODE) { throw 'Installer fixture failed.' }
} finally {
    Remove-Item -LiteralPath $temporary
}
```

查看欢迎、路径、安装进度、完成、卸载与重启提示；在 150% 显示缩放下确认“今すぐインストール”完整显示。样例目录由 runner 在结束时输出，原生检查结果见[桌面与安装器记录](../verification.md#桌面与安装器)。签名发布包可在团队既有分发流程中复验同一条路径。
