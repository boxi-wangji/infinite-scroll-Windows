import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { PanelModel, CellModel, SessionData } from '../types/models'

interface PanelState {
  panels: PanelModel[]
  focusedPanelId: string | null
  focusedCellId: string | null
  fontSize: number
  sessions: Record<string, SessionData>

  init: (panels: PanelModel[], fontSize: number, sessions: Record<string, SessionData>) => void
  addPanel: () => void
  removeCell: (panelId: string, cellId: string) => void
  duplicateCell: (panelId: string, cellId: string) => void
  addNotesCell: (panelId: string) => void
  setFocus: (panelId: string, cellId: string) => void
  setFontSize: (size: number) => void
  updateSession: (data: SessionData) => void
  saveLayout: () => void
  renameCell: (panelId: string, cellId: string, name: string) => void
  setCellShell: (panelId: string, cellId: string, shell: string) => void
  setPanelHeight: (panelId: string, height: number, save?: boolean) => void
}

function makeTerminalPanel(): PanelModel {
  return { id: uuidv4(), cells: [{ id: uuidv4(), type: 'terminal' }] }
}

// Start with one panel immediately — never blank on first render
const _boot = makeTerminalPanel()

export const usePanelStore = create<PanelState>((set, get) => ({
  panels: [_boot],
  focusedPanelId: _boot.id,
  focusedCellId: _boot.cells[0].id,
  fontSize: 13,
  sessions: {},

  init(panels, fontSize, sessions) {
    if (panels.length === 0) {
      const panel = makeTerminalPanel()
      set({ panels: [panel], focusedPanelId: panel.id, focusedCellId: panel.cells[0].id, fontSize, sessions })
    } else {
      set({ panels, fontSize, sessions, focusedPanelId: panels[0].id, focusedCellId: panels[0].cells[0]?.id ?? null })
    }
  },

  addPanel() {
    const panel = makeTerminalPanel()
    set(state => ({ panels: [...state.panels, panel], focusedPanelId: panel.id, focusedCellId: panel.cells[0].id }))
    get().saveLayout()
  },

  removeCell(panelId, cellId) {
    window.electronAPI.clearSession(cellId)
    set(state => {
      const panels = state.panels
        .map(p => p.id !== panelId ? p : { ...p, cells: p.cells.filter(c => c.id !== cellId) })
        .filter(p => p.cells.length > 0)

      if (panels.length === 0) {
        const panel = makeTerminalPanel()
        return { panels: [panel], focusedPanelId: panel.id, focusedCellId: panel.cells[0].id }
      }
      const stillFocused = panels.some(p => p.cells.some(c => c.id === state.focusedCellId))
      if (!stillFocused) {
        const first = panels[0]
        return { panels, focusedPanelId: first.id, focusedCellId: first.cells[0].id }
      }
      return { panels }
    })
    get().saveLayout()
  },

  duplicateCell(panelId, cellId) {
    const panel = get().panels.find(p => p.id === panelId)
    const srcCell = panel?.cells.find(c => c.id === cellId)
    const newCell: CellModel = { id: uuidv4(), type: srcCell?.type ?? 'terminal', shell: srcCell?.shell }
    set(state => ({
      panels: state.panels.map(p => {
        if (p.id !== panelId) return p
        const idx = p.cells.findIndex(c => c.id === cellId)
        const cells = [...p.cells]
        cells.splice(idx + 1, 0, newCell)
        return { ...p, cells }
      }),
      focusedCellId: newCell.id,
    }))
    get().saveLayout()
  },

  addNotesCell(panelId) {
    const newCell: CellModel = { id: uuidv4(), type: 'notes' }
    set(state => ({
      panels: state.panels.map(p => p.id === panelId ? { ...p, cells: [...p.cells, newCell] } : p),
      focusedPanelId: panelId,
      focusedCellId: newCell.id,
    }))
    get().saveLayout()
  },

  setFocus(panelId, cellId) {
    set({ focusedPanelId: panelId, focusedCellId: cellId })
  },

  setFontSize(size) {
    const clamped = Math.max(8, Math.min(24, size))
    set({ fontSize: clamped })
    get().saveLayout()
  },

  updateSession(data) {
    set(state => ({ sessions: { ...state.sessions, [data.cellId]: data } }))
    window.electronAPI.saveSession(data)
  },

  saveLayout() {
    const { panels, fontSize } = get()
    window.electronAPI.saveLayout(panels, fontSize)
  },

  renameCell(panelId, cellId, name) {
    set(state => ({
      panels: state.panels.map(p =>
        p.id !== panelId ? p : {
          ...p, cells: p.cells.map(c => c.id === cellId ? { ...c, name } : c)
        }
      )
    }))
    get().saveLayout()
  },

  setCellShell(panelId, cellId, shell) {
    set(state => ({
      panels: state.panels.map(p =>
        p.id !== panelId ? p : {
          ...p, cells: p.cells.map(c => c.id === cellId ? { ...c, shell } : c)
        }
      )
    }))
    get().saveLayout()
  },

  setPanelHeight(panelId, height, save = true) {
    set(state => ({
      panels: state.panels.map(p => p.id === panelId ? { ...p, height } : p)
    }))
    if (save) get().saveLayout()
  },
}))
