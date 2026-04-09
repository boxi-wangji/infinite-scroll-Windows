import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import * as path from 'path'
import { PtyManager } from './ptyManager'
import { sessionStore } from './sessionStore'

process.env.DIST_ELECTRON = path.join(__dirname)
process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(__dirname, '../public')
  : process.env.DIST

let win: BrowserWindow | null = null
let ptyManager: PtyManager | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 600,
    minHeight: 400,
    backgroundColor: '#000000',
    title: 'Infinite Scroll',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  ptyManager = new PtyManager(win)

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(process.env.DIST!, 'index.html'))
  }

  win.on('closed', () => {
    ptyManager?.killAll()
    win = null
  })

  Menu.setApplicationMenu(buildMenu(win))
}

// ── Chinese application menu ──────────────────────────────────────────────────

function buildMenu(w: BrowserWindow): Menu {
  const send = (action: string) => w.webContents.send('menu:action', action)

  return Menu.buildFromTemplate([
    {
      label: '文件',
      submenu: [
        {
          label: '新建行',
          accelerator: 'CmdOrCtrl+Shift+Down',
          click: () => send('addPanel'),
        },
        { type: 'separator' },
        { label: '退出', role: 'quit' },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', role: 'undo' },
        { label: '重做', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', role: 'cut' },
        { label: '复制文本', role: 'copy' },
        { label: '粘贴', role: 'paste' },
        { label: '全选', role: 'selectAll' },
      ],
    },
    {
      label: '视图',
      submenu: [
        { label: '放大字体', accelerator: 'CmdOrCtrl+=', click: () => send('fontIncrease') },
        { label: '缩小字体', accelerator: 'CmdOrCtrl+-', click: () => send('fontDecrease') },
        { type: 'separator' },
        { label: '重新加载', role: 'reload' },
        { label: '开发者工具', role: 'toggleDevTools' },
      ],
    },
    {
      label: '帮助',
      submenu: [
        { label: '快捷键帮助', accelerator: 'CmdOrCtrl+/', click: () => send('help') },
      ],
    },
  ])
}

// ── PTY IPC handlers ─────────────────────────────────────────────────────────

ipcMain.handle('pty:spawn', (_, id: string, shell: string, cwd: string, cols: number, rows: number) => {
  ptyManager?.spawn(id, shell, cwd, cols, rows)
})

ipcMain.on('pty:write', (_, id: string, data: string) => {
  ptyManager?.write(id, data)
})

ipcMain.on('pty:resize', (_, id: string, cols: number, rows: number) => {
  ptyManager?.resize(id, cols, rows)
})

ipcMain.handle('pty:kill', (_, id: string) => {
  ptyManager?.kill(id)
})

ipcMain.on('pty:updateCwd', (_, id: string, cwd: string) => {
  ptyManager?.updateCwd(id, cwd)
})

// ── Session IPC handlers ──────────────────────────────────────────────────────

ipcMain.handle('session:save', (_, data) => {
  sessionStore.saveSession(data)
})

ipcMain.handle('session:load', () => ({
  panels: sessionStore.getPanels(),
  fontSize: sessionStore.getFontSize(),
  sessions: sessionStore.getSessions(),
}))

ipcMain.handle('session:clear', (_, cellId: string) => {
  sessionStore.clearSession(cellId)
})

ipcMain.handle('session:saveLayout', (_, panels, fontSize: number) => {
  sessionStore.saveLayout(panels, fontSize)
})

// ── Window control IPC handlers ───────────────────────────────────────────────

ipcMain.on('window:minimize', () => win?.minimize())
ipcMain.on('window:maximize', () => {
  if (win?.isMaximized()) win.unmaximize()
  else win?.maximize()
})
ipcMain.on('window:close', () => win?.close())

// ── App lifecycle ─────────────────────────────────────────────────────────────

// Suppress EPIPE and other non-fatal write errors from node-pty
process.on('uncaughtException', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EPIPE' || err.code === 'EIO') return
  console.error('[main] Uncaught exception:', err)
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
