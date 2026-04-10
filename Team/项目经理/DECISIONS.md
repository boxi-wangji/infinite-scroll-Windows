# 关键决策记录

---

## D-001 · 技术框架：Electron vs Tauri

- **日期**：2026-04-09
- **决策**：选用 **Electron + React + TypeScript**
- **备选方案**：Tauri（Rust 后端 + WebView2 前端）
- **理由**：团队技术栈为 TypeScript/前端背景；Electron 生态最成熟，xterm.js 文档完善；Tauri 后端需要 Rust，学习成本高
- **代价**：安装包约 150–200 MB（Electron 打包体积大）

---

## D-002 · 会话持久化：方式 B（模拟恢复）

- **日期**：2026-04-09
- **决策**：关闭时保存 **cwd + xterm.js scrollback 序列化内容**，重启后还原布局并在原目录重新开 shell，回放历史输出
- **备选方案**：方式 A（放弃恢复，重启开新 shell）
- **理由**：用户体验更好；技术上可行（xterm-addon-serialize 支持序列化）
- **代价**：只能恢复位置和历史，不能恢复进程状态（如正在运行的命令）

---

## D-003 · 默认 Shell：优先 PowerShell

- **日期**：2026-04-10（更新）
- **决策**：启动时自动检测 **PS7（pwsh.exe）→ PS5.1（powershell.exe）→ CMD**
- **理由**：PowerShell 7 内置 PSReadLine，输出彩色语法高亮；CMD 无颜色输出，用户体验差
- **实现**：preload.ts `getDefaultShell()` 用 `fs.existsSync` 检测路径

---

## D-004 · 快捷键前缀：Ctrl 替代 Cmd

- **日期**：2026-04-09
- **决策**：所有快捷键从 `Cmd+` 改为 `Ctrl+`
- **理由**：Windows 无 Cmd 键，Ctrl 是 Windows 惯例

| macOS 原版 | Windows 版 |
|---|---|
| Cmd+Shift+↓ | Ctrl+Shift+↓（新增行） |
| Cmd+D | Ctrl+D（复制面板） |
| Cmd+W | Ctrl+W（关闭面板） |
| Cmd+↑/↓ | Ctrl+↑/↓（焦点移动） |
| Cmd+滚轮 | Ctrl+滚轮（字体缩放） |
| Cmd+C/V | Ctrl+C/V（复制/粘贴，智能处理中断信号） |

---

## D-005 · 窗口样式：原生 Windows 标题栏

- **日期**：2026-04-10（更新）
- **决策**：使用原生 Windows 标题栏（`frame: true`）
- **原决策**：`frame: false` 自定义标题栏（macOS 风格）
- **变更理由**：用户明确要求"不要苹果的界面，要 Windows 的界面"

---

## D-006 · CWD 追踪方式

- **日期**：2026-04-09
- **决策**：通过 **OSC 7** 和 **OSC 9;9**（Windows Terminal 格式）拦截 shell 上报的工作目录
- **理由**：无需轮询进程，shell 主动上报；与 Windows Terminal 方案一致

---

## D-007 · Ctrl+C 双重行为

- **日期**：2026-04-10
- **决策**：Ctrl+C 有选中文字时**复制**，无选中时**发中断信号**（^C）
- **理由**：终端用户习惯两种用法；xterm.js 默认只发中断，需要手动处理剪贴板
- **实现**：`attachCustomKeyEventHandler` 中检查 `term.getSelection()`
