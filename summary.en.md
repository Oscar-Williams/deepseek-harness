# Japanese copy and character forms for DeepSeek Harness rc.3

These fixes were developed against the official `dsh-v0.2.2-rc.3` source. Windows acceptance used a build of rc.3 with the fixes applied. In the official release, Japanese text may use Simplified Chinese glyphs even with the interface set to Japanese. The composer labels also make it hard to tell whether a message will wait to send or add instructions to the running task. The changes cover both issues from startup to the conversation, and also cover the Windows terminal, installer and standalone desktop windows.

Japanese prose can use Japanese faces inside a Chinese or English interface. The new **CJK character forms** setting covers unmarked text, code and terminals. In automatic mode, the interface language supplies the default, followed by the first CJK browser language and the platform fallback. CJK controls follow the interface language, and explicit language tags within content take precedence. User font lists remain first. Code continues to use Latin monospace fonts, with a regional fallback for CJK characters.

The Japanese terminology pass describes the action or state. An inactive-but-set goal is waiting to continue, clearing the goal removes it, queued messages are waiting to send, and steering adds instructions to the running task. The change table includes the relevant UI context, original strings and translations. The settings use the existing eight client dictionaries.

The patches apply to the official rc.3 commit `38a6a5c965aa99ab525161efb7cc5cf1fe62fced` and produce the review commit `e944ab650c861cb7dc697dab718b88fdff884890`. The Windows record identifies the exact build used for font rendering, the Japanese IME, Edge page translation and the isolated Electron launch. It also records the native installer tests. [Compare with the official rc.3 release](https://github.com/deepseek-ai/deepseek-harness/compare/38a6a5c965aa99ab525161efb7cc5cf1fe62fced...Oscar-Williams:fix/japanese-product-experience-rc3)

[Verification matrix](verification.md) · [Japanese copy review](ja-copy-review.md) · [Reproduction and integration](repro/README.md)
