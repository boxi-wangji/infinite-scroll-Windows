# Infinite Scroll — Windows 终端工作区

在一块可无限纵向滚动的画布上，管理多个终端面板，告别标签页切换。

> Windows 移植版，基于 Electron + React + TypeScript + xterm.js + node-pty  
> macOS 原版（Swift/SwiftUI）见 `Sources/` 目录

---

## 功能一览

| 功能 | 说明 |
|------|------|
| 多行多列布局 | 一行内并排多个终端 / 笔记面板 |
| 无限纵向滚动 | Ctrl+↑↓ 在行间移动焦点 |
| 会话持久化 | 重启后恢复布局、工作目录、历史输出 |
| 字体缩放 | Ctrl+滚轮 / Ctrl+= / Ctrl+- |
| 行高拖拽 | 拖动行间分割线，重启后保留 |
| 重命名面板 | 双击标签名即可编辑 |
| 多 Shell 支持 | 每个面板独立选择 PS7 / PS5 / CMD |
| 右键菜单 | 复制 / 粘贴 / 清屏 / 复制面板 / 关闭 |
| 内联笔记 | 每行可插入 Markdown 笔记面板 |
| 彩色主题 | 纯黑底 + Dracula 配色，三套可切换 |

---

## 环境要求

- Windows 10 21H2+ 或 Windows 11
- Node.js 18 LTS+
- [Visual Studio C++ 生成工具](https://visualstudio.microsoft.com/visual-cpp-build-tools/)（node-pty 原生编译需要）

---

## 开发启动

```bat
npm install
npm run dev
```

> `npm install` 会自动通过 `electron-builder install-app-deps` 重新编译 node-pty。

---

## 打包安装包

```bat
npm run package
```

输出到 `release\Infinite Scroll Setup 1.0.0.exe`（约 79 MB，NSIS 安装包）。

---

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+↓` | 新增行 |
| `Ctrl+D` | 复制当前面板 |
| `Ctrl+W` | 关闭当前面板 |
| `Ctrl+↑ / Ctrl+↓` | 焦点上移 / 下移 |
| `Ctrl+← / Ctrl+→` | 焦点左移 / 右移 |
| `Ctrl+= / Ctrl+-` | 放大 / 缩小字体 |
| `Ctrl+滚轮` | 缩放字体 |
| `Ctrl+C` | 有选中→复制；无选中→中断信号 |
| `Ctrl+V` | 粘贴剪贴板 |
| `Ctrl+/` | 显示 / 隐藏快捷键帮助 |
| 双击标签名 | 重命名面板 |
| 拖动行间分割线 | 调整行高 |
| 右键 | 弹出快捷菜单 |

---

## 切换主题

打开 `src/theme.ts`，将第 8 行 `VARIANT` 改为 `'A'` / `'B'` / `'C'`，保存后自动热更新：

| 值 | 风格 | 高亮色 |
|----|------|--------|
| `'A'` | Electric Blue（默认） | 天蓝 `#3b82f6` |
| `'B'` | Matrix Green | 荧光绿 `#22c55e` |
| `'C'` | Amber Gold | 琥珀金 `#f59e0b` |

---

## 项目结构

```
├── electron/
│   ├── main.ts           # 主进程，窗口 + IPC + 中文菜单
│   ├── preload.ts        # Context Bridge
│   ├── ptyManager.ts     # node-pty 生命周期管理
│   └── sessionStore.ts   # electron-store 持久化
├── src/
│   ├── App.tsx           # 根组件
│   ├── theme.ts          # 颜色主题（可切换）
│   ├── types/            # 数据模型 + electronAPI 类型
│   ├── store/            # Zustand 全局状态
│   └── components/
│       ├── ScrollCanvas.tsx   # 无限滚动画布
│       ├── RowView.tsx        # 行视图
│       ├── TerminalPanel.tsx  # xterm.js 终端
│       ├── NotesPanel.tsx     # 笔记面板
│       ├── ContextMenu.tsx    # 右键菜单
│       └── HelpOverlay.tsx    # 快捷键帮助
├── scripts/
│   └── create-icon.js    # 代码生成应用图标
├── Resources/
│   └── AppIcon.ico       # 应用图标
└── Team/                 # 团队分工文档
    ├── 前端/
    ├── 后端/
    ├── 测试/
    └── 项目经理/
```

---

## Team 文档

各岗位职责、进度和决策记录见 [`Team/`](./Team/) 目录。
