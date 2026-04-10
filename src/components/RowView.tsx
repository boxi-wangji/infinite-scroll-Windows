import React, { useState, useRef, useEffect } from 'react'
import { PanelModel } from '../types/models'
import { TerminalPanel } from './TerminalPanel'
import { NotesPanel } from './NotesPanel'
import { ContextMenu, MenuEntry } from './ContextMenu'
import { usePanelStore } from '../store/panelStore'
import { theme } from '../theme'

interface Props {
  panel: PanelModel
  focused: boolean
  fillHeight?: boolean
}

interface CtxState { x: number; y: number; panelId: string; cellId: string; selection: string }

// Available shells — read once at module load
const SHELLS = typeof window !== 'undefined' && window.electronAPI
  ? window.electronAPI.getAvailableShells()
  : []

export const RowView: React.FC<Props> = ({ panel, focused, fillHeight }) => {
  const { focusedCellId, setFocus, removeCell, duplicateCell, renameCell, setCellShell } = usePanelStore()
  const [ctx, setCtx] = useState<CtxState | null>(null)

  return (
    <>
      <div
        id={`panel-${panel.id}`}
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: theme.gap,
          flex: fillHeight ? 1 : undefined,
          height: fillHeight ? undefined : (panel.height ?? theme.defaultPanelHeight),
          minHeight: theme.minPanelHeight,
          flexShrink: 0,
          borderRadius: theme.panelRadius,
          border: `1px solid ${focused ? theme.borderFocused : theme.border}`,
          overflow: 'hidden',
          backgroundColor: theme.bgPanel,
          boxShadow: focused
            ? `0 0 0 1px ${theme.borderFocused}22, 0 4px 24px ${theme.borderFocused}18`
            : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {panel.cells.map((cell, cellIndex) => {
          const isFocused = focusedCellId === cell.id
          const label = cell.name ?? (cell.type === 'terminal' ? 'terminal' : 'notes')

          return (
            <div
              key={cell.id}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                borderLeft: cellIndex > 0 ? `1px solid ${theme.border}` : 'none',
                position: 'relative',
              }}
            >
              {/* Focused accent stripe */}
              {isFocused && (
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: 2, backgroundColor: theme.accent, zIndex: 1,
                  borderRadius: '0 1px 1px 0',
                }} />
              )}

              {/* Header */}
              <div
                style={{
                  height: theme.headerHeight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 6px 0 12px',
                  backgroundColor: isFocused ? theme.bgHeaderFocused : theme.bgHeader,
                  borderBottom: `1px solid ${isFocused ? theme.borderFocused + '80' : theme.border}`,
                  flexShrink: 0,
                  userSelect: 'none',
                  cursor: 'default',
                  transition: 'background-color 0.1s',
                }}
                onClick={() => setFocus(panel.id, cell.id)}
                onContextMenu={e => {
                  e.preventDefault()
                  setCtx({ x: e.clientX, y: e.clientY, panelId: panel.id, cellId: cell.id, selection: '' })
                }}
              >
                {/* Label — double-click to rename */}
                <CellLabel
                  label={label}
                  focused={isFocused}
                  onRename={name => renameCell(panel.id, cell.id, name)}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 2, opacity: isFocused ? 1 : 0.4, transition: 'opacity 0.1s' }}>
                  {/* Shell selector (terminal only) */}
                  {cell.type === 'terminal' && SHELLS.length > 1 && (
                    <ShellSelector
                      current={cell.shell ?? window.electronAPI?.getDefaultShell()}
                      shells={SHELLS}
                      onChange={path => setCellShell(panel.id, cell.id, path)}
                    />
                  )}
                  <HeaderButton title="复制面板 (Ctrl+D)" onClick={e => { e.stopPropagation(); duplicateCell(panel.id, cell.id) }}>⊕</HeaderButton>
                  <HeaderButton title="关闭面板 (Ctrl+W)" onClick={e => { e.stopPropagation(); removeCell(panel.id, cell.id) }} danger>✕</HeaderButton>
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                {cell.type === 'terminal' ? (
                  <TerminalPanel
                    key={`${cell.id}-${cell.shell ?? 'default'}`}
                    cellId={cell.id}
                    panelId={panel.id}
                    focused={isFocused}
                    shell={cell.shell}
                    onFocus={() => setFocus(panel.id, cell.id)}
                    onContextMenu={(x, y, sel) => setCtx({ x, y, panelId: panel.id, cellId: cell.id, selection: sel })}
                  />
                ) : (
                  <NotesPanel cellId={cell.id} focused={isFocused} onFocus={() => setFocus(panel.id, cell.id)} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Right-click context menu */}
      {ctx && (
        <ContextMenu
          x={ctx.x} y={ctx.y}
          onClose={() => setCtx(null)}
          items={buildMenu(ctx, setCtx)}
        />
      )}
    </>
  )
}

