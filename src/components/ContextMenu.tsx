import React, { useEffect, useRef } from 'react'
import { theme } from '../theme'

export interface MenuItem {
  label: string
  action: () => void
  danger?: boolean
  separator?: false
}
export interface MenuSeparator { separator: true }
export type MenuEntry = MenuItem | MenuSeparator

interface Props {
  x: number
  y: number
  items: MenuEntry[]
  onClose: () => void
}

export const ContextMenu: React.FC<Props> = ({ x, y, items, onClose }) => {
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // Clamp to viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth  - 160),
    top:  Math.min(y, window.innerHeight - items.length * 28 - 16),
    backgroundColor: theme.bgHeader,
    border: `1px solid ${theme.border}`,
    borderRadius: 5,
    padding: '4px 0',
    zIndex: 9999,
    minWidth: 150,
    boxShadow: `0 6px 24px rgba(0,0,0,0.7)`,
    userSelect: 'none',
  }

  return (
    <div ref={ref} style={style}>
      {items.map((item, i) => {
        if ('separator' in item && item.separator) {
          return <div key={i} style={{ height: 1, margin: '4px 8px', backgroundColor: theme.border }} />
        }
        const it = item as MenuItem
        return (
          <div
            key={i}
            onClick={() => { it.action(); onClose() }}
            style={{
              padding: '5px 14px',
              color: it.danger ? theme.danger : theme.text,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: '"Cascadia Code", Consolas, monospace',
              transition: 'background 0.08s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = theme.bgHeaderFocused)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {it.label}
          </div>
        )
      })}
    </div>
  )
}
