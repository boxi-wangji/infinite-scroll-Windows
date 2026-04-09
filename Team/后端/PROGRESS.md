# 后端进度

> 状态标记：⬜ 待开始 · 🔄 进行中 · ✅ 完成 · ❌ 阻塞

---

## 项目配置

| # | 文件 | 任务 | 状态 |
|---|------|------|------|
| B-01 | `package.json` | 初始化，添加全部依赖 | ⬜ |
| B-02 | `tsconfig.json` | 渲染进程 TS 配置（target: ESNext, jsx: react-jsx） | ⬜ |
| B-03 | `tsconfig.node.json` | 主进程 TS 配置（module: CommonJS） | ⬜ |
| B-04 | `vite.config.ts` | vite-plugin-electron 配置（main + preload） | ⬜ |
| B-05 | `electron-builder.yml` | NSIS 打包配置，win 图标，输出目录 | ⬜ |

---

## Electron 主进程

| # | 文件 | 任务 | 状态 |
|---|------|------|------|
| B-06 | `electron/sessionStore.ts` | electron-store Schema 定义 + CRUD | ⬜ |
| B-07 | `electron/ptyManager.ts` | node-pty spawn / write / resize / kill | ⬜ |
| B-08 | `electron/ptyManager.ts` | onData 回调 → webContents.send('pty:data') | ⬜ |
| B-09 | `electron/ptyManager.ts` | onExit 回调 → webContents.send('pty:exit') | ⬜ |
| B-10 | `electron/ptyManager.ts` | updateCwd / getCwd CWD 缓存 | ⬜ |
| B-11 | `electron/ptyManager.ts` | killAll() 退出前清理 | ⬜ |
| B-12 | `electron/main.ts` | BrowserWindow 创建（无边框，preload 注入） | ⬜ |
| B-13 | `electron/main.ts` | 全部 IPC handler 注册 | ⬜ |
| B-14 | `electron/main.ts` | 窗口控制：minimize / maximize / close | ⬜ |
| B-15 | `electron/main.ts` | before-quit 事件：killAll + 触发前端最终保存 | ⬜ |
| B-16 | `electron/preload.ts` | contextBridge 暴露全部 electronAPI | ⬜ |

---

## 构建与打包

| # | 任务 | 状态 |
|---|------|------|
| B-17 | `npm run dev` 开发模式跑通（Vite + Electron 热重载） | ⬜ |
| B-18 | `electron-rebuild -f -w node-pty` 验证原生模块编译 | ⬜ |
| B-19 | `npm run build` 生产构建无报错 | ⬜ |
| B-20 | `electron-builder` 生成 NSIS 安装包，安装后可运行 | ⬜ |

---

## 验收标准

- [ ] `npm run dev` 启动后，Electron 窗口正常打开
- [ ] node-pty 能在 Windows 上 spawn CMD 和 PowerShell
- [ ] IPC 双向通信正常：渲染进程输入 → 主进程 PTY → 渲染进程输出
- [ ] electron-store 数据在重启后持久化（验证 `%APPDATA%` 目录下有 JSON 文件）
- [ ] 打包后安装包约 150–200 MB，安装运行正常
