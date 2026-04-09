import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // ── PTY 操作（渲染进程 → 主进程）────────────────────────────────────
  spawnPty: (id: string, shell: string, cwd: string, cols: number, rows: number) =>
    ipcRenderer.invoke('pty:spawn', id, shell, cwd, cols, rows),

  writePty: (id: string, data: string) =>
    ipcRenderer.send('pty:write', id, data),

  resizePty: (id: string, cols: number, rows: number) =>
    ipcRenderer.send('pty:resize', id, cols, rows),

  killPty: (id: string) =>
    ipcRenderer.invoke('pty:kill', id),

  updateCwd: (id: string, cwd: string) =>
    ipcRenderer.send('pty:updateCwd', id, cwd),

  // ── PTY 事件（主进程 → 渲染进程）────────────────────────────────────
  onPtyData: (id: string, callback: (data: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, ptyId: string, data: string) => {
      if (ptyId === id) callback(data)
    }
    ipcRenderer.on('pty:data', handler)
    return () => ipcRenderer.removeListener('pty:data', handler)
  },

  onPtyExit: (id: string, callback: () => void) => {
    const handler = (_: Electron.IpcRendererEvent, ptyId: string) => {
      if (ptyId === id) callback()
    }
    ipcRenderer.on('pty:exit', handler)
    return () => ipcRenderer.removeListener('pty:exit', handler)
  },

  // ── 会话持久化 ───────────────────────────────────────────────────────
  saveSession: (data: unknown) =>
    ipcRenderer.invoke('session:save', data),

  loadSessions: () =>
    ipcRenderer.invoke('session:load'),

  clearSession: (cellId: string) =>
    ipcRenderer.invoke('session:clear', cellId),

  saveLayout: (panels: unknown[], fontSize: number) =>
    ipcRenderer.invoke('session:saveLayout', panels, fontSize),

  // ── 窗口控制 ─────────────────────────────────────────────────────────
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  // ── 菜单动作（主进程 → 渲染进程）────────────────────────────────────
  onMenuAction: (callback: (action: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, action: string) => callback(action)
    ipcRenderer.on('menu:action', handler)
    return () => ipcRenderer.removeListener('menu:action', handler)
  },

  // ── 环境信息 ─────────────────────────────────────────────────────────
  getUserHome: (): string =>
    process.env.USERPROFILE || process.env.HOME || 'C:\\',

  getDefaultShell: (): string => {
    // Prefer PowerShell 7 (pwsh) > PowerShell 5.1 > CMD
    try {
      const fs = require('fs') as typeof import('fs')
      const ps7 = 'C:\\Program Files\\PowerShell\\7\\pwsh.exe'
      const ps5 = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
      if (fs.existsSync(ps7)) return ps7
      if (fs.existsSync(ps5)) return ps5
    } catch { /* fall through */ }
    return process.env.COMSPEC || 'C:\\Windows\\System32\\cmd.exe'
  },
})
