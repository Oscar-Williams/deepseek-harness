# rc.3 验证记录

候选源码为 [`e944ab650c861cb7dc697dab718b88fdff884890`](https://github.com/Oscar-Williams/deepseek-harness/commit/e944ab650c861cb7dc697dab718b88fdff884890)，基线是官方 rc.3 的 [`38a6a5c965aa99ab525161efb7cc5cf1fe62fced`](https://github.com/deepseek-ai/deepseek-harness/commit/38a6a5c965aa99ab525161efb7cc5cf1fe62fced)。本页记录 2026-11-17 的 Windows 11 x64 验收，构建使用 Node.js 24.19.0 和 pnpm 11.28.5。

## Web 字形与设置

| 场景 | 浏览器和取证方法 | 结果 |
| --- | --- | --- |
| rc.3 的日文正文与代码 | Edge 157，同页受控对照，使用 DevTools 实际字体统计 | 日文从 Microsoft YaHei 切到 Yu Gothic UI，拉丁代码保留 Consolas。简体、繁体、韩文分别检查 Microsoft YaHei、Microsoft JhengHei UI 和 Malgun Gothic。 |
| 日文界面的标题、正文、表格与代码 | Chrome 157.0.8103.51，源码构建，DevTools 实际绘制统计及同元素像素对照 | 四处均绘制 Yu Gothic UI，分别为 15、17、13、4 个字形。 |
| 中文界面中的日文回复 | Chrome 157，同一回复用日文和简体系统字体作正负对照 | 含假名的正文匹配日文对照。中文控件与未标注的纯汉字仍采用简体。 |
| 中文界面手动选日文 | Chrome 157，纯汉字像素对照、代码字体及重载 | 控件保留简体，纯汉字正文与代码采用日文候选。重载后选择仍生效。 |
| 英文界面、浏览器日语优先 | Chrome 157，未标注汉字像素对照 | 自动选择日文候选。现有 Edge 日语偏好也在候选页面的浏览器语言列表中排首位。 |
| 显式语种、嵌套和用户字体 | Chrome 157，受控内容子树和真实组件，另有 Markdown 测试 | `zh-Hant`、`ko` 采用各自的回退。内层 `en` 以该环境的内容默认地区绘制。自定义字体在像素对照中优先。 |
| Windows Firefox 正文与代码 | Firefox 160.0，独立配置，WebDriver BiDi 对同一个元素逐次取样 | 两处实际像素均与 Yu Gothic UI 相同，与 Microsoft YaHei 对照不同。两种字体先通过本机字体加载验证。 |
| 执行履历表 | Edge 157，DevTools 统计可见文字节点 | 「初期システムプロンプト」等实际绘制 Yu Gothic UI，「ターン 1」中的拉丁数字同时使用 Consolas。 |

Chrome 和 Firefox 的页面均使用隔离 Host、临时 home 和无密钥记录。字体栈检查验证候选名称及顺序。显式语种一项同时有 CSS 内容容器测试和解析节点测试。推断只添加字形提示，流式稳定节点、代码标识和原始 HTML 行为由 Markdown 回归测试覆盖。

![Windows Firefox 的日语正文与代码](evidence/windows-firefox-candidate.png)

## 会话、输入和终端

真实 Web Host 由构建后的 CLI 在独立 home 启动。模型回复从本机回环 SSE 夹具返回，输入文本和工作区也都是样例。Chromium DevTools 产生组合事件并确认「日本語の入力を確認」，随后显式发送并显示回复和代码。输入区编辑器和工具栏继承翻译保护，回复正文仍有翻译资格。

Windows Microsoft 日语 IME 实机输入 `nihongo`，空格转换后按 Enter 确认「日本語」。草稿保留，Host 发送请求为 0，随后仍可开始新一轮组合。明确点击发送后，本地夹具收到 1 次请求并流式返回日文回复。[确认后的草稿](evidence/windows-edge-ime-draft.png)

Edge 内置翻译将会话标题和滚入可见区的英文消息译成日文。输入框里的英文草稿与工具栏的 Workspace Write 保留原文。[翻译后的会话](evidence/windows-edge-translation.png)

在同一个 Windows cmd 终端中，日语自动、简体自动、简体界面手动指定日文依次实际绘制 Yu Gothic UI、Microsoft YaHei、Yu Gothic UI。Consolas 全程绘制拉丁字符。三个状态复用同一个 xterm 节点，切换后进程中的变量仍在并输出 `still-17349`。

[同一个 Windows cmd 终端的输出](evidence/web-terminal-switch.png)

## 桌面与安装器

完全退出已安装的 DSH 后，使用隔离的 DSH_HOME 和 Electron 目录启动源码构建。Electron 44.7.0 的日文欢迎标题实际绘制 Yu Gothic UI Light，登录与 API Key 按钮绘制 Yu Gothic UI Semibold。[实际欢迎页](evidence/windows-desktop-welcome.png)

登录等待页和普通更新窗口沿用 `548b7d1c` 的隔离 Electron 证据，产品输入一致。强制更新窗口单测通过，本轮仅将命令地址框接入代码字体变量。[登录等待页](evidence/electron-after-login-ja.png)

Windows 原生安装器使用上游 NSIS、隔离产品标识和模拟载荷。日语及简体各通过 16 项安装和卸载检查，涵盖路径校验、完成页、进程占用、静默更新和卸载。150% 缩放下「今すぐインストール」完整显示。原生进度和重启提示也通过各自的样例。GDI 实际选中日文 Yu Gothic UI、简体 Microsoft YaHei UI。本轮与 `548b7d1c` 的安装器源文件相同，继续采用这组记录。

## 构建、检查与记录回放

| 检查 | 结果 |
| --- | --- |
| `build:artifacts --serial`、`build:check --serial` | 8 项构建、2 项聚合类型检查通过，产物用于 Windows 浏览器实测。 |
| Chromium 录制回放与字形场景 | 2 项通过。录制回放恢复持久化记录，核对日文提示及「実行履歴」标签。 |
| 定向 Vitest、字典键和占位符 | 537 个不同的定向用例通过。安装器依赖加载用例通过了独立重试。29 个语言键和区域资源用例通过。 |
| `verify-client-ui-i18n` 与 `verify-japanese-experience` | 1318 个 Client 文件的文案归属、63 份词典和 266 份样式的专项检查通过。 |
| 配置、文案与双语说明 | 配置目录、Cordis 检查目录、插件目录、双语配对及文档站构建通过。 |
| fork 推送前检查 | 5 项类型检查通过。 |
| 固定补丁 | 合并 diff 和按序应用的 14 份补丁均从 rc.3 重建同一候选树。 |

本次 Windows 渲染和录制回放构建为 `6896be77b03f0fe03e1042600dc1b58d6b51b6b7`。随后生成的提交同步两条预装插件简介，对应目录新鲜度检查及推送前类型检查已通过。
