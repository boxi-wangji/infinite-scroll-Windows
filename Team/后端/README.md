# 后端职责说明

## 角色定位

负责 Electron **主进程**（Main Process）的全部开发，包括 PTY 管理、IPC 桥接、会话持久化、窗口管理。

---

## 技术栈

| 技术 | 用途 |
|------|------|
| Electron | 应用壳，主进程宿主 |
| node-pty | Windows ConPTY 管理（替代 tmux + SwiftTerm PTY） |
| electron-store | JSON 持久化（替代 PersistenceManager） |
| vite-plugin-electron | Vite 集成，开发热重载 |
| electron-builder | NSIS 安装包打包 |

---

## 文件结构

```
electron/
├── main.ts          # Electron 入口，窗口创建，IPC 注册
├── preload.ts       # Context Bridge，向渲染进程暴露 API
├── ptyManager.ts    # node-pty 生命周期管理（替代 TmuxManager.swift）
└── sessionStore.ts  # electron-store 封装（替代 PersistenceManager.swift）
```

---

## 模块说明

### main.ts — Electron 入口

- 创建 `BrowserWindow`（`frame: false`，无边框）
- 初始化 `PtyManager`
- 注册全部 IPC 处理器
- 监听 `before-quit`，触发退出前保存

### preload.ts — Context Bridge

- 通过 `contextBridge.exposeInMainWorld` 向渲染进程暴露 `window.electronAPI`
- 所有 IPC 调用必须经过这里，**不允许渲染进程直接 require electron**

### ptyManager.ts — PTY 管理（核心）

替代 macOS 版 `TmuxManager.swift` + tmux 的角色：

| Swift/tmux 功能 | Windows 实现 |
|---|---|
| tmux new-session | `pty.spawn(shell, [], { cwd, cols, rows })` |
| tmux attach | 无等价物（ConPTY 不支持 reattach，用 scrollback 模拟） |
| tmux kill-session | `ptyProcess.kill()` |
| 会话持久化 | `electron-store` 保存 cwd + xterm.js scrollback |

**关键 API：**
```typescript
ptyManager.spawn(id, shell, cwd, cols, rows)   // 创建 ConPTY
ptyManager.write(id, data)                      // 写入数据
ptyManager.resize(id, cols, rows)               // 调整尺寸
ptyManager.kill(id)                             // 关闭进程
ptyManager.updateCwd(id, cwd)                   // 更新 CWD 缓存（来自 OSC 7/9 上报）
ptyManager.getCwd(id)                           // 读取当前 CWD
ptyManager.killAll()                            // 退出前全部关闭
```

### sessionStore.ts — 持久化

```typescript
sessionStore.getPanels()              // 读取面板布局
sessionStore.setPanels(panels)        // 保存面板布局
sessionStore.getFontSize()            // 读取字体大小
sessionStore.setFontSize(size)        // 保存字体大小
sessionStore.getSessions()            // 读取所有 session（cwd + scrollback）
sessionStore.saveSession(data)        // 保存单个 session
sessionStore.clearSession(cellId)     // 删除单个 session
```

---

## IPC 频道定义

| 频道 | 方向 | 类型 | 说明 |
|------|------|------|------|
| `pty:spawn` | 渲染→主 | invoke | 创建 PTY |
| `pty:write` | 渲染→主 | send | 写入数据 |
| `pty:resize` | 渲染→主 | send | 调整尺寸 |
| `pty:kill` | 渲染→主 | invoke | 关闭 PTY |
| `pty:updateCwd` | 渲染→主 | send | 更新 CWD |
| `pty:data` | 主→渲染 | send | PTY 输出数据 |
| `pty:exit` | 主→渲染 | send | PTY 进程退出 |
| `session:save` | 渲染→主 | invoke | 保存会话数据 |
| `session:load` | 渲染→主 | invoke | 加载全部会话 |
| `session:clear` | 渲染→主 | invoke | 清除单个会话 |
| `session:saveLayout` | 渲染→主 | invoke | 保存面板布局 |
| `window:minimize` | 渲染→主 | send | 最小化窗口 |
| `window:maximize` | 渲染→主 | send | 最大化/还原窗口 |
| `window:close` | 渲染→主 | send | 关闭窗口 |

---

## 注意事项

- `node-pty` 是原生 Node.js 模块，必须在打包前执行 `electron-rebuild -f -w node-pty`
- `electron-store` 默认存储路径：`%APPDATA%\infinite-scroll-windows\config.json`
- 主进程不能直接操作 DOM，所有 UI 变更通过 IPC 通知渲染进程
- IPC handler 中使用 `ipcMain.handle`（返回 Promise）替代 `ipcMain.on`（fire-and-forget），保证异步安全