// ── Context menu items ────────────────────────────────────────────────────────
function buildMenu(ctx: CtxState, setCtx: (v: CtxState | null) => void): MenuEntry[] {
  const { duplicateCell, removeCell } = usePanelStore.getState()
  return [
    {
      label: ctx.selection ? '复制  Ctrl+C' : '复制  (无选中)',
      action: () => { if (ctx.selection) navigator.clipboard.writeText(ctx.selection) },
    },
    {
      label: '粘贴  Ctrl+V',
      action: () => {
        navigator.clipboard.readText().then(text => {
          if (text) window.electronAPI.writePty(ctx.cellId, text)
        })
      },
    },
    {
      label: '清屏  Ctrl+L',
      action: () => window.electronAPI.writePty(ctx.cellId, '\x0c'),
    },
    { separator: true },
    {
      label: '复制面板  Ctrl+D',
      action: () => duplicateCell(ctx.panelId, ctx.cellId),
    },
    {
      label: '关闭面板  Ctrl+W',
      action: () => removeCell(ctx.panelId, ctx.cellId),
      danger: true,
    },
  ]
}

// ── Inline label with double-click rename ─────────────────────────────────────
const CellLabel: React.FC<{
  label: string
  focused: boolean
  onRename: (name: string) => void
}> = ({ label, focused, onRename }) => {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setValue(label) }, [label])
  useEffect(() => { if (editing) inputRef.current?.select() }, [editing])

  const commit = () => {
    setEditing(false)
    const trimmed = value.trim()
    if (trimmed && trimmed !== label) onRename(trimmed)
    else setValue(label)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setEditing(false); setValue(label) }
          e.stopPropagation()
        }}
        style={{
          background: theme.bgPanel,
          border: `1px solid ${theme.borderFocused}`,
          color: theme.text,
          borderRadius: 3,
          padding: '1px 5px',
          fontSize: 11,
          fontFamily: '"Cascadia Code", Consolas, monospace',
          outline: 'none',
          width: 100,
        }}
      />
    )
  }

  return (
    <span
      style={{ color: focused ? theme.textLabel : theme.textMuted, fontSize: 11, fontFamily: '"Cascadia Code", Consolas, monospace', letterSpacing: '0.04em' }}
      title="双击重命名"
      onDoubleClick={e => { e.stopPropagation(); setEditing(true) }}
    >
      ▸ {label}
    </span>
  )
}

// ── Shell selector ────────────────────────────────────────────────────────────
const ShellSelector: React.FC<{
  current: string | undefined
  shells: { label: string; path: string }[]
  onChange: (path: string) => void
}> = ({ current, shells, onChange }) => {
  const active = shells.find(s => s.path === current) ?? shells[0]
  return (
    <select
      value={current ?? ''}
      onClick={e => e.stopPropagation()}
      onChange={e => onChange(e.target.value)}
      title="切换 Shell"
      style={{
        background: theme.bgPanel,
        border: `1px solid ${theme.border}`,
        color: theme.textMuted,
        borderRadius: 3,
        fontSize: 10,
        padding: '1px 3px',
        cursor: 'pointer',
        outline: 'none',
        fontFamily: '"Cascadia Code", Consolas, monospace',
        marginRight: 2,
      }}
    >
      {shells.map(s => (
        <option key={s.path} value={s.path} style={{ background: theme.bgHeader }}>{s.label}</option>
      ))}
    </select>
  )
}

// ── Header button ─────────────────────────────────────────────────────────────
const HeaderButton: React.FC<{
  title: string
  onClick: (e: React.MouseEvent) => void
  danger?: boolean
  children: React.ReactNode
}> = ({ title, onClick, danger, children }) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      background: 'none', border: 'none',
      color: danger ? theme.danger : theme.textMuted,
      cursor: 'pointer', fontSize: 12,
      padding: '2px 6px', borderRadius: 3, lineHeight: 1, opacity: 0.7,
    }}
    onMouseEnter={e => { (e.target as HTMLButtonElement).style.opacity = '1' }}
    onMouseLeave={e => { (e.target as HTMLButtonElement).style.opacity = '0.7' }}
  >
    {children}
  </button>
)
