# 日文文案改词表

按界面和插件目录列出 165 处已有文案改动和 7 个新增的设置键。可先核对动作语义，再对照同一个字典键的原文。快捷键、命令参数和动态占位符按原格式保留。

目标状态、待发消息和只读设置的处理原则见[术语参考](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/docs/i18n/japanese-ui-terms.zh.md)。

## 安装、欢迎页与输入区初始改动

| 位置和键 | 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| locales.ts · shortcut.complementary | 補助のキュー / 実行中の指示変更を使用 | 送信設定と逆の動作で送信（送信待ちに追加／実行中のタスクに指示を追加） | 输入区的互补 Queue / Steer 快捷操作 |
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

## 会话目标

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-goal/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `phase.active.disarmed` | 非アクティブな目標 | 再開待ちの目標 | 目标仍关联当前会话，正在等待继续运行 |
| `phase.blocked` | ブロックされた目標 | 対応が必要な目標 | 目标受阻，等待用户处理阻碍 |
| `objective.aria` | 目標の目的 | 目標の内容 | 目标内容的无障碍名称 |
| `action.clear` | 目標をクリア | 目標を解除 | 解除会话关联的目标 |

## 会话正文与输入区

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-conversation/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `input.send.queue` | メッセージをキューに追加 | 送信待ちに追加 | 将消息留到当前任务结束再发送 |
| `input.send.steer` | 実行中の指示にメッセージを追加 | 実行中のタスクに指示を追加 | 把消息作为指令加入正在执行的任务 |
| `attachment.pending` | 保留中の添付ファイル | 送信待ちの添付ファイル | 等待处理的附件占位 |
| `image.pending` | 保留中の画像 | 送信待ちの画像 | 等待处理的图片占位 |
| `file.pending` | 保留中のファイル | 送信待ちのファイル | 等待处理的文件占位 |
| `settings.enter.queue` | キュー | 送信待ちに追加 | 选择 Enter 在任务运行时把消息留待发送 |
| `settings.enter.steer` | 指示を変更 | 実行中のタスクに指示を追加 | 将 Enter 设置为追加运行中指令 |
| `detail.state` | ステータス | 状態 | 会话正文与输入区 · Status |
| `todo.diff.updatedItem` | ステータス変更 | 状態の変更 | 会话正文与输入区 · Status changed |
| `detail.goal.active` | アクティブ | 進行中 | 会话正文与输入区 · Active |
| `detail.goal.disarmed` | 継続待ち | 再開待ち | 事件详情中，目标仍设定且等待继续运行 |
| `detail.goal.blocked` | ブロック中 | 対応が必要 | 会话正文与输入区 · Blocked |
| `detail.goal.reason` | ブロッカー | 続行できない理由 | 会话正文与输入区 · Blocker |
| `detail.status.inactive` | 非アクティブ | 待機中 | 会话正文与输入区 · Inactive |
| `detail.wait.noProgress` | アクティブなサブエージェントなし | 実行中のサブエージェントはありません | 会话正文与输入区 · No active subagents |
| `detail.ralph.reportedBlocker` | ワーカーがブロッカーを報告 | ワーカーが続行できない理由を報告 | 会话正文与输入区 · Worker reported a blocker |
| `detail.trace.replacedBy` | 置き換え元 | 置き換え先 | 跳转到替换了本事件的新事件 |
| `detail.trace.replaces` | 置き換えられたイベント | 置き換え元のイベント | 查看本事件替换的原事件 |
| `detail.trace.sources` | ソースイベント | 参照元イベント | 事件详情中的来源 |
| `ask.pendingDetail` | これらの保留中の質問は、コンポーザーから引き続き回答できます。 | 保留中の質問には、入力欄から引き続き回答できます。 | 等待用户作答时的详细状态 |
| `ask.closed` | クローズ済み | 回答受付終了 | 向用户提问的卡片已经结束受理 |
| `ask.closedDetail` | この質問はクローズされました。結果は下の会話にあります。 | この質問の回答受付は終了しました。結果は下の会話に表示されています。 | 答复入口关闭时的详细状态 |
| `queue.count` | {n}件のキュー済みメッセージ | {n}件の送信待ちメッセージ | 输入区待发消息数量 |
| `queue.image` | キュー済みメッセージの画像 | 送信待ちメッセージの画像 | 待发消息包含的图片 |
| `queue.file` | キュー済みファイル {name} | 送信待ちのファイル {name} | 待发消息包含的文件 |
| `queue.edit` | キュー済みメッセージを編集 | 送信待ちメッセージを編集 | 编辑一条待发消息 |
| `queue.save` | キュー済みメッセージを保存 | 送信待ちメッセージを保存 | 保存对待发消息的编辑 |
| `queue.remove` | キュー済みメッセージを削除 | 送信待ちメッセージを削除 | 从待发列表移除这条消息 |
| `queue.steer` | キュー内のメッセージを実行中の指示に追加 | 待機中のメッセージを実行中のタスクへの指示に追加 | 把一条待发消息加入当前任务的指令 |
| `queue.steer.unavailable` | 指示の変更はエージェントの実行中のみ利用できます | 実行中のタスクがあるときに指示を追加できます | 当前状态无法追加指令时的提示 |
| `queue.steerFailed` | 指示の変更に失敗しました。再試行してください。 | 指示を追加できませんでした。再試行してください。 | 追加待发消息到当前任务失败 |
| `detail.status.provisioning` | プロビジョニング中 | 準備中 | 会话正文与输入区 · Provisioning |
| `detail.field.previousStatus` | 以前のステータス | 以前の状態 | 会话正文与输入区 · Previous status |
| `detail.field.surface` | レコードステータス | 記録状態 | 会话正文与输入区 · Record status |
| `detail.receipt.closed` | クローズ済み | 終了 | 会话正文与输入区 · Closed |
| `detail.receipt.closing` | クローズ中 | 終了処理中 | 会话正文与输入区 · Closing |
| `detail.wait.title` | サブエージェントのアクティビティ | 待機結果 | 会话正文与输入区 · Wait result |
| `row.inspect` | 検査 | 詳細を表示 | 打开当前行的详细信息 |
| `terminal.commandLine` | コマンドライン {n} | コマンドの{n}行目 | 会话正文与输入区中终端输出的命令行号 |
| `detail.status.queued` | キュー待ち | 待機中 | 历史详情中的通用任务状态 |

