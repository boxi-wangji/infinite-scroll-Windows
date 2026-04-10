# 后端职责说明

## 角色定位

负责 Electron **主进程**（Main Process）的全部开发，包括 PTY 管理、IPC 桥接、会话持久化、窗口管理。

---

## 技术栈

| 技术 | 用途 |
|------|------|
| Electron | 应用壳，主进程宿主 |
| node-pty | Windows ConPTY 管理（替代 tmux） |
| electron-store v7 | JSON 持久化（v8 为 ESM-only，不兼容） |
| vite-plugin-electron | Vite 集成，开发热重载 |
| electron-builder | NSIS 安装包打包 |

---

## 文件结构

```
electron/
├── main.ts          # Electron 入口，窗口创建，IPC 注册，中文菜单
├── preload.ts       # Context Bridge，向渲染进程暴露 window.electronAPI
├── ptyManager.ts    # node-pty 生命周期管理
└── sessionStore.ts  # electron-store 封装
```

---

## 模块说明

### main.ts

- 创建 `BrowserWindow`（原生 Windows 标题栏，`frame: true`）
- 初始化 `PtyManager`
- 注册全部 IPC 处理器
- 中文应用菜单（文件 / 编辑 / 视图 / 帮助），通过 `menu:action` IPC 事件通知渲染进程

### preload.ts — Context Bridge

暴露 `window.electronAPI`，包括：

```typescript
// Shell 相关（新增）
getDefaultShell()        // 优先返回 PS7 > PS5.1 > CMD
getAvailableShells()     // 返回 { label, path }[] 供 UI 下拉框使用
```

**Shell 检测优先级**：`C:\Program Files\PowerShell\7\pwsh.exe` → `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe` → `%COMSPEC%`

### ptyManager.ts

| 方法 | 说明 |
|------|------|
| `spawn(id, shell, cwd, cols, rows)` | 创建 ConPTY，cwd 不存在时 fallback 到 USERPROFILE |
| `write(id, data)` | 写入数据，try/catch 吞掉 EPIPE |
| `resize(id, cols, rows)` | 调整尺寸，min=1 |
| `kill(id)` | 关闭进程 |
| `updateCwd(id, cwd)` | 更新 CWD 缓存（来自 OSC 7/9） |
| `killAll()` | 退出前全部关闭 |

### sessionStore.ts

持久化数据结构（存储于 `%APPDATA%\infinite-scroll-windows\`）：

```typescript
{
  panels: PanelModel[]   // 含 height、cell.name、cell.shell
  fontSize: number
  sessions: Record<string, SessionData>  // cwd + scrollback
}
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
| `session:saveLayout` | 渲染→主 | invoke | 保存布局（含 height） |
| `menu:action` | 主→渲染 | send | 菜单操作通知 |
| `window:minimize` | 渲染→主 | send | 最小化 |
| `window:maximize` | 渲染→主 | send | 最大化/还原 |
| `window:close` | 渲染→主 | send | 关闭 |

---

## 打包说明

```bash
npm run package   # vite build + electron-builder
```

- 输出目录：`release/`
- 安装包：`Infinite Scroll Setup 1.0.0.exe`（约 79 MB）
- `node-pty` 原生模块通过 `asarUnpack` 排除在 asar 外，确保运行时可加载
- 应用图标：`Resources/AppIcon.ico`（代码生成，`scripts/create-icon.js`）

---

## 注意事项

- `node-pty` 是原生模块，打包时 electron-builder 会自动 rebuild
- `electron-store` 必须用 v7（v8 是 ESM-only，破坏 CJS 主进程构建）
- 主进程不能直接操作 DOM，所有 UI 变更通过 IPC 通知渲染进程
- EPIPE / EIO 错误由 `process.on('uncaughtException')` 静默处理，避免崩溃弹窗
