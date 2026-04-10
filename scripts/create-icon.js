// Generates Resources/AppIcon.ico — pure Node.js, no extra packages
// Design: black rounded square + Dracula-green ">" chevron + cursor block
const fs   = require('fs')
const path = require('path')
const zlib = require('zlib')

const SIZE = 256
const buf  = Buffer.alloc(SIZE * SIZE * 4)   // RGBA

// ── helpers ──────────────────────────────────────────────────────────────────
const set = (x, y, r, g, b, a = 255) => {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return
  const i = (y * SIZE + x) * 4
  buf[i] = r; buf[i+1] = g; buf[i+2] = b; buf[i+3] = a
}

// ── background: black rounded square ─────────────────────────────────────────
const CORNER = 44
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const cx = x < CORNER ? CORNER : x > SIZE - CORNER - 1 ? SIZE - CORNER - 1 : x
    const cy = y < CORNER ? CORNER : y > SIZE - CORNER - 1 ? SIZE - CORNER - 1 : y
    const dx = x - cx, dy = y - cy
    if (dx*dx + dy*dy > CORNER*CORNER) {
      buf[(y * SIZE + x) * 4 + 3] = 0          // transparent outside corners
    } else {
      set(x, y, 0, 0, 0)                        // black inside
    }
  }
}

// ── accent: Dracula green #50fa7b ─────────────────────────────────────────────
const [AR, AG, AB] = [80, 250, 123]

function drawThickLine(x0, y0, x1, y1, thickness) {
  const dx = x1 - x0, dy = y1 - y0
  const len = Math.sqrt(dx*dx + dy*dy)
  const nx = -dy / len, ny = dx / len
  const steps = Math.ceil(len * 2)
  for (let s = 0; s <= steps; s++) {
    const t  = s / steps
    const px = x0 + dx * t
    const py = y0 + dy * t
    for (let w = -thickness / 2; w <= thickness / 2; w++) {
      set(Math.round(px + nx * w), Math.round(py + ny * w), AR, AG, AB)
    }
  }
}

// ">" chevron — two lines meeting at tip (right side)
const tipX = 178, tipY = 128
const openX = 76
drawThickLine(openX, 58,  tipX, tipY, 22)  // top arm
drawThickLine(openX, 198, tipX, tipY, 22)  // bottom arm

// cursor block  "▌"  right of chevron
for (let y = 106; y <= 152; y++)
  for (let x = 190; x <= 208; x++)
    set(x, y, AR, AG, AB)

// ── PNG encoder (pure Node.js) ────────────────────────────────────────────────
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  return t
})()

function crc32(data) {
  let c = 0xFFFFFFFF
  for (const b of data) c = crcTable[(c ^ b) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const payload = Buffer.concat([t, data])
  const lenBuf = Buffer.allocUnsafe(4); lenBuf.writeUInt32BE(data.length)
  const crcBuf = Buffer.allocUnsafe(4); crcBuf.writeUInt32BE(crc32(payload))
  return Buffer.concat([lenBuf, t, data, crcBuf])
}

const rows = []
for (let y = 0; y < SIZE; y++) {
  rows.push(0)                                   // filter type: None
  for (let x = 0; x < SIZE; x++) {
    const i = (y * SIZE + x) * 4
    rows.push(buf[i], buf[i+1], buf[i+2], buf[i+3])
  }
}
const compressed = zlib.deflateSync(Buffer.from(rows), { level: 9 })

const ihdr = Buffer.allocUnsafe(13)
ihdr.writeUInt32BE(SIZE, 0); ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  pngChunk('IHDR', ihdr),
  pngChunk('IDAT', compressed),
  pngChunk('IEND', Buffer.alloc(0)),
])

// ── ICO wrapper (single 256×256 PNG entry) ────────────────────────────────────
const icoHeader = Buffer.allocUnsafe(6)
icoHeader.writeUInt16LE(0, 0)   // reserved
icoHeader.writeUInt16LE(1, 2)   // type: ICO
icoHeader.writeUInt16LE(1, 4)   // image count

const icoEntry = Buffer.allocUnsafe(16)
icoEntry[0] = 0                               // width  (0 = 256)
icoEntry[1] = 0                               // height (0 = 256)
icoEntry[2] = 0                               // palette colors
icoEntry[3] = 0                               // reserved
icoEntry.writeUInt16LE(1,  4)                 // planes
icoEntry.writeUInt16LE(32, 6)                 // bit depth
icoEntry.writeUInt32LE(png.length, 8)         // image data size
icoEntry.writeUInt32LE(6 + 16,    12)         // image data offset

const ico = Buffer.concat([icoHeader, icoEntry, png])

const out = path.join(__dirname, '../Resources/AppIcon.ico')
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, ico)
console.log('✓ Icon written to', out, `(${(ico.length / 1024).toFixed(1)} KB)`)