## 模型选择

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-model-selection/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `effort.providerDefault` | デフォルト | 既定 | 模型选择的默认选项或恢复动作 |
| `search.clear` | 検索をクリア | 検索条件を消去 | 模型选择 · Clear search |

## 用外部应用打开

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-open-in-app/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `path.appDefault` | {app}（デフォルト） | {app}（既定） | 用外部应用打开的默认选项或恢复动作 |

## 权限预设

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-permission-presets/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `description` | 新しいセッションのデフォルトの権限モードを選択 | 新しいセッションで使う既定の権限モードを選択 | 权限预设 · Choose the default permission mode for new sessions |

## 插件管理

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-plugin-manager/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `registryDefault` | デフォルトレジストリ | 既定のレジストリ | 插件管理的默认选项或恢复动作 |
| `terminalCommandLine` | コマンドライン {n} | コマンドの{n}行目 | 插件管理中终端输出的命令行号 |

## 插件市场

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-plugin-market/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `sortDefault` | デフォルト順 | 標準の並び順 | 插件市场的默认选项或恢复动作 |

## 设置中的运行方式

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-settings-agent-loop/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `reset` | デフォルトにリセット | 既定値に戻す | 设置中的运行方式的默认选项或恢复动作 |
| `invalidNumber` | 数値を入力するか、空欄のままにするとデフォルトが使用されます。 | 数値を入力してください。空欄の場合は既定値を使います。 | 设置中的运行方式 · Enter a number, or leave blank to use the default. |
| `description` | エージェントのツール呼び出しのディスパッチ方法を制御します。 | エージェントによるツール呼び出しの実行方法を設定します。 | 设置中的运行方式 · Control how the Agent dispatches tool calls. |
| `maxParallelHint` | 1ステップ内で同時に実行される並列安全呼び出しの上限。 | 1ステップ内で、安全に並列実行できるツール呼び出しの同時実行数の上限です。 | 设置中的运行方式 · Upper bound on parallel-safe calls running at once within one step. |
| `readOnly` | このデプロイメントでは設定は読み取り専用で保存されます。 | この環境では設定は読み取り専用です。 | 设置中的运行方式的只读状态与编辑结果 |
| `saveFailed` | デプロイがこれらの値を受け付けませんでした。修正のために残されています。 | 設定を保存できませんでした。入力内容は保持されています。値を修正して、もう一度保存してください。 | 设置中的运行方式保存失败时的提示 |

