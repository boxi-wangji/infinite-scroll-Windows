# 项目进度

> 状态标记：⬜ 待开始 · 🔄 进行中 · ✅ 完成 · ❌ 阻塞

---

## M1 · 项目搭建 ✅

| # | 任务 | 负责 | 状态 |
|---|------|------|------|
| 1.1 | 初始化 package.json（Electron + Vite + React） | 后端 | ✅ |
| 1.2 | 配置 vite.config.ts（vite-plugin-electron + native externals） | 后端 | ✅ |
| 1.3 | 配置 tsconfig.json / tsconfig.node.json | 后端 | ✅ |
| 1.4 | 配置 electron-builder.yml（NSIS 打包） | 后端 | ✅ |
| 1.5 | Hello World：Electron 窗口 + React 页面跑通 | 后端 | ✅ |

---

## M2 · 单终端面板 ✅

| # | 任务 | 负责 | 状态 |
|---|------|------|------|
| 2.1 | electron/ptyManager.ts：node-pty 生命周期管理 | 后端 | ✅ |
| 2.2 | electron/preload.ts：IPC Context Bridge | 后端 | ✅ |
| 2.3 | IPC 频道：spawn / write / resize / kill / data / exit | 后端 | ✅ |
| 2.4 | TerminalPanel.tsx：xterm.js 渲染 + FitAddon + SerializeAddon | 前端 | ✅ |
| 2.5 | node-pty ↔ xterm.js 数据双向联调 | 前端+后端 | ✅ |
| 2.6 | OSC 7 / OSC 9;9 CWD 拦截 | 前端 | ✅ |

---

## M3 · 无限滚动画布 ✅

| # | 任务 | 负责 | 状态 |
|---|------|------|------|
| 3.1 | types/models.ts：PanelModel / CellModel 定义 | 前端 | ✅ |
| 3.2 | store/panelStore.ts：Zustand 全局状态 | 前端 | ✅ |
| 3.3 | ScrollCanvas.tsx：垂直无限滚动容器 | 前端 | ✅ |
| 3.4 | RowView.tsx：横向多 cell 布局 | 前端 | ✅ |
| 3.5 | 单面板时撑满窗口，多面板固定高度可滚动 | 前端 | ✅ |
| 3.6 | NotesPanel.tsx：笔记面板 | 前端 | ✅ |

---

## M4 · 快捷键 ✅

| # | 快捷键 | 功能 | 状态 |
|---|--------|------|------|
| 4.1 | Ctrl+Shift+↓ | 新增行 | ✅ |
| 4.2 | Ctrl+D | 复制当前面板 | ✅ |
| 4.3 | Ctrl+W | 关闭当前面板 | ✅ |
| 4.4 | Ctrl+↑ / Ctrl+↓ | 焦点上移/下移 | ✅ |
| 4.5 | Ctrl+← / Ctrl+→ | 焦点左移/右移 | ✅ |
| 4.6 | Ctrl+= / Ctrl+- | 字体放大/缩小 | ✅ |
| 4.7 | Ctrl+滚轮 | 字体缩放（终端内外均有效） | ✅ |
| 4.8 | Ctrl+C | 有选中文字→复制；无选中→发中断信号 | ✅ |
| 4.9 | Ctrl+V | 粘贴剪贴板内容到终端 | ✅ |
| 4.10 | Ctrl+/ | 显示/隐藏快捷键帮助 | ✅ |
| 4.11 | HelpOverlay.tsx | 快捷键帮助覆盖层 | ✅ |

---

## M5 · 会话持久化（方式 B） ✅

| # | 任务 | 负责 | 状态 |
|---|------|------|------|
| 5.1 | electron/sessionStore.ts：electron-store v7 封装 | 后端 | ✅ |
| 5.2 | 布局保存：panels + fontSize → JSON | 后端+前端 | ✅ |
| 5.3 | 会话保存：cwd + SerializeAddon scrollback | 前端 | ✅ |
| 5.4 | 重启恢复：还原布局 + 在原 cwd 开新 shell | 前端 | ✅ |
| 5.5 | 回放历史：将 scrollback 写入 xterm.js | 前端 | ✅ |

---

## M6 · 打包发布 🔄

| # | 任务 | 负责 | 状态 |
|---|------|------|------|
| 6.1 | node-pty 原生模块 rebuild 配置 | 后端 | ✅ |
| 6.2 | electron-builder NSIS 安装包测试 | 后端+测试 | ⬜ |
| 6.3 | 全功能回归测试 | 测试 | ⬜ |
| 6.4 | 发布 v1.0.0 | 项目经理 | ⬜ |

---

## 额外完成（计划外）

| 功能 | 说明 | 状态 |
|------|------|------|
| 主题系统 | 纯黑底 + Dracula 配色（可切换 A/B/C 三套） | ✅ |
| PowerShell 优先 | 自动检测 PS7 → PS5.1 → CMD | ✅ |
| 彩色聚焦指示器 | 左侧竖条 + 行外发光 | ✅ |
| EPIPE 崩溃抑制 | 进程退出后写入不再弹错误对话框 | ✅ |
