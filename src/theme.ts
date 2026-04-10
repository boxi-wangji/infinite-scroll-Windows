// ═══════════════════════════════════════════════════════════════════════════
//  切换主题：把下面的 VARIANT 改成 'A' | 'B' | 'C' 然后保存，页面自动刷新
//
//   A — Electric Blue  深空蓝（科技感）
//   B — Matrix Green   矩阵绿（黑客风）
//   C — Amber Gold     琥珀金（复古终端）
// ═══════════════════════════════════════════════════════════════════════════
const VARIANT: 'A' | 'B' | 'C' = 'A'

// ── 版本 A：Electric Blue ────────────────────────────────────────────────────
const themeA = {
  bg:              '#000000',
  bgPanel:         '#06060f',
  bgHeader:        '#0a0a1a',
  bgHeaderFocused: '#0f0f28',

  border:          '#1a1a30',
  borderFocused:   '#3b82f6',   // blue-500
  accent:          '#60a5fa',   // blue-400（左边竖条）

  text:            '#dbeafe',
  textMuted:       '#3d5070',
  textLabel:       '#93c5fd',
  danger:          '#f87171',

  gap:             6,
  panelRadius:     6,
  headerHeight:    30,
  minPanelHeight:  180,
  defaultPanelHeight: 380,
}

// Dracula — 纯黑底
const xtermA = {
  background:          '#000000',
  foreground:          '#f8f8f2',
  cursor:              '#f8f8f2',
  cursorAccent:        '#000000',
  selectionBackground: '#44475a',
  selectionForeground: '#f8f8f2',
  black:   '#21222c', red:     '#ff5555', green:  '#50fa7b', yellow: '#f1fa8c',
  blue:    '#3d1a8a', magenta: '#ff79c6', cyan:   '#8be9fd', white:  '#f8f8f2',
  brightBlack:   '#6272a4', brightRed:   '#ff6e6e', brightGreen:  '#69ff94',
  brightYellow:  '#ffffa5', brightBlue:  '#61afef', brightMagenta:'#ff92df',
  brightCyan:    '#a4ffff', brightWhite: '#ffffff',
}

// ── 版本 B：Matrix Green ─────────────────────────────────────────────────────
const themeB = {
  bg:              '#000000',
  bgPanel:         '#000800',
  bgHeader:        '#001200',
  bgHeaderFocused: '#001a00',

  border:          '#0a200a',
  borderFocused:   '#22c55e',   // green-500
  accent:          '#4ade80',   // green-400

  text:            '#dcfce7',
  textMuted:       '#1f4d2a',
  textLabel:       '#86efac',
  danger:          '#f87171',

  gap:             6,
  panelRadius:     4,
  headerHeight:    28,
  minPanelHeight:  180,
  defaultPanelHeight: 380,
}

const xtermB = {
  background:          '#000000',
  foreground:          '#00ff41',
  cursor:              '#00ff41',
  cursorAccent:        '#000800',
  selectionBackground: '#003300',
  selectionForeground: '#00ff41',
  black:   '#001400', red:     '#ff4444', green:  '#00ff41', yellow: '#ffff00',
  blue:    '#0077ff', magenta: '#ff00ff', cyan:   '#00ffff', white:  '#ccffcc',
  brightBlack:   '#005500', brightRed:   '#ff6666', brightGreen:  '#33ff66',
  brightYellow:  '#ffff66', brightBlue:  '#3399ff', brightMagenta:'#ff33ff',
  brightCyan:    '#33ffff', brightWhite: '#ffffff',
}

// ── 版本 C：Amber Gold ───────────────────────────────────────────────────────
const themeC = {
  bg:              '#000000',
  bgPanel:         '#0c0800',
  bgHeader:        '#130e00',
  bgHeaderFocused: '#1c1400',

  border:          '#2a1e00',
  borderFocused:   '#f59e0b',   // amber-500
  accent:          '#fbbf24',   // amber-400

  text:            '#fef9e7',
  textMuted:       '#5c4400',
  textLabel:       '#fcd34d',
  danger:          '#ef4444',

  gap:             6,
  panelRadius:     4,
  headerHeight:    28,
  minPanelHeight:  180,
  defaultPanelHeight: 380,
}

const xtermC = {
  background:          '#000000',
  foreground:          '#ffc947',
  cursor:              '#f59e0b',
  cursorAccent:        '#0c0800',
  selectionBackground: '#3d2800',
  selectionForeground: '#fef9e7',
  black:   '#1a1000', red:     '#ff5555', green:  '#55ff55', yellow: '#ffb86c',
  blue:    '#6272a4', magenta: '#ff79c6', cyan:   '#8be9fd', white:  '#f8f8f2',
  brightBlack:   '#44475a', brightRed:   '#ff6e6e', brightGreen:  '#69ff94',
  brightYellow:  '#ffffa5', brightBlue:  '#d6acff', brightMagenta:'#ff92df',
  brightCyan:    '#a4ffff', brightWhite: '#ffffff',
}

// ── Export ────────────────────────────────────────────────────────────────────
export const theme    = VARIANT === 'A' ? themeA    : VARIANT === 'B' ? themeB    : themeC
export const xtermTheme = VARIANT === 'A' ? xtermA : VARIANT === 'B' ? xtermB : xtermC
