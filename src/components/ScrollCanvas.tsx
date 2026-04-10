import React, { useRef, useEffect, useCallback } from 'react'
import { usePanelStore } from '../store/panelStore'
import { RowView } from './RowView'
import { theme } from '../theme'

export const ScrollCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { panels, focusedPanelId, addPanel, setFontSize, setPanelHeight } = usePanelStore()

  // Ctrl+Wheel → zoom font size
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey) return
    e.preventDefault()
    const { fontSize, setFontSize } = usePanelStore.getState()
    setFontSize(fontSize + (e.deltaY > 0 ? -1 : 1))
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return

      if (e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault()
        addPanel()
        setTimeout(() => {
          const newPanels = usePanelStore.getState().panels
          const last = newPanels[newPanels.length - 1]
          if (last) document.getElementById(`panel-${last.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }, 50)
        return
      }

      if (e.key === '=' || e.key === '+') { e.preventDefault(); setFontSize(usePanelStore.getState().fontSize + 1); return }
      if (e.key === '-')                   { e.preventDefault(); setFontSize(usePanelStore.getState().fontSize - 1); return }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [addPanel, setFontSize])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: '100%',
        overflowY: 'auto', overflowX: 'hidden',
        backgroundColor: theme.bg,
        padding: theme.gap,
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
        gap: 0,
      }}
    >
      {panels.map((panel, idx) => (
        <React.Fragment key={panel.id}>
          <RowView
            panel={panel}
            focused={panel.id === focusedPanelId}
            fillHeight={panels.length === 1}
          />
          {/* Resize handle between panels (not after last) */}
          {idx < panels.length - 1 && (
            <ResizeHandle
              onDrag={(delta, save) => {
                const p = usePanelStore.getState().panels.find(p => p.id === panel.id)
                const current = p?.height ?? theme.defaultPanelHeight
                setPanelHeight(panel.id, Math.max(theme.minPanelHeight, current + delta), save)
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Resize handle between rows ────────────────────────────────────────────────
const ResizeHandle: React.FC<{ onDrag: (delta: number, save: boolean) => void }> = ({ onDrag }) => {
  const [dragging, setDragging] = React.useState(false)

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    let lastY = e.clientY

    const onMove = (ev: MouseEvent) => {
      onDrag(ev.clientY - lastY, false)   // update state only, no disk write
      lastY = ev.clientY
    }
    const onUp = () => {
      setDragging(false)
      onDrag(0, true)                     // save final height to disk on release
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        height: 8,
        flexShrink: 0,
        cursor: 'row-resize',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{
        width: 48,
        height: 2,
        borderRadius: 1,
        backgroundColor: dragging ? theme.borderFocused : theme.border,
        transition: 'background-color 0.1s, width 0.1s',
      }} />
    </div>
  )
}
