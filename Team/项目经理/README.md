# 项目经理 — 总览

## 项目信息

| 字段 | 内容 |
|------|------|
| 项目名 | Infinite Scroll for Windows |
| 目标 | 将 macOS 版 Infinite Scroll 移植到 Windows |
| 源项目 | Swift/SwiftUI/AppKit + SwiftTerm + tmux |
| 技术方案 | Electron + React + TypeScript + xterm.js |
| 立项日期 | 2026-04-09 |

---

## 技术栈对照

| macOS 原版 | Windows 替代 |
|---|---|
| Swift / SwiftUI | TypeScript + React 18 |
| AppKit NSView | Electron BrowserWindow |
| SwiftTerm | xterm.js (@xterm/xterm) |
| tmux 会话持久化 | node-pty + 模拟恢复（保存 cwd + scrollback） |
| NSScrollView | CSS overflow-y: scroll |
| PanelStore (ObservableObject) | Zustand |
| PersistenceManager | electron-store |
| Cmd+ 快捷键 | Ctrl+ 快捷键 |

---

## 团队分工

| 岗位 | 负责模块 | 文件夹 |
|------|----------|--------|
| 前端 | React 渲染进程、xterm.js、Zustand、组件 | `Team/前端/` |
| 后端 | Electron 主进程、node-pty、electron-store、IPC | `Team/后端/` |
| 测试 | 功能测试、会话恢复测试、快捷键测试 | `Team/测试/` |
| 项目经理 | 进度跟踪、决策记录、里程碑管理 | `Team/项目经理/` |

---

## 里程碑

| 阶段 | 内容 | 状态 |
|------|------|------|
| M1 | 项目搭建（Vite + Electron + React 跑通） | ✅ 完成 |
| M2 | 单个终端面板渲染（node-pty + xterm.js 联调） | ✅ 完成 |
| M3 | 无限滚动画布（多行多列布局） | ✅ 完成 |
| M4 | 全部快捷键实现（含 Ctrl+C/V、Ctrl+滚轮缩放） | ✅ 完成 |
| M5 | 会话持久化（布局 + cwd + scrollback 恢复） | ✅ 完成 |
| M6 | 打包为 Windows 安装包（NSIS） | 🔄 进行中 |

---

## 关键决策

见 [`DECISIONS.md`](./DECISIONS.md)

## 进度追踪

见 [`PROGRESS.md`](./PROGRESS.md)
