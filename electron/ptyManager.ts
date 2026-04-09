import * as pty from 'node-pty'
import * as fs from 'fs'
import { BrowserWindow } from 'electron'

interface PtyEntry {
  process: pty.IPty
  cwd: string
}

export class PtyManager {
  private ptys = new Map<string, PtyEntry>()
  private win: BrowserWindow

  constructor(win: BrowserWindow) {
    this.win = win
  }

  spawn(id: string, shell: string, cwd: string, cols: number, rows: number): void {
    if (this.ptys.has(id)) return

    // Fallback: if cwd doesn't exist on disk, use home directory
    let safeCwd: string
    try {
      fs.accessSync(cwd)
      safeCwd = cwd
    } catch {
      safeCwd = process.env.USERPROFILE ?? 'C:\\'
    }

    let ptyProcess: pty.IPty
    try {
      ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-256color',
        cols: Math.max(cols, 1),
        rows: Math.max(rows, 1),
        cwd: safeCwd,
        env: { ...process.env } as Record<string, string>,
      })
    } catch (err) {
      const msg = `\r\n\x1b[31m[Failed to spawn ${shell}: ${err}]\x1b[0m\r\n`
      if (!this.win.isDestroyed()) {
        this.win.webContents.send('pty:data', id, msg)
      }
      return
    }

    this.ptys.set(id, { process: ptyProcess, cwd: safeCwd })

    ptyProcess.onData((data) => {
      if (!this.win.isDestroyed()) {
        this.win.webContents.send('pty:data', id, data)
      }
    })

    ptyProcess.onExit(() => {
      this.ptys.delete(id)
      if (!this.win.isDestroyed()) {
        this.win.webContents.send('pty:exit', id)
      }
    })
  }

  write(id: string, data: string): void {
    const entry = this.ptys.get(id)
    if (!entry) return
    try {
      entry.process.write(data)
    } catch { /* EPIPE — process already exited */ }
  }

  resize(id: string, cols: number, rows: number): void {
    const entry = this.ptys.get(id)
    if (entry) {
      try {
        entry.process.resize(Math.max(cols, 1), Math.max(rows, 1))
      } catch {
        // process may have already exited
      }
    }
  }

  kill(id: string): void {
    const entry = this.ptys.get(id)
    if (entry) {
      try { entry.process.kill() } catch { /* ignore */ }
      this.ptys.delete(id)
    }
  }

  updateCwd(id: string, cwd: string): void {
    const entry = this.ptys.get(id)
    if (entry) entry.cwd = cwd
  }

  getCwd(id: string): string {
    return (
      this.ptys.get(id)?.cwd ??
      process.env.USERPROFILE ??
      'C:\\'
    )
  }

  killAll(): void {
    for (const [id] of this.ptys) {
      this.kill(id)
    }
  }
}
