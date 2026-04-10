import React from 'react'
import { theme } from '../theme'

interface Props {
  visible: boolean
  onClose: () => void
}

const SECTIONS: { title: string; rows: [string, string][] }[] = [
  {
    title: '布局',
    rows: [
      ['Ctrl+Shift+↓',  '新增行'],
      ['Ctrl+D',        '复制当前面板'],
      ['Ctrl+W',        '关闭当前面板'],
      ['拖动行间分割线',  '调整行高（重启后保留）'],
    ],
  },
  {
    title: '焦点导航',
    rows: [
      ['Ctrl+↑ / Ctrl+↓', '焦点上移 / 下移'],
      ['Ctrl+← / Ctrl+→', '焦点左移 / 右移'],
    ],
  },
  {
    title: '字体',
    rows: [
      ['Ctrl+= / Ctrl+-',  '放大 / 缩小字体'],
      ['Ctrl+滚轮↑↓',      '放大 / 缩小字体'],
    ],
  },
  {
    title: '终端操作',
    rows: [
      ['Ctrl+C',       '有选中文字→复制；无选中→中断信号'],
      ['Ctrl+V',       '粘贴剪贴板'],
      ['右键',          '复制 / 粘贴 / 清屏 / 复制面板 / 关闭'],
    ],
  },
  {
    title: '标签 & Shell',
    rows: [
      ['双击标签名',     '重命名面板'],
      ['标签旁下拉框',   '切换 Shell（PS7 / PS5 / CMD）'],
    ],
  },
  {
    title: '其他',
    rows: [
      ['Ctrl+/',  '显示 / 隐藏此帮助'],
    ],
  },
]

export const HelpOverlay: React.FC<Props> = ({ visible, onClose }) => {
  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme.bgPanel,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          padding: '20px 28px 24px',
          minWidth: 420,
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ color: theme.text, margin: '0 0 16px', fontSize: 14, fontWeight: 600, letterSpacing: '0.05em' }}>
          快捷键 & 操作说明
        </h2>

        {SECTIONS.map(sec => (
          <div key={sec.title} style={{ marginBottom: 14 }}>
            <div style={{ color: theme.textLabel, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, fontFamily: '"Cascadia Code", monospace' }}>
              {sec.title}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {sec.rows.map(([key, desc]) => (
                  <tr key={key}>
                    <td style={{
                      padding: '3px 20px 3px 0',
                      color: theme.borderFocused,
                      fontFamily: 'Consolas, monospace',
                      fontSize: 12,
                      whiteSpace: 'nowrap',
                      verticalAlign: 'top',
                    }}>
                      {key}
                    </td>
                    <td style={{ padding: '3px 0', color: theme.text, fontSize: 12, verticalAlign: 'top' }}>
                      {desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <button
            onClick={onClose}
            style={{
              background: theme.borderFocused, color: '#fff',
              border: 'none', borderRadius: 4,
              padding: '5px 16px', cursor: 'pointer', fontSize: 13,
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
