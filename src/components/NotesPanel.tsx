import React, { useState, useEffect } from 'react'
import { theme } from '../theme'

interface Props {
  cellId: string
  focused: boolean
  onFocus: () => void
}

export const NotesPanel: React.FC<Props> = ({ cellId, focused, onFocus }) => {
  const storageKey = `notes-${cellId}`
  const [content, setContent] = useState(() => localStorage.getItem(storageKey) ?? '')

  useEffect(() => {
    localStorage.setItem(storageKey, content)
  }, [content, storageKey])

  return (
    <textarea
      value={content}
      onChange={e => setContent(e.target.value)}
      onClick={onFocus}
      placeholder="Markdown 笔记..."
      style={{
        width: '100%',
        height: '100%',
        background: theme.bgPanel,
        color: theme.text,
        border: 'none',
        outline: 'none',
        resize: 'none',
        padding: '10px 12px',
        fontFamily: '"Cascadia Code", Consolas, monospace',
        fontSize: 13,
        lineHeight: 1.6,
        boxSizing: 'border-box',
      }}
    />
  )
}
