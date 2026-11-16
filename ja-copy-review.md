# 日文文案改词表

供日语评审核对语境、实际动作与产品术语。欢迎标语由三段组成，表中两项需要合看。“空”表示该段不显示。

| 位置和键 | 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| locales.ts · shortcut.complementary | 補助のキュー / 実行中の指示変更を使用 | 送信設定と逆の動作で送信（キューに追加／実行中のタスクに指示を追加） | 输入区的互补 Queue / Steer 快捷操作 |
| locales.ts · hint.goal.active | 目標アクティブ — 編集 / 一時停止 / 再開 / クリア | 目標を設定済み。edit（編集）/ pause（一時停止）/ resume（再開）/ clear（解除） | 目标已设定时的命令提示，保留可输入的指令 |
| locales.ts · placeholder.default | メッセージを送信するかタスクを実行、/ コマンド、@ ファイルやセッション | メッセージやタスクを入力。/ でコマンド、@ でファイルやセッションを参照 | 会话输入框 |
| locales.ts · placeholder.hero | 作りたいものを説明してください。/ コマンド、@ ファイルやセッション | 作りたいものを入力してください。/ でコマンド、@ でファイルやセッションを参照 | 首次进入的输入区 |
| locales.ts · placeholder.workspace | 開始するワークスペースを選択 | 作業するワークスペースを選択してください | 未选择工作区时的输入区 |
| locales.ts · placeholder.steerQueue | Cmd/Ctrl+Enterでキュー内のすべてのメッセージを実行中の指示に追加 | Cmd/Ctrl+Enter で待機中のすべてのメッセージを実行中のタスクへの指示に追加 | 执行中的会话，保留快捷键和全部排队消息的含义 |
| locales.ts · input.commands | ファイルを追加またはコマンドを実行 | ファイルを追加するか、コマンドを実行 | 输入区工具提示 |
| locale.ts · welcomeTaglineBefore | ようこそ | 空 | 欢迎页分段标题，产品名放在日语谓语前 |
| locale.ts · welcomeTaglineAfter | 空 | へようこそ | 欢迎页分段标题，保留产品名原样 |
| locale.ts · welcomeAuthStarting | ログインを開いています… | ログインページを開いています… | 正在打开登录页的过渡提示 |
| locale.ts · welcomeKeyDescription | 公式のDeepSeekモデルを設定してHarnessを使い始めましょう | DeepSeek の公式モデルを使用するには、API キーを設定してください | 欢迎页 API Key 设置说明 |
| ja_JP.json · INSTALLER_NATIVE_PROGRESS | インストールを準備しています… %d%% | インストールの準備中… %d%% | 原生安装器进度文本，保留百分比占位符 |
| boot-page.ts · BOOT_COPY.ja.loading | Loading plugins… | プラグインを読み込んでいます… | Web 与桌面主窗口加载插件时的启动提示 |
| boot-page.ts · BOOT_COPY.ja.failed | Failed to load plugins | プラグインを読み込めませんでした | 启动失败时的标题，底层诊断原文保留 |
