import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(err: Error) {
    return { error: err.message + '\n' + err.stack }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          color: '#f48771',
          padding: 24,
          background: '#1e1e1e',
          fontFamily: 'Consolas, monospace',
          fontSize: 13,
          whiteSpace: 'pre-wrap',
          overflow: 'auto',
          height: '100vh',
        }}>
          <strong style={{ color: '#f14c4c' }}>渲染错误（React Error Boundary）</strong>
          {'\n\n'}
          {this.state.error}
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
