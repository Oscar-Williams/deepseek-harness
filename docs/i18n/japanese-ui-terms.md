---
description: "Contextual Japanese terminology for DSH controls, states and developer identifiers."
---
# Japanese UI terminology

English | [中文](japanese-ui-terms.zh.md)

Japanese copy should describe what a control does and what a state means. Use the English and Chinese entries together with the owning action; preserve placeholders, command names and API identifiers. The same English word may need different Japanese wording in different features.

## Reviewed terms

| Context | English | Japanese | Reason |
| --- | --- | --- | --- |
| Goal waiting for continuation | Inactive goal | 再開待ちの目標 | The goal remains set and can continue. |
| Remove the session goal | Clear goal | 目標を解除 | States the effect on the goal. |
| Pending outgoing messages | Queue | 送信待ち | Describes when a message will be sent. |
| Add a running-task instruction | Steer | 実行中のタスクに指示を追加 | Explains the action without requiring a new verb. |
| Clear a search query | Clear search | 検索条件を消去 | Names the value being cleared. |
| Clear settled jobs | Clear finished jobs | 終了したジョブを消去 | Includes failed and cancelled jobs. |
| Runtime record view | Trajectory | 実行履歴 | Matches the event ledger the user opens. |
| Task-board assignment | Owner | 担当 | Refers to the agent responsible for the task. |
| Task not yet started | Pending | 未着手 | Distinguishes pending work from paused work. |
| Configuration fallback | Default | 既定値 / 既定 | Describes the value used when none is selected. |
| Restore shortcut configuration | Reset to default | 初期設定に戻す | Explains restoration of saved bindings. |
| Single-line JSON copy | Compact JSON | 1 行の JSON | Describes the copied representation. |
| Read-only configuration | Read-only | 読み取り専用 | The UI must not imply that edits are saved. |
| Event replacement relationship | Replaced by / Replaces | 置き換え先 / 置き換え元のイベント | Preserves the direction of the relationship. |

## Developer vocabulary

Keep product names, slash-command tokens, keyboard combinations, parameter names, protocol values and error codes verbatim. Git, MCP, API Key, Harness, reasoning_effort, /goal and clear inside a command example retain their technical identity.

Use familiar Japanese software terms where they make the operation clearer: セッション, ワークスペース, プラグイン, ファイル, コピー, キャンセル, ターミナル, エージェント, ツール and コンテキスト. Review their context rather than rejecting their script.

## Enforcement and review

`pnpm run verify-japanese-experience` checks reviewed keys in their owning dictionaries. It rejects opaque queue/steer labels and misleading read-only save wording in those contexts, while allowing technical identifiers and unrelated established uses. Positive and negative tests define the boundary. Review the source meaning and interaction before adding a rule.

The local corpus export retains file, key, English, Chinese, Japanese, placeholders and call sites. The public review branch lists actual changes with their interface context. CLI and SDK diagnostics are inventoried separately; command spelling, protocol values, error codes and language APIs retain their existing contracts.