## 设置中的 Shell

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-settings-shell/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `reset` | デフォルトに戻す | 既定値に戻す | 设置中的 Shell的默认选项或恢复动作 |
| `invalidNumber` | 数値を入力するか、空欄のままにするとデフォルトが使用されます。 | 数値を入力してください。空欄の場合は既定値を使います。 | 设置中的 Shell · Enter a number, or leave blank to use the default. |
| `readOnly` | このデプロイでは設定が読み取り専用で保存されます。 | この環境では設定は読み取り専用です。 | 设置中的 Shell的只读状态与编辑结果 |
| `saveFailed` | デプロイがこれらの値を受け付けませんでした。修正のため残されています。 | 設定を保存できませんでした。入力内容は保持されています。値を修正して、もう一度保存してください。 | 设置中的 Shell保存失败时的提示 |

## 设置中的子代理

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-settings-subagent/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `reset` | デフォルトに戻す | 既定値に戻す | 设置中的子代理的默认选项或恢复动作 |
| `readOnly` | このデプロイメントでは設定は読み取り専用で保存されます。 | この環境では設定は読み取り専用です。 | 设置中的子代理的只读状态与编辑结果 |
| `saveFailed` | デプロイメントがこれらの値を受け付けませんでした。修正のため残されています。 | 設定を保存できませんでした。入力内容は保持されています。値を修正して、もう一度保存してください。 | 设置中的子代理保存失败时的提示 |
| `subagentModelSelectionOff` | サブエージェントは設定済みのデフォルトを使用するか、親エージェントのモデルを継承します。保存済みのモデル選択は保持されます。 | サブエージェントは設定済みの既定のモデルを使用するか、親エージェントのモデルを継承します。保存済みのモデル選択は保持されます。 | 设置中的子代理 · Subagents use configured defaults or inherit the parent agent's model. Saved model choices are retained. |

## 设置中的网络搜索

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-settings-web-search/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `reset` | デフォルトに戻す | 既定値に戻す | 设置中的网络搜索的默认选项或恢复动作 |
| `invalidNumber` | 数値を入力するか、デフォルトを使用するには空欄にしてください。 | 数値を入力してください。空欄の場合は既定値を使います。 | 设置中的网络搜索 · Enter a number, or leave blank to use the default. |
| `invalidCount` | 1〜50 の整数を入力するか、デフォルトを使用するには空欄にしてください。 | 1〜50 の整数を入力してください。空欄の場合は既定値を使います。 | 设置中的网络搜索 · Enter an integer from 1 to 50, or leave blank to use the default. |
| `readOnly` | このデプロイでは設定は読み取り専用で保存されます。 | この環境では設定は読み取り専用です。 | 设置中的网络搜索的只读状态与编辑结果 |
| `saveFailed` | デプロイがこれらの値を受け入れませんでした。修正用に残されています。 | 設定を保存できませんでした。入力内容は保持されています。値を修正して、もう一度保存してください。 | 设置中的网络搜索保存失败时的提示 |

