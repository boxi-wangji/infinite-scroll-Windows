import { PanelModel, SessionData } from './models'

export {}

// Allow WebkitAppRegion in inline styles (Electron drag regions)
declare module 'react' {
  interface CSSProperties {
    WebkitAppRegion?: 'drag' | 'no-drag'
  }
}

declare global {
  interface Window {
    electronAPI: {
      // PTY 操作
      spawnPty: (id: string, shell: string, cwd: string, cols: number, rows: number) => Promise<void>
      writePty: (id: string, data: string) => void
      resizePty: (id: string, cols: number, rows: number) => void
      killPty: (id: string) => Promise<void>
      updateCwd: (id: string, cwd: string) => void

      // PTY 事件（返回取消订阅函数）
      onPtyData: (id: string, callback: (data: string) => void) => () => void
      onPtyExit: (id: string, callback: () => void) => () => void

      // 会话持久化
      saveSession: (data: SessionData) => Promise<void>
      loadSessions: () => Promise<{
        panels: PanelModel[]
        fontSize: number
        sessions: Record<string, SessionData>
      }>
      clearSession: (cellId: string) => Promise<void>
      saveLayout: (panels: PanelModel[], fontSize: number) => Promise<void>

      // 窗口控制
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void

      // 菜单动作（返回取消订阅函数）
      onMenuAction: (callback: (action: string) => void) => () => void

      // 环境信息
      getUserHome: () => string
      getDefaultShell: () => string
      getAvailableShells: () => { label: string; path: string }[]
    }
  }
}
