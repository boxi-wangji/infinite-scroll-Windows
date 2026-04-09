import React from 'react'
import { PanelModel } from '../types/models'
import { TerminalPanel } from './TerminalPanel'
import { NotesPanel } from './NotesPanel'
import { usePanelStore } from '../store/panelStore'
import { theme } from '../theme'

interface Props {
  panel: PanelModel
  focused: boolean
  fillHeight?: boolean
}

export const RowView: React.FC<Props> = ({ panel, focused, fillHeight }) => {
  const { focusedCellId, setFocus, removeCell, duplicateCell } = usePanelStore()

  return (
    <div
      id={`panel-${panel.id}`}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: theme.gap,
        // Single panel → fill window; multiple → fixed height (scrollable)
        flex: fillHeight ? 1 : undefined,
        height: fillHeight ? undefined : theme.defaultPanelHeight,
        minHeight: theme.minPanelHeight,
        flexShrink: 0,
        borderRadius: theme.panelRadius,
        border: `1px solid ${focused ? theme.borderFocused : theme.border}`,
        overflow: 'hidden',
        backgroundColor: theme.bgPanel,
        // Glow effect on focused row
        boxShadow: focused
          ? `0 0 0 1px ${theme.borderFocused}22, 0 4px 24px ${theme.borderFocused}18`
          : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {panel.cells.map((cell, cellIndex) => {
        const isFocused = focusedCellId === cell.id
        return (
          <div
            key={cell.id}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              // Divider between cells (not before first)
              borderLeft: cellIndex > 0 ? `1px solid ${theme.border}` : 'none',
              position: 'relative',
            }}
          >
            {/* Colored left accent stripe on focused cell */}
            {isFocused && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: theme.accent,
                zIndex: 1,
                borderRadius: '0 1px 1px 0',
              }} />
            )}

            {/* Cell header bar */}
            <div
              style={{
                height: theme.headerHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 8px 0 12px',
                backgroundColor: isFocused ? theme.bgHeaderFocused : theme.bgHeader,
                borderBottom: `1px solid ${isFocused ? theme.borderFocused + '80' : theme.border}`,
                flexShrink: 0,
                userSelect: 'none',
                cursor: 'default',
                transition: 'background-color 0.1s',
              }}
              onClick={() => setFocus(panel.id, cell.id)}
            >
              <span style={{
                color: isFocused ? theme.textLabel : theme.textMuted,
                fontSize: 11,
                fontFamily: '"Cascadia Code", Consolas, monospace',
                letterSpacing: '0.04em',
                transition: 'color 0.1s',
              }}>
                {cell.type === 'terminal' ? '▸ terminal' : '▸ notes'}
              </span>
              <div style={{ display: 'flex', gap: 2, opacity: isFocused ? 1 : 0.4, transition: 'opacity 0.1s' }}>
                <HeaderButton
                  title="复制面板 (Ctrl+D)"
                  onClick={e => { e.stopPropagation(); duplicateCell(panel.id, cell.id) }}
                >
                  ⊕
                </HeaderButton>
                <HeaderButton
                  title="关闭面板 (Ctrl+W)"
                  onClick={e => { e.stopPropagation(); removeCell(panel.id, cell.id) }}
                  danger
                >
                  ✕
                </HeaderButton>
              </div>
            </div>

            {/* Cell content */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {cell.type === 'terminal' ? (
                <TerminalPanel
                  cellId={cell.id}
                  panelId={panel.id}
                  focused={isFocused}
                  onFocus={() => setFocus(panel.id, cell.id)}
                />
              ) : (
                <NotesPanel
                  cellId={cell.id}
                  focused={isFocused}
                  onFocus={() => setFocus(panel.id, cell.id)}
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface HeaderButtonProps {
  title: string
  onClick: (e: React.MouseEvent) => void
  danger?: boolean
  children: React.ReactNode
}

const HeaderButton: React.FC<HeaderButtonProps> = ({ title, onClick, danger, children }) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      color: danger ? theme.danger : theme.textMuted,
      cursor: 'pointer',
      fontSize: 12,
      padding: '2px 6px',
      borderRadius: 3,
      lineHeight: 1,
      opacity: 0.7,
      transition: 'opacity 0.1s, color 0.1s',
    }}
    onMouseEnter={e => { (e.target as HTMLButtonElement).style.opacity = '1' }}
    onMouseLeave={e => { (e.target as HTMLButtonElement).style.opacity = '0.7' }}
  >
    {children}
  </button>
)
