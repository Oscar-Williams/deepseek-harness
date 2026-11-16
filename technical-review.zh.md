# rc.3 日语体验修复说明

日语用户报告的核心问题是字形选择。界面已经显示日语，共享字体列表却把 PingFang SC、Microsoft YaHei 等简体字库放在日文字库前面。汉字能够显示，地区字形仍可能与日文习惯不符。字体列表需要跟随语种，日文措辞则需要根据按钮和命令的实际行为逐项审阅。[原始反馈](https://x.com/2022_technology/status/2118351787220664813) · [macOS Firefox 报告](https://github.com/deepseek-ai/deepseek-harness/discussions/9516)

修复以官方 rc.3 为基线，最终提交为 `548b7d1c3f058b0a506cdf01db4ec3884aae32c6`。[完整代码比对](https://github.com/deepseek-ai/deepseek-harness/compare/38a6a5c965aa99ab525161efb7cc5cf1fe62fced...Oscar-Williams:fix/japanese-product-experience-rc3)保留了全部源码、测试和必要的双语 README 修改；[验证记录](verification.md)说明实际运行的环境和结果。

## 字体如何跟随语种

[共享主题](https://github.com/Oscar-Williams/deepseek-harness/blob/548b7d1c3f058b0a506cdf01db4ec3884aae32c6/packages/client/ui-theme/src/styles/base.css)按文档或内容元素的 `lang` 选择地区字体。日语优先使用系统日文字体，再使用日文 Noto 和系统回退。正文、代码和编辑器沿用各自的共享字体变量，用户自定义字体继续优先，代码中的拉丁字符保留等宽字体。

语言标记所在元素重新解析字体变量。日语界面中的 `lang="zh-Hant"` 段落使用繁体字库，英语容器中的 `lang="ja-JP"` 内容使用日文字库；未标记的内容默认使用界面语言。[轨迹表](https://github.com/Oscar-Williams/deepseek-harness/blob/548b7d1c3f058b0a506cdf01db4ec3884aae32c6/packages/client/ui-trajectory/src/client/TrajectoryTable.module.css)也改用共享代码字体，覆盖原先独立写死的字体列表。

## 桌面与原生安装器

| 入口 | 修改方式 |
| --- | --- |
| [欢迎页](https://github.com/Oscar-Williams/deepseek-harness/blob/548b7d1c3f058b0a506cdf01db4ec3884aae32c6/apps/desktop/renderer/welcome.css)、[更新窗口](https://github.com/Oscar-Williams/deepseek-harness/blob/548b7d1c3f058b0a506cdf01db4ec3884aae32c6/apps/desktop/renderer/update-dialog.css) | 按窗口当前显示的语言选择字体；欢迎页在实际 body 元素处解析字体变量。 |
| [登录等待页](https://github.com/Oscar-Williams/deepseek-harness/blob/548b7d1c3f058b0a506cdf01db4ec3884aae32c6/apps/desktop/renderer/policy-login-loading.html) | 创建者传递语言 ID 和本地化文案，独立渲染器使用对应地区字库。 |
| [NSIS 控件](https://github.com/Oscar-Williams/deepseek-harness/blob/548b7d1c3f058b0a506cdf01db4ec3884aae32c6/apps/desktop/installer/lifecycle.nsh) | 使用安装器当前选中的语言，日文选择 Yu Gothic UI。 |
| [原生绘制](https://github.com/Oscar-Williams/deepseek-harness/blob/548b7d1c3f058b0a506cdf01db4ec3884aae32c6/apps/desktop/installer/window-frame.cpp)与[字体选择函数](https://github.com/Oscar-Williams/deepseek-harness/blob/548b7d1c3f058b0a506cdf01db4ec3884aae32c6/apps/desktop/installer/installer-font.h) | 绘制入口接收同一 LANGID，并集中选择字体。 |
| [重启提示](https://github.com/Oscar-Williams/deepseek-harness/blob/548b7d1c3f058b0a506cdf01db4ec3884aae32c6/apps/desktop/installer/restart-status.h) | 复用相同的地区字体选择。 |
| [安装和完成按钮](https://github.com/Oscar-Williams/deepseek-harness/blob/548b7d1c3f058b0a506cdf01db4ec3884aae32c6/apps/desktop/installer/pages.nsh) | 使用实际控件字体测量本地化文案，保留两侧内边距，并以原设计宽度作为最小值。 |

“今すぐインストール”在原固定宽度下发生裁字；测量后按钮可以完整显示该文案。隔离安装器的日文与简体对照、GDI 实际字体和 150% 缩放结果见[原生验证](verification.md#桌面与安装器)。

## 终端、输入区与启动

[侧栏终端](https://github.com/Oscar-Williams/deepseek-harness/blob/548b7d1c3f058b0a506cdf01db4ec3884aae32c6/packages/client/ui-sidebar-terminal/src/client/terminal.tsx)通过现有 Cordis 注入的 observable 订阅当前语言。切换语言时更新现有 xterm 的字体选项并重新测量网格，保留终端对象、已有输出和底层进程。图标候选加入 Symbols Nerd Font 系列，供已安装该字体的系统使用。

[整个 InputBar](https://github.com/Oscar-Williams/deepseek-harness/blob/548b7d1c3f058b0a506cdf01db4ec3884aae32c6/packages/client/ui-conversation/src/client/skeleton/InputBar.tsx)声明 `translate="no"` 和 `notranslate`，保护编辑器及其按钮、菜单和提示。助手正文继续具备浏览器翻译资格。日文组合输入沿用现有编辑器和 IME 处理。

[启动页](https://github.com/Oscar-Williams/deepseek-harness/blob/548b7d1c3f058b0a506cdf01db4ec3884aae32c6/packages/client/web/src/boot-page.ts)在主题及语言插件就绪前即可显示日文，并提供本地字体回退。桌面保存的语言通过既有 preload 读取；跨进程回复字段经过检查，读取失败时保留浏览器语种并记录诊断。

日文措辞按欢迎、工作区、安装和输入动作调整，保留产品名、可输入命令、快捷键及格式占位符。[改词表](ja-copy-review.md)供日语评审结合界面语境决定用词；文案对应的录制会话、预期输出和测试编译配置与源码一起提交。

## 集成范围

共享字体、桌面及安装器、终端、输入区、日文文案各占一个提交。维护者可整组采用，也可按下一版范围摘取，[提交表](README.md#提交与采用)提供源码及单项补丁入口。

[社区方案 #9663](https://github.com/deepseek-ai/deepseek-harness/discussions/9663)也涉及日文字体、输入和安装器本地化。评审可比较其具体实现，再选取适合下一版的提交。本次交接提供 rc.3 上的地区字体选择、原生按钮排版、终端连续性和浏览器翻译保护。

各平台的发布复验项目集中在[验证记录](verification.md#发布复验)，操作方法在[复现步骤](repro/README.md)。