## 设置中的模型配置

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-settings-models/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `baseUrlDefault` | デフォルトエンドポイントなし | 既定の接続先なし | 设置中的模型配置的默认选项或恢复动作 |
| `retryModeDefault` | デフォルト ({mode}) | 既定（{mode}） | 设置中的模型配置的默认选项或恢复动作 |
| `modelsInherited` | アダプターのデフォルトを使用 | モデル接続設定の既定値を使用 | 设置中的模型配置 · Using the adapter defaults |
| `resetModels` | デフォルトに戻す | 既定のモデルに戻す | 恢复从提供方继承的模型列表 |
| `contextWindowPlaceholder` | プロバイダーのデフォルトを使用 | モデル提供元の既定値を使用 | 设置中的模型配置 · Uses the provider default |
| `maxTokensPlaceholder` | プロバイダーのデフォルトを使用 | モデル提供元の既定値を使用 | 设置中的模型配置 · Uses the provider default |
| `readOnly` | このデプロイでは設定ドキュメントは読み取り専用です。 | この環境では設定ファイルは読み取り専用です。 | 设置中的模型配置的只读状态与编辑结果 |
| `deepSeekBaseUrl` | https://api.deepseek.com/anthropic (デフォルトはDEEPSEEK_BASE_URLを使用) | https://api.deepseek.com/anthropic（未指定の場合は DEEPSEEK_BASE_URL を使用） | 设置中的模型配置 · https://api.deepseek.com/anthropic (Default to use DEEPSEEK_BASE_URL) |
| `modelReasoningHelpText` | API値はリクエストの推論強度フィールド（OpenAIのreasoning_effortなど）で送信されます。デフォルトはレベル名です。モデルプロバイダーのAPIドキュメントで別の値が指定されている場合はそれに従ってください。オフは推論を無効にするため値は不要です。設定に既に記述されている値は保持され、送信されます。 | API 値は、リクエストの推論強度フィールド（OpenAI の reasoning_effort など）に送信されます。既定値はレベル名です。モデル提供元の API ドキュメントで別の値が指定されている場合は、その値を使用してください。オフでは推論を無効にするため値は不要です。設定に保存済みの値がある場合は、その値を保持して送信します。 | 模型推理设置说明，保留模型参数原名 |

## 设置中的插件进程

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-settings-plugin-inventory/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `presetOptionDefault` | {name} (デフォルト) | {name}（既定） | 设置中的插件进程的默认选项或恢复动作 |
| `runtime` | ステータス | 状態 | 设置中的插件进程 · Status |

## 键盘快捷操作

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-shortcuts/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `reset` | デフォルトに戻す | 初期設定に戻す | 键盘快捷操作的默认选项或恢复动作 |
| `reset-all` | すべてデフォルトに戻す | すべて初期設定に戻す | 键盘快捷操作的默认选项或恢复动作 |
| `reset-title` | すべてのショートカットをデフォルトに戻しますか？ | すべてのショートカットを初期設定に戻しますか？ | 键盘快捷操作的默认选项或恢复动作 |
| `reset-description` | このプラットフォームのショートカットをデフォルトに戻します。変更または削除されたすべてのショートカットが復元されます。他のプラットフォームには影響しません。 | この環境のショートカットを初期設定に戻します。変更・削除したショートカットも復元されます。他の環境には影響しません。 | 键盘快捷操作的默认选项或恢复动作 |
| `reset-saved` | デフォルトのショートカットを復元しました | ショートカットを初期設定に戻しました | 键盘快捷操作的默认选项或恢复动作 |
| `reset-failed` | デフォルトを復元できませんでした。ショートカットは変更されていません。再試行してください。 | 初期設定に戻せませんでした。ショートカットは変更されていません。再試行してください。 | 键盘快捷操作保存失败时的提示 |
| `using-defaults` | デフォルトのバインドが有効です。 | 標準のキー割り当てを使用中です。 | 键盘快捷操作的默认选项或恢复动作 |
| `clear-search` | 検索をクリア | 検索条件を消去 | 键盘快捷操作 · Clear search |
| `stale` | ショートカット構成または利用可能なコマンドが変更されました。保存する前に最新のバインドを確認してください。 | ショートカットの構成または利用できるコマンドが変更されました。保存する前に最新のキー割り当てを確認してください。 | 键盘快捷操作 · Shortcut configuration or available commands changed. Review the latest bindings before saving. |
| `using-accepted` | 最後に正常に読み取られたバインドが有効なままです。 | 最後に正常に読み取られたキー割り当てを引き続き使用しています。 | 键盘快捷操作 · The last successfully read bindings remain active. |

## 文件侧栏

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-sidebar-files/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `search.clear` | 検索をクリア | 検索条件を消去 | 文件侧栏 · Clear search |

