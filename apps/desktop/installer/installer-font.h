#pragma once

#include <windows.h>

inline constexpr LPCWSTR InstallerFontName(LANGID language) noexcept {
    return PRIMARYLANGID(language) == LANG_JAPANESE ? L"Yu Gothic UI" : L"Microsoft YaHei UI";
}
