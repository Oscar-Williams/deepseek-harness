# Japanese copy and character forms for DeepSeek Harness rc.3

A Japanese session in rc.3 can draw its Han characters with a Simplified Chinese face. Its composer also uses labels that obscure whether a message waits or changes the running task. The candidate fixes those paths from startup through the conversation and terminal, and carries the Windows installer and independent desktop window fixes on the same branch.

Japanese prose can use Japanese faces inside a Chinese or English interface. The new **CJK character forms** setting covers unmarked text, code and terminals. In automatic mode, the interface language supplies the default, followed by the first CJK browser language and the platform fallback. CJK controls follow the interface language, and explicit language tags within content take precedence. User font lists remain first. Code continues to use Latin monospace fonts, with a regional fallback for CJK characters.

The Japanese terminology pass describes the action or state. An inactive-but-set goal is waiting to continue, clearing the goal removes it, queued messages are waiting to send, and steering adds instructions to the running task. The change table includes the relevant UI context, original strings and translations. The settings use the existing eight client dictionaries.

The source history starts at `38a6a5c965aa99ab525161efb7cc5cf1fe62fced`. The review candidate is `e944ab650c861cb7dc697dab718b88fdff884890`. [Compare with rc.3](https://github.com/deepseek-ai/deepseek-harness/compare/38a6a5c965aa99ab525161efb7cc5cf1fe62fced...Oscar-Williams:fix/japanese-product-experience-rc3)

The Windows acceptance covers the system Japanese IME, Edge page translation, Firefox rendering, an isolated Electron launch and the native installer.

[Verification matrix](verification.md) · [Japanese copy review](ja-copy-review.md) · [Reproduction and integration](repro/README.md)
