# 前端职责说明

## 角色定位

负责 Electron **渲染进程**（Renderer Process）的全部开发，即用户看到的界面和交互。

---

## 技术栈

| 技术 | 用途 |
|------|------|
| React 18 + TypeScript | UI 框架 |
| xterm.js (`@xterm/xterm`) | 终端渲染（替代 SwiftTerm） |
| `@xterm/addon-fit` | 终端自适应容器尺寸 |
| `@xterm/addon-serialize` | 序列化 scrollback（会话保存） |
| `@xterm/addon-web-links` | 终端内链接可点击 |
| Zustand | 全局状态管理（替代 PanelStore ObservableObject） |
| CSS-in-JS (inline styles) | 样式方案 |

---

## 组件映射（原版 Swift → Windows React）

| Swift 文件 | React 组件 | 说明 |
|---|---|---|
| `ContentView.swift` | `App.tsx` | 根组件，全局快捷键注册 |
| `CmdScrollView.swift` | `ScrollCanvas.tsx` | 无限滚动画布，Ctrl+滚轮拦截 |
| `RowView.swift` | `RowView.tsx` | 单行，横向排列多个 cell |
| `TerminalWrapper.swift` | `TerminalPanel.tsx` | xterm.js 终端封装 |
| `MarkdownNotesView.swift` | `NotesPanel.tsx` | 笔记面板 |
| `HelpOverlay.swift` | `HelpOverlay.tsx` | 快捷键帮助覆盖层 |
| `PanelModel.swift` | `src/types/models.ts` | 数据模型定义 |
| `PanelStore.swift` | `src/store/panelStore.ts` | Zustand 全局状态 |
| `Theme.swift` | `src/theme.ts` | 颜色 / 间距常量 |

---

## 文件结构

```
src/
├── index.html
├── index.css
├── main.tsx                   # React 入口
├── App.tsx                    # 根组件（ContentView 等价）
├── theme.ts                   # 颜色 / 间距常量
├── types/
│   ├── models.ts              # PanelModel / CellModel 类型
│   └── electron.d.ts          # window.electronAPI 类型声明
├── store/
│   └── panelStore.ts          # Zustand 全局状态
└── components/
    ├── ScrollCanvas.tsx        # 无限滚动画布
    ├── RowView.tsx             # 行视图
    ├── TerminalPanel.tsx       # xterm.js 终端面板
    ├── NotesPanel.tsx          # 笔记面板
    └── HelpOverlay.tsx         # 快捷键帮助
```

---

## IPC 接口（与后端约定）

前端通过 `window.electronAPI` 调用，由 `electron/preload.ts` 注入：

```typescript
window.electronAPI.spawnPty(id, shell, cwd, cols, rows)  // 创建终端
window.electronAPI.writePty(id, data)                     // 写入输入
window.electronAPI.resizePty(id, cols, rows)              // 调整尺寸
window.electronAPI.killPty(id)                            // 关闭终端
window.electronAPI.updateCwd(id, cwd)                     // 上报 CWD 变化
window.electronAPI.onPtyData(id, callback)                // 接收输出（返回取消订阅函数）
window.electronAPI.onPtyExit(id, callback)                // 终端退出事件
window.electronAPI.saveSession(data)                      // 保存会话
window.electronAPI.loadSessions()                         // 读取所有会话
window.electronAPI.clearSession(cellId)                   // 清除单个会话
window.electronAPI.saveLayout(panels, fontSize)           // 保存布局
window.electronAPI.getUserHome()                          // 获取用户主目录
```

---

## CWD 追踪机制（重要）

为了实现"方式 B 会话恢复"，前端需要追踪每个终端的当前工作目录：

1. **OSC 7** 序列：`\e]7;file:///C:/path\x07` — 现代 shell 标准
2. **OSC 9;9** 序列：`\e]9;9;C:\path\x07` — Windows Terminal 格式

在 `TerminalPanel.tsx` 中通过 `term.parser.registerOscHandler` 拦截，并调用 `window.electronAPI.updateCwd` 通知主进程更新。

---

## 注意事项

- xterm.js 必须在组件 mount 后（`useEffect`）初始化，不能在 SSR 阶段运行
- `FitAddon.fit()` 需要容器有实际像素尺寸才能正确计算
- `SerializeAddon.serialize()` 在组件 unmount 时调用，保存 scrollback
- Zustand store 中禁止直接 mutate state，必须通过 action 函数修改
- `window.electronAPI` 在 preload 注入前不可用，确保在 `useEffect` 中调用
