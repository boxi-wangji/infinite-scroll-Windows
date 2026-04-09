export type CellType = 'terminal' | 'notes'

export interface CellModel {
  id: string
  type: CellType
}

export interface PanelModel {
  id: string
  cells: CellModel[]
}

export interface SessionData {
  cellId: string
  panelId: string
  cwd: string
  scrollback: string
  cols: number
  rows: number
}
