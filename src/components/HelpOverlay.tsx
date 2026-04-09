import React from 'react'
import { theme } from '../theme'

interface Props {
  visible: boolean
  onClose: () => void
}

const SHORTCUTS: [string, string][] = [
  ['Ctrl+Shift+↓', '新增行'],
  ['Ctrl+D', '复制当前面板'],
  ['Ctrl+W', '关闭当前面板'],
  ['Ctrl+↑', '焦点移到上一行'],
  ['Ctrl+↓', '焦点移到下一行'],
  ['Ctrl+←', '焦点左移'],
  ['Ctrl+→', '焦点右移'],
  ['Ctrl+滚轮↑', '放大字体'],
  ['Ctrl+滚轮↓', '缩小字体'],
  ['Ctrl+=', '放大字体'],
  ['Ctrl+-', '缩小字体'],
  ['Ctrl+/', '显示 / 隐藏此帮助'],
]

export const HelpOverlay: React.FC<Props> = ({ visible, onClose }) => {
  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme.bgPanel,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          padding: '24px 28px',
          minWidth: 380,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ color: theme.text, margin: '0 0 18px', fontSize: 15, fontWeight: 600 }}>
          快捷键
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {SHORTCUTS.map(([key, desc]) => (
              <tr key={key}>
                <td style={{
                  padding: '5px 20px 5px 0',
                  color: theme.borderFocused,
                  fontFamily: 'Consolas, monospace',
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                }}>
                  {key}
                </td>
                <td style={{ padding: '5px 0', color: theme.text, fontSize: 13 }}>
                  {desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign: 'right', marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              background: theme.borderFocused,
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '5px 14px',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
