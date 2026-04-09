import React, { useRef, useEffect, useCallback } from 'react'
import { usePanelStore } from '../store/panelStore'
import { RowView } from './RowView'
import { theme } from '../theme'

export const ScrollCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { panels, focusedPanelId, addPanel, setFontSize } = usePanelStore()

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
        // Scroll to the new (last) panel after render
        setTimeout(() => {
          const newPanels = usePanelStore.getState().panels
          const last = newPanels[newPanels.length - 1]
          if (last) document.getElementById(`panel-${last.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }, 50)
        return
      }

      if (e.key === '=' || e.key === '+') {
        e.preventDefault()
        setFontSize(usePanelStore.getState().fontSize + 1)
        return
      }

      if (e.key === '-') {
        e.preventDefault()
        setFontSize(usePanelStore.getState().fontSize - 1)
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [addPanel, setFontSize])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: theme.bg,
        padding: theme.gap,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: theme.gap,
      }}
    >
      {panels.map(panel => (
        <RowView
          key={panel.id}
          panel={panel}
          focused={panel.id === focusedPanelId}
          fillHeight={panels.length === 1}
        />
      ))}
    </div>
  )
}
