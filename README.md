# Infinite Scroll for Windows

A terminal workspace manager for Windows. Organize multiple terminals in an infinitely scrollable canvas instead of switching between tabs.

> **Windows port** — built with Electron + React + xterm.js + node-pty.
> Original macOS version (Swift/SwiftUI): see `Sources/` directory.

## Features

- Grid layout with rows and cells of terminal panels
- Infinite vertical scrolling (`Ctrl+Scroll`)
- Keyboard-driven navigation (`Ctrl+Arrows`)
- Session restore: saves cwd + scrollback, restores layout on restart
- Inline markdown notes per row
- Auto-saved workspace state (electron-store)

## Requirements

- Windows 10 21H2+ or Windows 11
- Node.js 18+ (LTS recommended)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with "Desktop development with C++" (required by node-pty)

## Getting Started

```bat
npm install
npm run dev
```

> `npm install` automatically rebuilds node-pty for your Electron version via `electron-rebuild`.

## Build installer

```bat
npm run package
```

Outputs a Windows NSIS installer to `release/`.

## Optional: Enable CWD tracking

For session restore to correctly remember your working directory,
run the setup script once for your preferred shell:

**PowerShell:**
```powershell
.\scripts\setup-shell-cwd.ps1
```

**CMD:**
```bat
scripts\setup-shell-cwd-cmd.bat
```

## Shortcuts

| Key                | Action              |
|--------------------|---------------------|
| `Ctrl+Shift+Down`  | New row             |
| `Ctrl+D`           | Duplicate panel     |
| `Ctrl+W`           | Close panel         |
| `Ctrl+Up/Down`     | Navigate rows       |
| `Ctrl+Left/Right`  | Navigate panels     |
| `Ctrl+Scroll`      | Scroll rows         |
| `Ctrl+=` / `Ctrl+-`| Zoom in/out         |
| `Ctrl+/`           | Show help           |
