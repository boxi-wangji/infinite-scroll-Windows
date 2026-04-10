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
| `CmdScrollView.swift` | `ScrollCanvas.tsx` | 无限滚动画布 + 行间拖拽调高 |
| `RowView.swift` | `RowView.tsx` | 单行，横向多 cell + 重命名 + Shell 切换 + 右键菜单 |
| `TerminalWrapper.swift` | `TerminalPanel.tsx` | xterm.js 终端封装，支持指定 shell |
| `MarkdownNotesView.swift` | `NotesPanel.tsx` | 笔记面板 |
| `HelpOverlay.swift` | `HelpOverlay.tsx` | 快捷键帮助覆盖层 |
| *(新增)* | `ContextMenu.tsx` | 右键浮动菜单组件 |
| `PanelModel.swift` | `src/types/models.ts` | 数据模型定义 |
| `PanelStore.swift` | `src/store/panelStore.ts` | Zustand 全局状态 |
| `Theme.swift` | `src/theme.ts` | 颜色 / 间距常量（Dracula 配色，3 套可切换） |

---

## 文件结构

```
src/
├── index.html
├── index.css
├── main.tsx                   # React 入口（含 ErrorBoundary）
├── App.tsx                    # 根组件
├── theme.ts                   # 颜色 / 间距常量（VARIANT 切换 A/B/C）
├── types/
│   ├── models.ts              # PanelModel / CellModel 类型
│   └── electron.d.ts          # window.electronAPI 类型声明
├── store/
│   └── panelStore.ts          # Zustand 全局状态
└── components/
    ├── ScrollCanvas.tsx        # 无限滚动画布 + ResizeHandle
    ├── RowView.tsx             # 行视图（重命名 / Shell 切换 / 右键菜单）
    ├── TerminalPanel.tsx       # xterm.js 终端面板
    ├── NotesPanel.tsx          # 笔记面板
    ├── ContextMenu.tsx         # 右键浮动菜单
    └── HelpOverlay.tsx         # 快捷键帮助（按分类）
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
window.electronAPI.onPtyData(id, callback)                // 接收输出
window.electronAPI.onPtyExit(id, callback)                // 终端退出事件
window.electronAPI.saveSession(data)                      // 保存会话
window.electronAPI.loadSessions()                         // 读取所有会话
window.electronAPI.clearSession(cellId)                   // 清除单个会话
window.electronAPI.saveLayout(panels, fontSize)           // 保存布局（含高度）
window.electronAPI.getUserHome()                          // 获取用户主目录
window.electronAPI.getDefaultShell()                      // 获取默认 Shell 路径
window.electronAPI.getAvailableShells()                   // 获取所有可用 Shell 列表
```

---

## 数据模型

```typescript
interface CellModel {
  id: string
  type: 'terminal' | 'notes'
  name?: string    // 自定义标签名（双击重命名）
  shell?: string   // 该 cell 使用的 shell 路径
}

interface PanelModel {
  id: string
  cells: CellModel[]
  height?: number  // 自定义行高（拖拽调整，重启后保留）
}
```

---

## 关键交互说明

### Ctrl+C 双重行为
- 有选中文字 → 复制到剪贴板（不发中断信号）
- 无选中 → 发 `\x03` 中断信号给 shell
- 通过 `term.attachCustomKeyEventHandler` 实现，检查 `term.getSelection()`

### Ctrl+V 粘贴
- **键盘**：让 xterm 通过 textarea `paste` 事件原生处理（不额外拦截，避免双写）
- **右键菜单**：直接调用 `writePty` 写入剪贴板内容

### 右键菜单
- 终端内容区：在 `TerminalPanel` useEffect 中用 `capture: true` 拦截 contextmenu 事件，传入当前 xterm 选中文字
- 面板头部：React `onContextMenu` 事件处理

### Shell 切换
- header 右侧 `<select>` 下拉框，切换时修改 `cell.shell`
- `TerminalPanel` 的 `key={cellId + shell}` 发生变化 → React 重新挂载 → 旧 PTY 自动销毁、新 shell 启动

### 行高拖拽
- `ResizeHandle` 组件放置于相邻行之间
- 拖拽过程中调用 `setPanelHeight(id, height, false)` 仅更新内存状态（流畅）
- 松手时调用 `setPanelHeight(id, height, true)` 写入磁盘（节省 IO）

---

## CWD 追踪机制

1. **OSC 7**：`\e]7;file:///C:/path\x07`（现代 shell 标准）
2. **OSC 9;9**：`\e]9;9;C:\path\x07`（Windows Terminal 格式）

在 `TerminalPanel.tsx` 中通过 `term.parser.registerOscHandler` 拦截，调用 `window.electronAPI.updateCwd`。

---

## 注意事项

- xterm.js 必须在 `useEffect` 中初始化，不能在渲染阶段运行
- `FitAddon.fit()` 需要容器有实际像素尺寸
- `SerializeAddon.serialize()` 在组件 unmount 时调用，保存 scrollback
- Zustand store 中禁止直接 mutate state，必须通过 action 修改
- `window.electronAPI` 在 preload 注入前不可用，确保在 `useEffect` 中调用