## 工作区与会话

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-workspace/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `search.clear` | 検索をクリア | 検索条件を消去 | 工作区与会话 · Clear search |
| `defaultWorkspace.failed` | デフォルトのワークスペースを作成できません。ワークスペースを選択してフォルダーを選んでください。 | 既定のワークスペースを作成できませんでした。「ワークスペースを選択」からフォルダーを選んでください。 | 工作区与会话的默认选项或恢复动作 |
| `shortcut.noPicker` | ディレクトリピッカーを利用できません | フォルダー選択ダイアログを利用できません | 工作区与会话 · Directory picker unavailable |
| `delete.desc` | 「{name}」をワークスペース一覧から削除します。フォルダとセッションログは保持されます。このワークスペースのセッションは「未分類」に表示されます。 | 「{name}」をワークスペース一覧から削除します。フォルダーとセッションログは保持されます。このワークスペースのセッションは「グループなし」に表示されます。 | 工作区与会话 · This removes “{name}” from the workspace list. The folder and session logs will be kept. Its sessions will appear under Ungrouped. |

## 子代理运行时长

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-subagent/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `duration.exactTitle` | 合計アクティブ時間: {duration} | 合計稼働時間: {duration} | 子代理运行时长 · Total active duration: {duration} |

## 外观与字体

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-theme/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `fontFamily.text.description` | インターフェースと会話テキストに使用します。フォントはカンマで区切ります。空欄の場合はデフォルトを使用 | 画面と会話本文に使用します。複数のフォント名はカンマで区切ります。空欄の場合は標準のフォントを使います。 | 外观与字体 · Used for the interface and conversation text. Separate fonts with commas; leave empty for the default |
| `fontFamily.code.description` | コードブロック、インラインコード、ツール出力に使用します。フォントはカンマで区切ります。空欄の場合はデフォルトを使用 | コードブロック・行内コード・ツール出力に使用します。複数のフォント名はカンマで区切ります。空欄の場合は標準のフォントを使います。 | 外观与字体 · Used for code blocks, inline code, and tool output. Separate fonts with commas; leave empty for the default |
| `fontFamily.terminal.description` | サイドバーのターミナルに使用します。フォントはカンマで区切ります。空欄の場合はデフォルトを使用 | サイドバーのターミナルに使用します。複数のフォント名はカンマで区切ります。空欄の場合は標準のフォントを使います。 | 外观与字体 · Used for the sidebar terminal. Separate fonts with commas; leave empty for the default |
| `fontFamily.placeholder` | デフォルト | 標準のフォント | 外观与字体 · Default |

## 多处共用的界面操作（插件目录）

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/locale/src/locales/ja.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `workspace.defaultName` | デフォルトワークスペース | 既定のワークスペース | 多处共用的界面操作的默认选项或恢复动作 |
| `copy.compactJson` | コンパクトJSONをコピー | 1 行の JSON をコピー | 复制单行 JSON 的菜单 |

## 后台作业

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-jobs/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `section.clear` | クリア | 終了したジョブを消去 | 清除已结束的后台作业，包括失败和取消 |
| `section.settledCount` | 完了 {count} 件 | 終了 {count} 件 | 已结束的后台作业计数 |
| `terminal.commandLine` | コマンドライン {n} | コマンドの{n}行目 | 后台作业中终端输出的命令行号 |

## 设置中的插件

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-settings-plugins/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `intro` | このデプロイメントに含まれるプラグインを確認します。 | この環境に含まれるプラグインを確認します。 | 设置中的插件 · Inspect the plugins this deployment ships. |
| `empty` | このデプロイメントにはプラグインビューがありません。 | この環境には表示できるプラグイン情報がありません。 | 设置中的插件 · This deployment exposes no plugin views. |

## 会话执行履历

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-trajectory/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `details.status` | ステータス | 状態 | 会话执行履历 · Status |
| `view.trajectory` | 軌跡 | 実行履歴 | 打开回合步骤和事件的标签页 |
| `toolbar.aria` | 軌跡ツールバー | 実行履歴の操作 | 执行履历工具栏的无障碍名称 |
| `toolbar.search` | 軌跡を検索 | 実行履歴を検索 | 会话执行履历 · Search trajectory |
| `history.loadingTrajectory` | 軌跡を読み込み中… | 実行履歴を読み込み中… | 会话执行履历 · Loading trajectory… |
| `timeline.aria` | 軌跡タイムライン | 実行履歴のタイムライン | 执行履历时间线的无障碍名称 |

## 设置中的子代理（插件目录）

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-settings-subagent/locale/ja.json)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `meta.description` | 委派の深さ、同時実行数、選択可能なモデルを設定します。 | サブエージェントの階層数、同時実行数、使用できるモデルを設定します。 | 设置中的子代理在插件列表或详情页的功能简介 |

