# Japanese typography and input fixes for DeepSeek Harness rc.3

The Japanese UI in rc.3 can render Japanese text with Simplified Chinese glyph forms. The shared fallback stack prefers PingFang SC and Microsoft YaHei before Japanese-specific fonts. The Windows installer also hardcodes a Chinese font in its controls and native drawing.

The five commits start at `dsh-v0.2.2-rc.3` (`38a6a5c965aa99ab525161efb7cc5cf1fe62fced`) and end at `548b7d1c3f058b0a506cdf01db4ec3884aae32c6`. [Review the complete diff](https://github.com/deepseek-ai/deepseek-harness/compare/38a6a5c965aa99ab525161efb7cc5cf1fe62fced...Oscar-Williams:fix/japanese-product-experience-rc3) or choose individual commits from the [commit table](README.md#提交与采用).

The shared theme resolves regional fonts from the interface language or an explicit content language tag, while preserving user choices and Latin monospace fonts. Desktop windows follow their displayed language. NSIS controls, native progress drawing and restart prompts follow the installer's selected language. Primary buttons measure localized captions so Japanese text fits at 150% Windows scaling.

The sidebar updates its existing xterm instance when the interface language changes. A live Windows cmd test retained the process environment and accepted further commands after switching Japanese to Simplified Chinese. The entire composer opts out of browser translation, while assistant messages remain eligible. Fourteen Japanese boot, onboarding, installer and composer strings have a [contextual copy review](ja-copy-review.md).

Windows Edge selected Microsoft YaHei for the original Japanese paragraph and Japanese characters in code. A controlled theme override on the same installed page selected Yu Gothic UI and retained Consolas for Latin code. An independently built candidate completed a local streamed conversation and a synthetic Japanese composition sequence.

Validation includes the rc.3 build, 238 focused unit tests, one recorded-session browser replay, five bilingual README pairs and locale-owned UI copy checks. The normal pre-push typecheck passed all five steps on the published code commit. Production NSIS fixtures passed 16 checks each in Japanese and Simplified Chinese. [Verification](verification.md) identifies the environment, build-to-source correspondence, actual font measurements and native fixture scope.

macOS Firefox, Windows OS IME together with browser translation, installed Nerd Font icons and the signed distribution package remain platform-specific release checks. Browser composition used Chromium events, and the conversation used a local model fixture. The [reproduction guide](repro/README.md) covers checkout, build, focused tests and native fixtures.

The fork's default branch contains the complete source and upstream collaboration files. This review branch carries the Markdown guide and necessary screenshots under the [upstream MIT license](LICENSE). Integration scope and release scheduling remain with the DSH maintainers.
