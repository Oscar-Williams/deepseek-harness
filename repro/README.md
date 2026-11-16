# rc.3 的复现和试应用

本说明使用官方 `dsh-v0.2.2-rc.3`，基线为 `38a6a5c965aa99ab525161efb7cc5cf1fe62fced`，修复终点为 `548b7d1c3f058b0a506cdf01db4ec3884aae32c6`。源码与审阅材料分别位于同一 fork 的两个分支，下面先准备这两个目录，再构建和查看实际行为。

## 检出或选取提交

在新的工作目录中运行以下 PowerShell 命令。`$review` 保存本分支的 Markdown、截图和复现脚本，`$checkout` 保存可构建的源码。

```powershell
$review = Join-Path (Get-Location).Path 'dsh-japanese-review'
$checkout = Join-Path (Get-Location).Path 'dsh-japanese-source'
git clone --single-branch --branch review/japanese-experience https://github.com/Oscar-Williams/deepseek-harness.git $review
git clone --filter=blob:none --single-branch --branch fix/japanese-product-experience-rc3 https://github.com/Oscar-Williams/deepseek-harness.git $checkout
Set-Location -LiteralPath $checkout
git switch --detach 548b7d1c3f058b0a506cdf01db4ec3884aae32c6
```

维护者也可在已有仓库中获取五个提交，然后在准备采用改动的 rc.3 分支上按需 cherry-pick。[提交表](../README.md#提交与采用)列出每个提交及其单项补丁下载；单项和整组的应用结果见[验证记录](../verification.md#补丁应用)。

```powershell
git fetch https://github.com/Oscar-Williams/deepseek-harness.git fix/japanese-product-experience-rc3
git switch --create integrate-japanese-rc3 38a6a5c965aa99ab525161efb7cc5cf1fe62fced
$selectedCommit = '<从提交表选择的提交ID>'
git cherry-pick $selectedCommit
```

## 构建并查看字体

项目要求 Node.js 24.9 以上和源码声明的 pnpm 版本。本机使用 Node.js 24.19.0、pnpm 11.28.5；并行度设为 2。

```powershell
corepack pnpm install --frozen-lockfile
$env:DSH_GATE_CONCURRENCY = '2'
corepack pnpm run build --serial
corepack pnpm dsh web --patch apps/web/tests/pin-browse-picker.overlay.yml --no-open
```

在日语界面打开包含假名和汉字的消息，再查看其中带日文的代码。Windows Edge 可通过 DevTools 协议的 `CSS.getPlatformFontsForNode` 记录实际字体；macOS Firefox 使用检查器的 Fonts 面板。样本文段“作業を続ける。入力・確認・保存・読み取り”用于确认字体选择，正文和代码的其他内容沿用同一套主题变量。

对照简体、繁体和韩文时，检查实际字体是否来自对应语种。为局部内容设置 `lang="ja-JP"` 或 `lang="zh-Hant"` 后，确认该内容遵循自己的语言标记。使用自定义字体的用户应继续得到其设置的优先级。[实际字体结果](../verification.md#字体选择)提供本次 Windows 对照。

## 查看会话和终端

构建完成后，可运行本目录的 [Windows Web 脚本](windows-web-flow.cjs)。它依赖本机 Edge 和源码开发依赖中的 Playwright，使用正常的构建版 CLI 启动 Web Host，并创建隔离的工作区、home 和浏览器 context。模型响应来自回环地址上的流式夹具。

```powershell
Set-Location -LiteralPath $checkout
$playwright = node -p "require.resolve('playwright',{paths:[require('node:path').resolve('apps/web')]})"
$run = Join-Path ([IO.Path]::GetTempPath()) ('dsh-japanese-review-' + [guid]::NewGuid().ToString('N'))
$commit = git rev-parse HEAD
node (Join-Path $review 'repro/windows-web-flow.cjs') $playwright $checkout $run $commit
```

脚本记录假名组合到日文确认的事件，发送消息并显示正文和代码，随后在真实 Windows cmd 中输出日文。切换界面语言后，读取之前设置的进程变量，检查字体更新和原进程的连续性。输出目录包含截图、运行日志和结构化结果。[已取得的会话与终端结果](../verification.md#会话与终端)便于直接对照。

人工核对终端时，在日语界面打开终端，依次执行 `chcp 65001`、`set DSH_LOCALE_TEST_MARKER=17349` 和 `echo 入力と保存を確認:%DSH_LOCALE_TEST_MARKER%`。将界面语言改为中文后，继续执行 `echo still-%DSH_LOCALE_TEST_MARKER%`，应得到 `still-17349`。

## 定向测试和已保存会话

下面八个测试文件覆盖字体候选的存在及顺序、终端语言变更、输入区保护、启动和桌面登录，以及安装器资源。

```powershell
$tests = @(
  'packages/client/ui-theme/tests/locale-font-stacks.client.spec.ts',
  'packages/client/ui-sidebar-terminal/tests/terminal-body.client.spec.tsx',
  'packages/client/ui-conversation/tests/input-bar.client.spec.tsx',
  'packages/client/web/tests/boot-page.client.spec.ts',
  'packages/client/web/tests/boot.client.spec.ts',
  'apps/desktop/tests/installer-locales.spec.ts',
  'apps/desktop/tests/policy-test-auth.spec.ts',
  'apps/desktop/tests/policy-login-loading.spec.ts'
)
corepack pnpm exec vitest run --maxWorkers=2 --testTimeout=90000 @tests
$env:DSH_SNAPSHOT = 'replay'
corepack pnpm exec vitest run --config vitest.web.config.ts apps/web/tests/japanese-fonts.e2e.ts
```

录制会话测试使用已有日志，通过真实持久化接口恢复会话，核对日文输入提示和操作文案。该测试默认启动 Playwright Chromium，需要按仓库的浏览器测试说明准备对应浏览器；本机此次用临时启动配置指定已安装的 Edge。[构建与测试结果](../verification.md#构建与测试)列明实际执行范围。

## 桌面和原生安装器

在桌面的日语欢迎页检查登录及 API Key 入口，再通过桌面测试通道显示普通更新、强制更新和登录等待页，检查文案与所选字体。当前证据使用真实 Electron 渲染器和隔离 IPC 状态。

Windows 安装器样例需要交互式 Windows x64 桌面，以及项目原有的 MSVC、Windows SDK 和桌面构建依赖。生产 NSIS 配置由 `apps/desktop/scripts/test-windows-installer.mjs` 调用，使用独立测试产品标识和模拟载荷。本次选择日文、简体两种语言，并将侧栏图片指向同次生成的资源目录。下面的临时 runner 复现这两处样例配置，结束后移除临时脚本。

```powershell
Set-Location -LiteralPath $checkout
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
