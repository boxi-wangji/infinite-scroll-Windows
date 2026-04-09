import React, { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { SerializeAddon } from '@xterm/addon-serialize'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import { xtermTheme } from '../theme'
import { usePanelStore } from '../store/panelStore'

interface Props {
  cellId: string
  panelId: string
  focused: boolean
  onFocus: () => void
}

export const TerminalPanel: React.FC<Props> = ({ cellId, panelId, focused, onFocus }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  // Track latest `focused` prop in a ref so the [] setup effect can read it
  const focusedRef = useRef(focused)
  useEffect(() => { focusedRef.current = focused }, [focused])

  const { fontSize, sessions, updateSession } = usePanelStore()

  // ── Main setup effect (runs once on mount) ────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return

    // ── 1. Create & open terminal ──────────────────────────────────────────
    const term = new Terminal({
      theme: xtermTheme,
      fontSize,
      fontFamily: '"Cascadia Code", Consolas, "Courier New", monospace',
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
      convertEol: false,
    })
    const fitAddon = new FitAddon()
    const serializeAddon = new SerializeAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(serializeAddon)
    term.loadAddon(new WebLinksAddon())
    term.open(containerRef.current)
    fitAddon.fit()

    termRef.current = term
    fitAddonRef.current = fitAddon

    // Focus if this is the active cell
    if (focusedRef.current) term.focus()
    // Keep store in sync when xterm's hidden textarea gets focus (user clicks terminal)
    const handleFocus = () => onFocus()
    term.textarea?.addEventListener('focus', handleFocus)

    // Intercept app-level shortcuts BEFORE xterm processes them.
    // Returning false prevents xterm from sending the key to the PTY.
    // The original DOM event still bubbles naturally to window, so the
    // existing handlers in App.tsx / ScrollCanvas.tsx fire exactly once.
    // DO NOT dispatch a synthetic event — that would cause double-fire.
    term.attachCustomKeyEventHandler((e: KeyboardEvent) => {
      if (!e.ctrlKey || e.type !== 'keydown') return true

      const appKeys = new Set([
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        '=', '+', '-', '/',
        'd', 'w',
      ])

      if (appKeys.has(e.key)) return false  // bubble to window, don't send to PTY

      return true  // everything else (Ctrl+C, Ctrl+L, etc.) goes to the shell
    })

    // ── 2. Restore scrollback (if session exists) ──────────────────────────
    const session = sessions[cellId]
    const initialCwd: string =
      session?.cwd ??
      window.electronAPI?.getUserHome?.() ??
      'C:\\Users'

    const cwdRef = { current: initialCwd }

    if (session?.scrollback) {
      term.write(session.scrollback)
      term.write(`\r\n\x1b[2m[Session restored — ${session.cwd}]\x1b[0m\r\n`)
    }

    // ── 3. Auto-resize ─────────────────────────────────────────────────────
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit()
      const d = fitAddon.proposeDimensions()
      if (d) window.electronAPI?.resizePty?.(cellId, d.cols, d.rows)
    })
    resizeObserver.observe(containerRef.current!)

    // ── 4. Guard: electronAPI required from here on ───────────────────────
    if (typeof window.electronAPI === 'undefined') {
      term.write('\r\n\x1b[31m[ERROR: window.electronAPI is undefined]\x1b[0m\r\n')
      term.write('\x1b[33m[Preload script may have failed to load.]\x1b[0m\r\n')
      return () => {
        resizeObserver.disconnect()
        term.dispose()
      }
    }

    // ── 5. Spawn PTY ───────────────────────────────────────────────────────
    const dims = fitAddon.proposeDimensions() ?? { cols: 80, rows: 24 }
    const shell = window.electronAPI.getDefaultShell()
    window.electronAPI.spawnPty(cellId, shell, cwdRef.current, dims.cols, dims.rows)

    // PTY data → terminal display
    const unsubData = window.electronAPI.onPtyData(cellId, (data) => {
      term.write(data)
    })

    // PTY exit notification
    const unsubExit = window.electronAPI.onPtyExit(cellId, () => {
      term.write('\r\n\x1b[2m[Process exited]\x1b[0m\r\n')
    })

    // Terminal keyboard input → PTY
    const inputDisposable = term.onData((data) => {
      window.electronAPI.writePty(cellId, data)
    })

    // OSC 7: file:///C:/path  (standard CWD reporting)
    const osc7 = term.parser.registerOscHandler(7, (data) => {
      try {
        const url = new URL(data)
        const newCwd = decodeURIComponent(url.pathname).replace(/^\/([A-Za-z]:)/, '$1')
        cwdRef.current = newCwd
        window.electronAPI.updateCwd(cellId, newCwd)
      } catch { /* malformed OSC */ }
      return false
    })

    // OSC 9;9: C:\path  (Windows Terminal CWD reporting)
    const osc9 = term.parser.registerOscHandler(9, (data) => {
      if (data.startsWith('9;')) {
        cwdRef.current = data.slice(2)
        window.electronAPI.updateCwd(cellId, cwdRef.current)
      }
      return false
    })

    // ── 6. Cleanup ─────────────────────────────────────────────────────────
    return () => {
      const scrollback = serializeAddon.serialize()
      const d = fitAddon.proposeDimensions() ?? { cols: 80, rows: 24 }
      updateSession({ cellId, panelId, cwd: cwdRef.current, scrollback, cols: d.cols, rows: d.rows })

      unsubData()
      unsubExit()
      inputDisposable.dispose()
      osc7.dispose()
      osc9.dispose()
      resizeObserver.disconnect()
      term.textarea?.removeEventListener('focus', handleFocus)
      window.electronAPI.killPty(cellId)
      term.dispose()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Font size sync ────────────────────────────────────────────────────────
  useEffect(() => {
    if (termRef.current) {
      termRef.current.options.fontSize = fontSize
      fitAddonRef.current?.fit()
    }
  }, [fontSize])

  // ── Ctrl+Wheel → zoom font (intercept before xterm scrolls) ──────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      e.stopPropagation()
      const { fontSize: fs, setFontSize } = usePanelStore.getState()
      setFontSize(fs + (e.deltaY > 0 ? -1 : 1))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  // ── Focus sync (for focus changes AFTER mount) ────────────────────────────
  useEffect(() => {
    if (focused) termRef.current?.focus()
  }, [focused])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', cursor: 'text' }}
      onClick={onFocus}
    />
  )
}
