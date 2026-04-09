# 前端进度

> 状态标记：⬜ 待开始 · 🔄 进行中 · ✅ 完成 · ❌ 阻塞

---

## 类型与状态层

| # | 文件 | 任务 | 状态 |
|---|------|------|------|
| F-01 | `src/types/models.ts` | 定义 CellType / CellModel / PanelModel / SessionData | ⬜ |
| F-02 | `src/types/electron.d.ts` | 声明 `window.electronAPI` 全局类型 | ⬜ |
| F-03 | `src/theme.ts` | 颜色常量 + xterm 主题 + 间距常量 | ⬜ |
| F-04 | `src/store/panelStore.ts` | Zustand store：panels / focus / fontSize / sessions | ⬜ |
| F-05 | `src/store/panelStore.ts` | Actions：addPanel / removeCell / duplicateCell / setFocus | ⬜ |

---

## 入口与根组件

| # | 文件 | 任务 | 状态 |
|---|------|------|------|
| F-06 | `src/index.html` | HTML 模板，挂载点 `#root` | ⬜ |
| F-07 | `src/index.css` | 全局样式（body/html 100% + 滚动条样式） | ⬜ |
| F-08 | `src/main.tsx` | React 18 `createRoot` 入口 | ⬜ |
| F-09 | `src/App.tsx` | 加载会话、注册全局快捷键、渲染 ScrollCanvas | ⬜ |

---

## 组件开发

| # | 组件 | 核心功能 | 状态 |
|---|------|----------|------|
| F-10 | `ScrollCanvas.tsx` | 垂直滚动容器，Ctrl+Wheel 行间导航 | ⬜ |
| F-11 | `RowView.tsx` | 横向排列 cell，焦点边框高亮，cell 头部操作按钮 | ⬜ |
| F-12 | `TerminalPanel.tsx` | xterm.js 初始化 + FitAddon + SerializeAddon | ⬜ |
| F-13 | `TerminalPanel.tsx` | node-pty IPC 数据双向绑定（onPtyData + onData） | ⬜ |
| F-14 | `TerminalPanel.tsx` | OSC 7 / OSC 9;9 CWD 拦截 | ⬜ |
| F-15 | `TerminalPanel.tsx` | ResizeObserver → FitAddon + resizePty IPC | ⬜ |
| F-16 | `TerminalPanel.tsx` | unmount 时序列化 scrollback + 保存会话 | ⬜ |
| F-17 | `TerminalPanel.tsx` | 启动时回放 scrollback + 在原 cwd 开 shell | ⬜ |
| F-18 | `NotesPanel.tsx` | textarea 笔记，localStorage 持久化 | ⬜ |
| F-19 | `HelpOverlay.tsx` | 快捷键帮助弹层，Ctrl+/ 显示/隐藏 | ⬜ |

---

## 验收标准

- [ ] 打开 App，默认有一个终端面板，可以正常输入命令
- [ ] Ctrl+Shift+↓ 新增行，行数可无限增加
- [ ] Ctrl+Wheel 在行间平滑滚动
- [ ] 关闭 App 后重启，布局、cwd、scrollback 历史全部恢复
- [ ] Ctrl+D / Ctrl+W / 字体快捷键全部生效
- [ ] 笔记面板可正常输入，重启后内容保留
