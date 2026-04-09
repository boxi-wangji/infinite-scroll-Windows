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
- **代价**：只能恢复位置和历史，不能恢复进程状态（如正在运行的命令）；scrollback 存储占磁盘空间

---

## D-003 · 终端目标 Shell

- **日期**：2026-04-09
- **决策**：支持 **Windows CMD 和 PowerShell**，不依赖 WSL
- **理由**：用户明确要求 Windows 原生；不强制要求 WSL 降低部署门槛
- **实现**：node-pty 调用 `%COMSPEC%`（默认 cmd.exe），用户可在设置中切换为 PowerShell

---

## D-004 · 快捷键前缀：Ctrl 替代 Cmd

- **日期**：2026-04-09
- **决策**：所有快捷键从 `Cmd+` 改为 `Ctrl+`
- **理由**：Windows 无 Cmd 键，Ctrl 是 Windows 惯例

| macOS 原版 | Windows 版 |
|---|---|
| Cmd+Shift+↓ | Ctrl+Shift+↓ |
| Cmd+D | Ctrl+D |
| Cmd+W | Ctrl+W |
| Cmd+↑/↓ | Ctrl+↑/↓ |
| Cmd+←/→ | Ctrl+←/→ |
| Cmd+滚轮 | Ctrl+滚轮 |
| Cmd+=  | Ctrl+= |
| Cmd+- | Ctrl+- |
| Cmd+/ | Ctrl+/ |

---

## D-005 · 窗口样式：无边框自定义标题栏

- **日期**：2026-04-09
- **决策**：`frame: false`，使用自定义拖拽标题栏
- **理由**：与 macOS 原版视觉风格一致；外观优先于原生感（用户已确认）

---

## D-006 · CWD 追踪方式

- **日期**：2026-04-09
- **决策**：通过 **OSC 7**（`\e]7;file:///path\x07`）和 **OSC 9;9**（Windows Terminal 格式）序列在 xterm.js 中拦截 shell 上报的工作目录
- **理由**：无需轮询进程，shell 主动上报；Windows Terminal 同样使用此方案
- **注意**：需要 shell 配置支持（PowerShell 需注入 prompt 函数；CMD 可通过 PROMPT 环境变量）