## 权限预设（插件目录）

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-permission-presets/locale/ja.json)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `meta.description` | 新規セッションのデフォルト権限を設定し、現在のセッションの権限モードを切り替えます。 | 新規セッションの既定の権限を設定し、現在のセッションの権限モードを切り替えます。 | 权限预设在插件列表或详情页的功能简介 |

## 会话正文与输入区（插件目录）

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-conversation/locale/ja.json)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `meta.description` | 会話内容、入力欄、メッセージキュー、ビューのナビゲーションを構成します。 | 会話内容、入力欄、送信待ちメッセージ、表示の切り替えを管理します。 | 会话正文与输入区在插件列表或详情页的功能简介 |

## 外观与字体（插件目录）

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-theme/locale/ja.json)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `meta.description` | ライト、ダーク、システムに従うテーマ設定を提供します。 | 表示テーマと文字の大きさ、フォント、漢字の字形を設定します。 | 外观与字体在插件列表或详情页的功能简介 |

## 常规设置

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-settings-general/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `developerTools.description` | 軌跡、コード差分、すべてのエージェントプリセットを表示します | 実行履歴、コード差分、すべてのエージェントプリセットを表示します | 常规设置 · Shows trajectory, code diffs, and all Agent presets |

## 协作任务板

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-agent-team/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `owner` | オーナー | 担当 | 协作任务板 · Owner |
| `unowned` | オーナーなし | 担当なし | 协作任务板 · Unowned |
| `status.pending` | 保留中 | 未着手 | 协作任务板 · Pending |
| `progress.pending` | {count}件保留中 | {count}件未着手 | 协作任务板 · {count} pending |

## 会话交付物

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/client/ui-deliverables/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `presented.expandAria` | 配信された全{count}ファイルを表示 | 提示した全{count}ファイルを表示 | 会话交付物的无障碍操作说明 |
| `presented.collapseAria` | 配信されたファイルを折りたたむ | 提示したファイルを折りたたむ | 会话交付物的无障碍操作说明 |
| `row.running` | 配信中 | ファイルを提示中 | 会话交付物 · Delivering |
| `row.ok` | 配信済み | 提示済み | 会话交付物 · Delivered |
| `row.error` | 配信に失敗しました | ファイルを提示できませんでした | 会话交付物 · Delivery failed |
| `row.inspect` | 呼び出しを検査 | 呼び出しの詳細 | 打开当前行的详细信息 |

## OAR 插件（插件目录）

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/experimental/subagent-oar/locale/ja.json)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `meta.description` | OAR を通じてインストール済みのコーディングエージェントにタスクを委派します。Codex と Claude Code の設定を提供します。 | OAR を通じて、インストール済みのコーディングエージェントにタスクを依頼します。Codex と Claude Code の設定を提供します。 | OAR 插件在插件列表或详情页的功能简介 |

## Claude Code 子代理插件（插件目录）

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/subagent/subagent-claude-code/locale/ja.json)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `meta.description` | Claude Code のネイティブの認証と設定を使用して、単独のタスクを委派します。 | Claude Code の認証情報と設定を使い、1 件のタスクを依頼します。 | Claude Code 子代理插件在插件列表或详情页的功能简介 |

## Codex 子代理插件（插件目录）

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/subagent/subagent-codex/locale/ja.json)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `meta.description` | Codex のネイティブの認証と設定を使用して、単独のタスクを委派します。 | Codex の認証情報と設定を使い、1 件のタスクを依頼します。 | Codex 子代理插件在插件列表或详情页的功能简介 |

## 子代理运行位置（插件目录）

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/subagent/subagent/locale/ja.json)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `meta.description` | サブエージェントのバックエンドを管理し、タスク委派用の共通インターフェースを提供します。 | サブエージェントの実行先を管理し、タスクを依頼するための共通インターフェースを提供します。 | 子代理运行位置在插件列表或详情页的功能简介 |

## 子代理委托工具（插件目录）

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/subagent/tool-subagent/locale/ja.json)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `meta.title` | サブエージェント委派ツール | サブエージェントへのタスク依頼 | 子代理委托工具在插件列表显示的名称 |

## 思考内容翻译设置

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/experimental/client-ui-cot-translation/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `reset` | デフォルトに戻す | 初期設定に戻す | 思考内容翻译设置的默认选项或恢复动作 |

