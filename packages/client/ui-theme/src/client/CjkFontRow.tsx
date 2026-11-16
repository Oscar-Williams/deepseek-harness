/** Regional glyph preference within the existing font settings group. */
import { useState } from 'react'
import { Button, IconChevronDownOutlineRegular, Menu } from '@deepseek-ai/dsh-client-ui-primitives'
import { CJK_GLYPH_REGIONS } from '../font-policy.ts'
import type { FontSettingsGroupProps } from './FontSettingsGroup.tsx'
import css from './FontSizeRow.module.css'

type CjkFontRowProps = Pick<FontSettingsGroupProps, 't' | 'useStore' | 'setCjkGlyphRegion'>

/**
 * Render the persisted content-region selector with localized labels.
 * @param props - bound font store, translations and region write.
 * @returns the settings row and its portalled selection menu.
 */
export function CjkFontRow({ t, useStore, setCjkGlyphRegion }: CjkFontRowProps) {
  const active = useStore(state => state.cjkGlyphRegion)
  const [open, setOpen] = useState(false)
  return <div className={css.row}>
    <div className={css.rowText}>
      <div className={css.title}>{t('cjk.title')}</div>
      <div className={css.desc}>{t('cjk.description')}</div>
    </div>
    <Menu open={open} onClose={() => { setOpen(false) }} portal align="end"
      items={CJK_GLYPH_REGIONS.map(id => ({ id, label: t(`cjk.${id}`) }))}
      selectedId={active}
      onSelect={(id) => {
        const region = CJK_GLYPH_REGIONS.find(value => value === id)
        if (region !== undefined) setCjkGlyphRegion(region)
        setOpen(false)
      }}
      anchor={<Button variant="outline" aria-label={t('cjk.title')} aria-haspopup="menu"
        aria-expanded={open} onClick={() => { setOpen(value => !value) }}>
        {t(`cjk.${active}`)}<IconChevronDownOutlineRegular />
      </Button>} />
  </div>
}
