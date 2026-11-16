# rc.3 复现与采用

下面在 Windows 上构建加入修复的 `dsh-v0.2.2-rc.3`。命令检出待审阅提交 `e944ab65`。如需重建实机验收所用的 Web 和桌面构建，可按验收记录检出 `6896be77`。[Windows 验收记录](../verification.md)

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

从源码启动本地 Web 服务，使用独立的 `DSH_HOME`、测试工作区和浏览器配置。这样会话、字体设置和登录状态都保存在测试目录里。

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
corepack pnpm run verify-japanese-experience
```

下面的脚本通过 CLI 单独启动本地 Web 服务，并用一份新的配置打开已安装的 Edge。样例回复由本机测试服务流式返回。脚本会记录输入组合事件、输入区的翻译属性、会话渲染，以及切换字形前后同一个 Windows cmd 终端的绘制字体。脚本退出时关闭它启动的浏览器窗口和测试服务。[Windows Web 复现脚本](windows-web-flow.cjs)

```powershell
$review = Join-Path (Split-Path $PWD.Path -Parent) 'dsh-japanese-review'
git clone --single-branch --branch review/japanese-experience https://github.com/Oscar-Williams/deepseek-harness.git $review
$playwright = node -p "require.resolve('playwright',{paths:[require('node:path').resolve('apps/web')]})"
$run = Join-Path ([IO.Path]::GetTempPath()) ('dsh-ja-proof-' + [guid]::NewGuid().ToString('N'))
$commit = git rev-parse HEAD
node (Join-Path $review 'repro/windows-web-flow.cjs') $playwright $PWD.Path $run $commit
```

要用 Windows Microsoft 日语输入法复验，先聚焦会话输入框，切换到「日本語 Microsoft IME」。如果输入法图标显示 `A`，点它切换到 `あ`。输入 `nihongo`，看到「にほんご」后按空格选择「日本語」，再按一次 Enter。此时「日本語」应留在草稿中，会话消息数应保持原样。继续输入，再点击发送并查看回复。测试 Edge 内置翻译时，使用含英文消息的样例会话，核对该消息译成日文，输入框和工具栏保留原文。

## 桌面与原生安装器

先正常退出已安装的 DSH App。分别为 `DSH_HOME` 和 `DSH_DESKTOP_USER_DATA_DIR` 指定空目录，再运行 `corepack pnpm run dev:desktop`。应用将本地服务设置和窗口语言缓存写入测试目录。欢迎页可以在新配置中直接查看。登录等待和更新窗口可以用独立的 IPC 与更新样例进入对应状态。

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

查看欢迎、路径选择、安装进度、安装完成、卸载与重启提示。在 150% 显示缩放下确认「今すぐインストール」完整显示。脚本结束时会输出样例目录。[桌面与安装器验收结果](../verification.md#桌面与安装器)