## 代码托管面板

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/experimental/client-ui-forge/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `change.check.queued` | キュー待ち | 実行待ち | 变更请求的检查任务尚未执行 |
| `diff.base.automatic` | デフォルト | 既定 | 代码托管面板 · Default |
| `diff.useAutomaticBase` | デフォルトの基準ブランチを使う | 既定の基準ブランチを使う | 代码托管面板 · Use the default base branch |

## 调用统计表

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/experimental/client-ui-stats/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `trigger.goal` | ゴールラウンド | 目標の継続 | 统计表中由目标继续运行触发的请求 |
| `event.system.clear` | クリア | 消去 | 统计表中系统消息的清除操作 |

## 语音输入设置

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/experimental/client-ui-voice-input/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `setup.estimateNote` | これらは目安です。ネットワークが遅い場合はさらに時間がかかることがあります。ダウンロード済みデータは再利用され、アイドル状態のモデルはデフォルトでメモリを解放します。 | 所要時間は目安です。ネットワークが遅い場合はさらに時間がかかることがあります。ダウンロード済みのデータは再利用され、使用していないモデルのメモリは通常、自動的に解放されます。 | 语音输入设置 · These are estimates; slow networks may take longer. Downloads are reused; idle models release memory by default. |
| `systemMicrophone` | システムデフォルト | システムの既定 | 语音输入设置 · System default |
| `systemMicrophoneNamed` | システムデフォルト（{name}） | システムの既定（{name}） | 语音输入设置 · System default ({name}) |

## 新会话的工具模式

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/experimental/cua/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `defaultTitle` | 新規セッションのデフォルトモード | 新規セッションの既定のモード | 新会话的工具模式的默认选项或恢复动作 |
| `defaultSet` | PTCがデフォルトです | PTC を既定に設定しました | 新会话的工具模式的默认选项或恢复动作 |
| `defaultUnavailable` | デフォルトモードを読み取れませんでした。設定で確認してください。 | 既定のモードを読み取れませんでした。設定を確認してください。 | 新会话的工具模式的默认选项或恢复动作 |
| `defaultReadOnly` | デフォルトモードの設定は読み取り専用です。 | 既定のモードの設定は読み取り専用です。 | 新会话的工具模式的默认选项或恢复动作 |
| `defaultNotSaved` | デフォルトモードは保存されませんでした。もう一度お試しください。 | 既定のモードを保存できませんでした。もう一度お試しください。 | 新会话的工具模式保存失败时的提示 |
| `defaultFailed` | デフォルトモードを変更できませんでした: {message} | 既定のモードを変更できませんでした: {message} | 新会话的工具模式的默认选项或恢复动作 |

## 会话检查器

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/experimental/session-inspector/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `filter.clear` | クリア | 入力を消去 | 清除筛选框草稿并返回输入区 |

## Cordis 查看器

[字典与所属功能](https://github.com/Oscar-Williams/deepseek-harness/blob/e0e5bdeba6f8790bef937baddcc203a4bc2fca8c/packages/extensions/ui-cordis/src/client/locales.ts)

| 键 | rc.3 原文 | 新文案 | 界面语境 |
| --- | --- | --- | --- |
| `render.failedAbdicated` | {slot} でのレンダリングに失敗しました。デフォルト UI を復元しました: | {slot} を表示できなかったため、標準の画面に戻しました: | 插件视图失败后回退到标准界面 |

## 新的字形地区设置

| 键 | 日文 | 界面语境 |
| --- | --- | --- |
| `cjk.title` | 漢字の字形 | 外观设置中的字形地区选择器 |
| `cjk.description` | 言語指定のない文章・コード・ターミナルで使う字形を選びます。画面の表示言語は変わりません。 | 说明选择器对未标注内容、代码与终端的影响 |
| `cjk.auto` | 自動 | 外观设置的字形地区菜单项 |
| `cjk.ja` | 日本語 | 外观设置的字形地区菜单项 |
| `cjk.zh-Hans` | 簡体字中国語 | 外观设置的字形地区菜单项 |
| `cjk.zh-Hant` | 繁体字中国語 | 外观设置的字形地区菜单项 |
| `cjk.ko` | 韓国語 | 外观设置的字形地区菜单项 |
