export type CellType = 'terminal' | 'notes'

export interface CellModel {
  id: string
  type: CellType
  name?: string    // 自定义标签名（双击重命名）
  shell?: string   // 该 cell 使用的 shell 路径（terminal 专用）
}

export interface PanelModel {
  id: string
  cells: CellModel[]
  height?: number  // 自定义高度（拖拽调整）
}

export interface SessionData {
  cellId: string
  panelId: string
  cwd: string
  scrollback: string
  cols: number
  rows: number
}
