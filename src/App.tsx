import React, { useEffect, useState } from 'react'
import { ScrollCanvas } from './components/ScrollCanvas'
import { HelpOverlay } from './components/HelpOverlay'
import { usePanelStore } from './store/panelStore'
import { theme } from './theme'

export const App: React.FC = () => {
  const [helpVisible, setHelpVisible] = useState(false)

  // Load persisted sessions on startup — guarded so blank screen never happens
  useEffect(() => {
    if (typeof window.electronAPI === 'undefined') return   // Electron preload not ready
    window.electronAPI.loadSessions()
      .then(({ panels, fontSize, sessions }) => {
        usePanelStore.getState().init(panels, fontSize, sessions)
      })
      .catch(() => { /* keep the boot panel already in store */ })
  }, [])

  // Handle menu actions from Electron native menu (中文菜单 → IPC → here)
  useEffect(() => {
    if (typeof window.electronAPI === 'undefined') return
    return window.electronAPI.onMenuAction((action: string) => {
      const s = usePanelStore.getState()
      if (action === 'addPanel') s.addPanel()
      if (action === 'fontIncrease') s.setFontSize(s.fontSize + 1)
      if (action === 'fontDecrease') s.setFontSize(s.fontSize - 1)
      if (action === 'help') setHelpVisible(v => !v)
    })
  }, [])

  // Global navigation & help shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return

      // Ctrl+/ — toggle help
      if (e.key === '/') {
        e.preventDefault()
        setHelpVisible(v => !v)
        return
      }

      // Ctrl+↑ / Ctrl+↓ — move focus between rows
      if (!e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault()
        navigateRow(-1)
        return
      }
      if (!e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault()
        navigateRow(1)
        return
      }

      // Ctrl+← / Ctrl+→ — move focus between cells in a row
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateCell(-1)
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateCell(1)
        return
      }

      // Ctrl+D — duplicate focused cell
      if (e.key === 'd') {
        e.preventDefault()
        const s = usePanelStore.getState()
        if (s.focusedPanelId && s.focusedCellId) {
          s.duplicateCell(s.focusedPanelId, s.focusedCellId)
        }
        return
      }

      // Ctrl+W — close focused cell
      if (e.key === 'w') {
        e.preventDefault()
        const s = usePanelStore.getState()
        if (s.focusedPanelId && s.focusedCellId) {
          s.removeCell(s.focusedPanelId, s.focusedCellId)
        }
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: theme.bg }}>
      <ScrollCanvas />
      <HelpOverlay visible={helpVisible} onClose={() => setHelpVisible(false)} />
    </div>
  )
}

// ── Row/Cell navigation helpers ───────────────────────────────────────────────

function navigateRow(dir: -1 | 1) {
  const s = usePanelStore.getState()
  const idx = s.panels.findIndex(p => p.id === s.focusedPanelId)
  const target = s.panels[idx + dir]
  if (!target) return
  const cell = target.cells[0]
  if (cell) {
    s.setFocus(target.id, cell.id)
    document.getElementById(`panel-${target.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function navigateCell(dir: -1 | 1) {
  const s = usePanelStore.getState()
  const panel = s.panels.find(p => p.id === s.focusedPanelId)
  if (!panel) return
  const idx = panel.cells.findIndex(c => c.id === s.focusedCellId)
  const target = panel.cells[idx + dir]
  if (target) s.setFocus(panel.id, target.id)
}
