import { drawHan, SPRITE_PX_H } from './sprites'
import { ROOM_W, ROOM_H, WALL_TOP, WALL_BOTTOM, WALL_LEFT, WALL_RIGHT, DOOR_SIZE, DOOR_MID_X, DOOR_MID_Y } from './rooms'

function drawRoom(ctx, room, camX, camY) {
  const ox = room.col * ROOM_W
  const oy = room.row * ROOM_H
  const sx = Math.floor(ox - camX)
  const sy = Math.floor(oy - camY)

  // Floor
  ctx.fillStyle = room.floorColor
  ctx.fillRect(sx + WALL_LEFT, sy + WALL_TOP, WALL_RIGHT - WALL_LEFT, WALL_BOTTOM - WALL_TOP)

  // North wall band
  ctx.fillStyle = room.wallColor
  ctx.fillRect(sx, sy, ROOM_W, WALL_TOP)

  // South wall band (darker)
  ctx.fillStyle = darken(room.wallColor, 0.6)
  ctx.fillRect(sx, sy + WALL_BOTTOM, ROOM_W, ROOM_H - WALL_BOTTOM)

  // West wall strip
  ctx.fillStyle = darken(room.wallColor, 0.85)
  ctx.fillRect(sx, sy, WALL_LEFT, ROOM_H)

  // East wall strip
  ctx.fillRect(sx + WALL_RIGHT, sy, ROOM_W - WALL_RIGHT, ROOM_H)

  // Shadow line at bottom of north wall (skip if top door present)
  if (!room.doors?.top) {
    ctx.fillStyle = darken(room.wallColor, 0.8)
    ctx.fillRect(sx, sy + WALL_TOP - 4, ROOM_W, 4)
  }

  // Door openings — paint floor/wall color over wall bands to reveal passage
  const doors = room.doors || {}

  if (doors.top) {
    // Reveal gap in north wall
    ctx.fillStyle = room.floorColor
    ctx.fillRect(sx + DOOR_MID_X - DOOR_SIZE / 2, sy, DOOR_SIZE, WALL_TOP)
  }
  if (doors.bottom) {
    // Reveal gap in south wall
    ctx.fillStyle = room.floorColor
    ctx.fillRect(sx + DOOR_MID_X - DOOR_SIZE / 2, sy + WALL_BOTTOM, DOOR_SIZE, ROOM_H - WALL_BOTTOM)
  }
  if (doors.left) {
    // Reveal gap in west wall strip
    ctx.fillStyle = room.floorColor
    ctx.fillRect(sx, sy + DOOR_MID_Y - DOOR_SIZE / 2, WALL_LEFT, DOOR_SIZE)
  }
  if (doors.right) {
    // Reveal gap in east wall strip
    ctx.fillStyle = room.floorColor
    ctx.fillRect(sx + WALL_RIGHT, sy + DOOR_MID_Y - DOOR_SIZE / 2, ROOM_W - WALL_RIGHT, DOOR_SIZE)
  }
}

function drawLampHalo(ctx, obj, camX, camY, alpha) {
  const cx = Math.floor(obj.x + obj.w / 2 - camX)
  const cy = Math.floor(obj.y + obj.h / 2 - camY)

  ctx.save()

  // Stretch horizontally to simulate light pooling on a floor plane
  ctx.translate(cx, cy)
  ctx.scale(1.5, 0.75)
  ctx.translate(-cx, -cy)

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 95)
  grad.addColorStop(0.00, `rgba(255, 230, 160, ${0.45 * alpha})`)
  grad.addColorStop(0.15, `rgba(255, 213, 128, ${0.28 * alpha})`)
  grad.addColorStop(0.40, `rgba(255, 200, 100, ${0.12 * alpha})`)
  grad.addColorStop(0.70, `rgba(255, 185,  80, ${0.04 * alpha})`)
  grad.addColorStop(1.00, `rgba(255, 170,  60, 0)`)

  ctx.globalAlpha = 1
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, 95, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawMonitorScreen(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const b  = obj._screenBrightness ?? 0   // 0 = off, 1 = fully on

  // Screen background — dark when off, code-editor when on
  ctx.globalAlpha = alpha
  ctx.fillStyle = b > 0.01 ? '#0D1117' : '#050810'
  ctx.fillRect(sx, sy, obj.w, obj.h)

  if (b > 0.01) {
    // Title bar
    ctx.globalAlpha = b * alpha
    ctx.fillStyle = '#161B22'
    ctx.fillRect(sx, sy, obj.w, 7)

    // Traffic lights
    const dots = ['#FF5F57', '#FFBD2E', '#28C840']
    for (let i = 0; i < dots.length; i++) {
      ctx.fillStyle = dots[i]
      ctx.beginPath()
      ctx.arc(sx + 5 + i * 6, sy + 3, 2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Syntax-coloured code lines
    const lines = [
      { ox:  0, w: 22, c: '#FF7B72' },
      { ox: 24, w: 18, c: '#79C0FF' },
      { ox:  0, w: 14, c: '#FF7B72' },
      { ox: 16, w: 24, c: '#A5D6FF' },
      { ox:  8, w: 28, c: '#7EE787' },
      { ox:  0, w: 18, c: '#FF7B72' },
      { ox: 20, w: 16, c: '#79C0FF' },
      { ox:  4, w: 22, c: '#A5D6FF' },
      { ox:  0, w: 26, c: '#7EE787' },
    ]
    ctx.globalAlpha = 0.80 * b * alpha
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i]
      ctx.fillStyle = l.c
      ctx.fillRect(sx + 3 + l.ox, sy + 9 + i * 4, l.w, 2)
    }

    // Cursor
    ctx.globalAlpha = 0.9 * b * alpha
    ctx.fillStyle = '#58A6FF'
    ctx.fillRect(sx + 3, sy + 9 + lines.length * 4, 2, 3)

    // Status bar
    ctx.globalAlpha = b * alpha
    ctx.fillStyle = '#0A0D12'
    ctx.fillRect(sx, sy + obj.h - 4, obj.w, 4)
    ctx.fillStyle = '#1F6FEB'
    ctx.fillRect(sx, sy + obj.h - 4, 26, 4)

    // Ambient glow — radial falloff centered on screen
    const gcx = sx + obj.w / 2
    const gcy = sy + obj.h / 2
    const gradR = obj.w * 1.6
    const radGlow = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, gradR)
    radGlow.addColorStop(0,    `rgba(74,143,224,${0.38 * b})`)
    radGlow.addColorStop(0.35, `rgba(74,143,224,${0.18 * b})`)
    radGlow.addColorStop(0.65, `rgba(74,143,224,${0.06 * b})`)
    radGlow.addColorStop(1,    'rgba(74,143,224,0)')
    ctx.globalAlpha = alpha
    ctx.fillStyle = radGlow
    ctx.fillRect(sx - gradR, sy - gradR, obj.w + gradR * 2, obj.h + gradR * 2)

    // Screen light bleeding down onto desk
    const bcx = sx + obj.w / 2
    const bcy = sy + obj.h
    const bleedR = obj.w * 1.2
    const bleedGrad = ctx.createRadialGradient(bcx, bcy, 0, bcx, bcy, bleedR)
    bleedGrad.addColorStop(0,   `rgba(58,127,208,${0.18 * b})`)
    bleedGrad.addColorStop(0.5, `rgba(58,127,208,${0.07 * b})`)
    bleedGrad.addColorStop(1,   'rgba(58,127,208,0)')
    ctx.fillStyle = bleedGrad
    ctx.fillRect(sx - bleedR, bcy, obj.w + bleedR * 2, bleedR)
  }

  ctx.globalAlpha = alpha
}

function drawLampShade(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  const inset = Math.floor(w * 0.18)
  ctx.globalAlpha = alpha
  // Outer shade body (trapezoid: narrow top, wide bottom)
  ctx.beginPath()
  ctx.moveTo(sx + inset, sy)
  ctx.lineTo(sx + w - inset, sy)
  ctx.lineTo(sx + w, sy + h)
  ctx.lineTo(sx, sy + h)
  ctx.closePath()
  ctx.fillStyle = '#F5EDD8'
  ctx.fill()
  // Inner lit panel
  ctx.beginPath()
  ctx.moveTo(sx + inset + 2, sy + 2)
  ctx.lineTo(sx + w - inset - 2, sy + 2)
  ctx.lineTo(sx + w - 3, sy + h - 2)
  ctx.lineTo(sx + 3, sy + h - 2)
  ctx.closePath()
  ctx.fillStyle = '#FFF8E8'
  ctx.fill()
  // Bottom rim
  ctx.fillStyle = '#C8A060'
  ctx.fillRect(sx - 1, sy + h - 3, w + 2, 3)
  // Top cap
  ctx.fillStyle = '#D4B87A'
  ctx.fillRect(sx + inset, sy, w - inset * 2, 3)
  // Subtle vertical stripe (seam)
  ctx.globalAlpha = 0.12 * alpha
  ctx.fillStyle = '#8B6914'
  ctx.fillRect(sx + Math.floor(w / 2) - 1, sy + 2, 1, h - 4)
}


function drawMonstera(ctx, obj, camX, camY, alpha) {
  const prevLineWidth   = ctx.lineWidth
  const prevStrokeStyle = ctx.strokeStyle
  const cx = Math.floor(obj.x + obj.w / 2 - camX)
  const cy = Math.floor(obj.y + obj.h     - camY)
  const maxLen = obj.h * 0.62
  const maxW   = obj.w * 0.40
  const leaves = [
    { angle: -0.85, len: maxLen * 0.85, width: maxW * 0.85, color: '#1E4D2B' },
    { angle: -0.35, len: maxLen,        width: maxW,         color: '#2D7A3F' },
    { angle:  0.05, len: maxLen * 0.92, width: maxW * 0.92,  color: '#1E4D2B' },
    { angle:  0.40, len: maxLen * 0.85, width: maxW * 0.85,  color: '#2D7A3F' },
    { angle:  0.85, len: maxLen * 0.70, width: maxW * 0.70,  color: '#1E4D2B' },
  ]
  // Stem
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#3A6B40'
  ctx.fillRect(cx - 2, cy - Math.floor(obj.h * 0.72), 4, Math.floor(obj.h * 0.72))
  for (const leaf of leaves) {
    const rad  = leaf.angle - Math.PI / 2
    const tipX = cx + Math.cos(rad) * leaf.len
    const tipY = cy + Math.sin(rad) * leaf.len
    const midX = cx + Math.cos(rad) * leaf.len * 0.5
    const midY = cy + Math.sin(rad) * leaf.len * 0.5
    const px   = Math.cos(leaf.angle) * leaf.width / 2
    const py   = Math.sin(leaf.angle) * leaf.width / 2
    ctx.globalAlpha = alpha
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.quadraticCurveTo(midX - px, midY - py, tipX, tipY)
    ctx.quadraticCurveTo(midX + px, midY + py, cx, cy)
    ctx.fillStyle = leaf.color
    ctx.fill()
    // Midrib vein
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(tipX, tipY)
    ctx.strokeStyle = '#3A9455'
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.35 * alpha
    ctx.stroke()
  }
  ctx.lineWidth   = prevLineWidth
  ctx.strokeStyle = prevStrokeStyle
}

function drawBushyPlant(ctx, obj, camX, camY, alpha) {
  const cx = Math.floor(obj.x + obj.w / 2 - camX)
  const cy = Math.floor(obj.y + obj.h * 0.44 - camY)
  const bottom = Math.floor(obj.y + obj.h - camY)
  // Thin stem
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#5C3D20'
  ctx.fillRect(cx - 1, bottom - 10, 3, 10)
  // Shadow base
  ctx.fillStyle = '#1A3D20'
  ctx.beginPath()
  ctx.arc(cx, cy + 3, obj.w * 0.38, 0, Math.PI * 2)
  ctx.fill()
  // Leaf clusters (shadow → mid → highlight)
  const clusters = [
    [  0,  2, 0.35, '#2D6B3A' ],
    [ -9, -1, 0.27, '#388A45' ],
    [  9, -1, 0.27, '#388A45' ],
    [  0, -9, 0.22, '#4CA855' ],
    [ -5,  9, 0.19, '#2D6B3A' ],
    [  5,  9, 0.19, '#2D6B3A' ],
  ]
  for (const [dx, dy, rf, c] of clusters) {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(cx + dx, cy + dy, obj.w * rf, 0, Math.PI * 2)
    ctx.fill()
  }
  // Bright highlights
  ctx.fillStyle = '#7DC870'
  for (const [dx, dy] of [[-6, -5], [5, -7]]) {
    ctx.beginPath()
    ctx.arc(cx + dx, cy + dy, obj.w * 0.08, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawMugSteam(ctx, obj, camX, camY, alpha) {
  const prevLineWidth   = ctx.lineWidth
  const prevStrokeStyle = ctx.strokeStyle
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const t  = Date.now() / 800
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 1.5
  for (let i = 0; i < 2; i++) {
    const xOff = Math.sin(t + i * 1.2) * 3
    ctx.beginPath()
    ctx.moveTo(sx + i * 7 + 2, sy + obj.h)
    ctx.bezierCurveTo(
      sx + i * 7 + 2 + xOff,       sy + obj.h * 0.6,
      sx + i * 7 + 2 - xOff,       sy + obj.h * 0.3,
      sx + i * 7 + 2 + xOff * 0.5, sy
    )
    ctx.globalAlpha = 0.15 * alpha
    ctx.stroke()
  }
  ctx.lineWidth   = prevLineWidth
  ctx.strokeStyle = prevStrokeStyle
}

function drawRug(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj

  const BASE   = '#1E1B30'  // dark indigo rug — distinct from floor
  const STROKE = '#3A3760'  // medium indigo for all lines

  // Soft drop shadow
  ctx.globalAlpha = 0.07 * alpha
  ctx.fillStyle = '#000'
  ctx.fillRect(sx + 4, sy + 4, w, h)

  // Base
  ctx.globalAlpha = alpha
  ctx.fillStyle = BASE
  ctx.fillRect(sx, sy, w, h)

  ctx.save()
  ctx.beginPath()
  ctx.rect(sx, sy, w, h)
  ctx.clip()

  // Single thin border
  ctx.strokeStyle = STROKE
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.55 * alpha
  ctx.strokeRect(sx + 6, sy + 6, w - 12, h - 12)

  // Inner hairline — same tone, barely visible
  ctx.globalAlpha = 0.22 * alpha
  ctx.strokeRect(sx + 12, sy + 12, w - 24, h - 24)

  // Four corner dots — only decoration
  ctx.globalAlpha = 0.45 * alpha
  ctx.fillStyle = STROKE
  for (const [cx, cy] of [
    [sx + 18, sy + 18],
    [sx + w - 18, sy + 18],
    [sx + 18,     sy + h - 18],
    [sx + w - 18, sy + h - 18],
  ]) {
    ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill()
  }

  ctx.globalAlpha = alpha
  ctx.restore()
}

function drawDiamond(ctx, cx, cy, hw, hh) {
  ctx.beginPath()
  ctx.moveTo(cx,      cy - hh)
  ctx.lineTo(cx + hw, cy)
  ctx.lineTo(cx,      cy + hh)
  ctx.lineTo(cx - hw, cy)
  ctx.closePath()
  ctx.fill()
}

function drawLrBookshelf(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  const mid    = Math.floor(h / 2) - 1
  const BOARD  = 4   // shelf board thickness
  const FRONT  = 7   // depth of the front face (protrudes below the unit)
  const SIDE   = 5   // depth of the side faces

  ctx.globalAlpha = alpha

  // ── Top face (the surface visible from above) ────────────────────────
  // Drawn first (furthest from viewer = behind everything else)
  ctx.fillStyle = '#2E2B4A'
  ctx.fillRect(sx, sy - FRONT, w, FRONT)

  // ── Shadow cast onto the wall above ─────────────────────────────────
  ctx.globalAlpha = 0.15 * alpha
  ctx.fillStyle = '#000'
  ctx.fillRect(sx, sy - FRONT - 4, w, 4)
  ctx.globalAlpha = alpha

  // ── Back panel ──────────────────────────────────────────────────────
  ctx.fillStyle = '#1A1730'
  ctx.fillRect(sx, sy, w, h)

  // ── Side strips (inner frame lines) ─────────────────────────────────
  ctx.fillStyle = '#2A2748'
  ctx.fillRect(sx, sy, 3, h)
  ctx.fillRect(sx + w - 3, sy, 3, h)

  // ── Shelf boards: flat top + dark underside for depth ────────────────
  // Top cap
  ctx.fillStyle = '#242140'
  ctx.fillRect(sx, sy, w, BOARD)
  ctx.fillStyle = '#0E0C20'
  ctx.fillRect(sx, sy + BOARD, w, 3)

  // Middle divider
  ctx.fillStyle = '#242140'
  ctx.fillRect(sx, sy + mid, w, BOARD)
  ctx.fillStyle = '#0E0C20'
  ctx.fillRect(sx, sy + mid + BOARD, w, 3)

  // Bottom base board (top face only — front face is the FRONT strip)
  ctx.fillStyle = '#242140'
  ctx.fillRect(sx, sy + h - BOARD, w, BOARD)

  // ── Books — upper shelf ──────────────────────────────────────────────
  const upperBooks = [
    { x:  4, bookH: 30, color: '#C4673A' },
    { x: 15, bookH: 26, color: '#6B8F71' },
    { x: 26, bookH: 32, color: '#4A6FA5' },
    { x: 37, bookH: 24, color: '#8B5CF6' },
    { x: 48, bookH: 28, color: '#E8A838' },
    { x: 59, bookH: 22, color: '#7AA4B8' },
    { x: 70, bookH: 30, color: '#D4506A' },
    { x: 81, bookH: 26, color: '#5B8C5A' },
    { x: 94, bookH: 28, color: '#C4673A' },
    { x: 105, bookH: 24, color: '#4A6FA5' },
  ]
  for (const b of upperBooks) {
    const bx = sx + b.x
    const by = sy + mid - b.bookH + BOARD  // rest on middle shelf surface
    // Spine
    ctx.fillStyle = b.color
    ctx.fillRect(bx, by, 9, b.bookH)
    // Top face of book (lighter — looking down at it)
    ctx.fillStyle = lighten(b.color, 1.35)
    ctx.fillRect(bx, by, 9, 3)
    // Right shadow edge
    ctx.fillStyle = darken(b.color, 0.72)
    ctx.fillRect(bx + 8, by + 3, 1, b.bookH - 3)
  }

  // ── Books — lower shelf ──────────────────────────────────────────────
  const lowerBooks = [
    { x:  3, bookH: 28, color: '#2C2C2C' },
    { x: 14, bookH: 32, color: '#C4673A' },
    { x: 25, bookH: 24, color: '#7AA4B8' },
    { x: 36, bookH: 30, color: '#6B8F71' },
    { x: 47, bookH: 22, color: '#9B59B6' },
    { x: 58, bookH: 26, color: '#E74C3C' },
    { x: 69, bookH: 28, color: '#3A7A5C' },
    { x: 80, bookH: 32, color: '#E8A838' },
    { x: 91, bookH: 24, color: '#4A6FA5' },
    { x: 102, bookH: 28, color: '#D4506A' },
  ]
  for (const b of lowerBooks) {
    const bx = sx + b.x
    const by = sy + h - BOARD - b.bookH  // rest on bottom base board
    // Spine
    ctx.fillStyle = b.color
    ctx.fillRect(bx, by, 9, b.bookH)
    // Top face of book
    ctx.fillStyle = lighten(b.color, 1.35)
    ctx.fillRect(bx, by, 9, 3)
    // Right shadow edge
    ctx.fillStyle = darken(b.color, 0.72)
    ctx.fillRect(bx + 8, by + 3, 1, b.bookH - 3)
  }
}

function drawLrDesk(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  const FACE = 4   // front-face thickness in px
  ctx.globalAlpha = alpha

  // ── Front face (desk thickness, visible below surface) ──
  ctx.fillStyle = '#9E9AB8'
  ctx.fillRect(sx, sy + h - FACE, w, FACE)
  // Bottom edge shadow
  ctx.fillStyle = '#888499'
  ctx.fillRect(sx, sy + h - 1, w, 1)

  // ── Surface ──
  ctx.fillStyle = '#ECEAF8'
  ctx.fillRect(sx, sy, w, h - FACE)

  // Monitor glow pooling — blue light bleeds from the screen area onto the desk surface
  ctx.globalAlpha = 0.14 * alpha
  const mgW = Math.floor(w * 0.60)
  const mgGrad = ctx.createLinearGradient(sx, 0, sx + mgW, 0)
  mgGrad.addColorStop(0, '#5A9FEE')
  mgGrad.addColorStop(1, 'rgba(90,159,238,0)')
  ctx.fillStyle = mgGrad
  ctx.fillRect(sx, sy, mgW, h - FACE)
  ctx.globalAlpha = alpha

  // Crisp top specular (gloss highlight)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(sx, sy, w, 2)
  // Secondary specular band (off-angle reflection)
  ctx.globalAlpha = 0.25 * alpha
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(sx + 8, sy + 4, Math.floor(w * 0.35), 1)
  ctx.globalAlpha = alpha

  // Side depth strips
  ctx.fillStyle = '#C4C0D8'
  ctx.fillRect(sx,         sy + 2, 2, h - FACE - 4)
  ctx.fillRect(sx + w - 2, sy + 2, 2, h - FACE - 4)

  // Cable grommet slot (near right side)
  ctx.globalAlpha = 0.18 * alpha
  ctx.fillStyle = '#7068A0'
  ctx.fillRect(sx + w - 28, sy + 3, 1, h - FACE - 5)
  ctx.globalAlpha = alpha

  // ── Front face LED strip (soft animated glow) ──
  const t = Date.now() / 3000
  ctx.globalAlpha = 0.28 * alpha
  const led = ctx.createLinearGradient(sx, 0, sx + w, 0)
  led.addColorStop(0,   `hsl(${220 + Math.sin(t)       * 18},70%,72%)`)
  led.addColorStop(0.5, `hsl(${255 + Math.sin(t + 1.0) * 18},80%,78%)`)
  led.addColorStop(1,   `hsl(${200 + Math.sin(t + 2.0) * 18},70%,72%)`)
  ctx.fillStyle = led
  ctx.fillRect(sx, sy + h - FACE, w, FACE)
  ctx.globalAlpha = alpha
}

function drawLrMug(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // ── Rim (aligns with lr-mug-rim box: 2px left, 4px above body) ──
  const rimX = sx - 2, rimY = sy - 4, rimW = w + 4
  ctx.fillStyle = '#2A2438'
  ctx.fillRect(rimX, rimY, rimW, 5)
  ctx.fillStyle = '#3D3558'
  ctx.fillRect(rimX, rimY, rimW, 2)            // top rim highlight
  ctx.fillStyle = '#1A1428'
  ctx.fillRect(rimX + rimW - 1, rimY, 1, 5)   // right rim shadow

  // Coffee surface inside rim
  ctx.fillStyle = '#1A0E0A'
  ctx.fillRect(rimX + 1, rimY + 1, rimW - 2, 4)
  ctx.fillStyle = '#2E1A10'
  ctx.fillRect(rimX + 2, rimY + 1, 4, 2)      // coffee highlight spot

  // ── Body ──
  ctx.fillStyle = '#1A1525'
  ctx.fillRect(sx, sy, w, h)
  ctx.fillStyle = '#2E2840'
  ctx.fillRect(sx, sy, 2, h - 2)              // left highlight
  ctx.fillStyle = '#0D0A14'
  ctx.fillRect(sx + w - 1, sy + 1, 1, h - 1) // right shadow
  ctx.fillRect(sx + 1, sy + h - 2, w - 2, 2) // bottom shadow

  // ── Handle ──
  const hx = sx + w, hy = sy + 2, hh = 7
  ctx.fillStyle = '#1E1830'
  ctx.fillRect(hx, hy, 4, hh)
  ctx.fillStyle = '#0D0A14'
  ctx.fillRect(hx + 1, hy + 2, 2, 3)         // hollow cutout
  ctx.fillStyle = '#2A2440'
  ctx.fillRect(hx, hy, 1, hh)                 // handle left highlight
}

function drawLrPc(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // Main chassis
  ctx.fillStyle = '#0D0B1E'
  ctx.fillRect(sx, sy, w, h)
  ctx.fillStyle = '#1A1830'
  ctx.fillRect(sx, sy, w, 4)                  // top bevel
  ctx.fillStyle = '#1E1C32'
  ctx.fillRect(sx, sy + 4, 2, h - 8)          // left highlight
  ctx.fillStyle = '#0A0818'
  ctx.fillRect(sx, sy + h - 4, w, 4)          // bottom bevel

  // ── Tempered glass window (left ~55%) ──
  const gW = Math.floor(w * 0.55)
  const gX = sx + 2, gY = sy + 6, gH = h - 14
  ctx.fillStyle = '#0E0C22'
  ctx.fillRect(gX, gY, gW, gH)

  // Internal purple glow
  ctx.globalAlpha = 0.20 * alpha
  const glow = ctx.createRadialGradient(gX + gW * 0.5, gY + gH * 0.45, 1, gX + gW * 0.5, gY + gH * 0.45, gW)
  glow.addColorStop(0, '#8060F0')
  glow.addColorStop(1, 'rgba(80,48,200,0)')
  ctx.fillStyle = glow
  ctx.fillRect(gX, gY, gW, gH)
  ctx.globalAlpha = alpha

  // CPU fan
  const fcx = gX + Math.floor(gW * 0.48), fcy = gY + Math.floor(gH * 0.36)
  ctx.fillStyle = '#1E1A38'
  ctx.beginPath(); ctx.arc(fcx, fcy, 5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#2E2858'
  ctx.beginPath(); ctx.arc(fcx, fcy, 4, 0, Math.PI * 2); ctx.fill()
  const prevStroke = ctx.strokeStyle, prevLW = ctx.lineWidth
  ctx.strokeStyle = '#5A50B0'; ctx.lineWidth = 1; ctx.globalAlpha = 0.55 * alpha
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2
    ctx.beginPath(); ctx.moveTo(fcx, fcy)
    ctx.lineTo(fcx + Math.cos(a) * 3.5, fcy + Math.sin(a) * 3.5); ctx.stroke()
  }
  ctx.strokeStyle = prevStroke; ctx.lineWidth = prevLW; ctx.globalAlpha = alpha
  ctx.fillStyle = '#9080E8'
  ctx.beginPath(); ctx.arc(fcx, fcy, 1.5, 0, Math.PI * 2); ctx.fill()

  // RAM sticks (right inside glass)
  ctx.fillStyle = '#24205A'; ctx.fillRect(gX + gW - 4, gY + 3, 3, 9)
  ctx.fillRect(gX + gW - 4, gY + 14, 3, 9)
  ctx.fillStyle = '#5A50B0'; ctx.fillRect(gX + gW - 4, gY + 3, 3, 2)
  ctx.fillRect(gX + gW - 4, gY + 14, 3, 2)

  // Glass border
  const prevSS = ctx.strokeStyle, prevLW2 = ctx.lineWidth
  ctx.strokeStyle = '#2A2848'; ctx.lineWidth = 1; ctx.globalAlpha = 0.8 * alpha
  ctx.strokeRect(gX + 0.5, gY + 0.5, gW - 1, gH - 1)
  ctx.strokeStyle = prevSS; ctx.lineWidth = prevLW2; ctx.globalAlpha = alpha

  // ── Front panel (right strip) ──
  const pX = gX + gW + 1, pW = w - (pX - sx) - 2
  ctx.fillStyle = '#141228'
  ctx.fillRect(pX, sy + 4, pW, h - 8)

  // Power button
  const pbx = pX + Math.floor(pW / 2), pby = sy + 10
  ctx.fillStyle = '#0A0820'
  ctx.beginPath(); ctx.arc(pbx, pby, 3, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#00E876'
  ctx.beginPath(); ctx.arc(pbx, pby, 2, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#141228'
  ctx.beginPath(); ctx.arc(pbx, pby, 1, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 0.22 * alpha
  ctx.fillStyle = '#00FF88'
  ctx.beginPath(); ctx.arc(pbx, pby, 6, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = alpha

  // USB ports
  ctx.fillStyle = '#0A0820'
  ctx.fillRect(pX + 1, sy + h - 16, pW - 2, 4)
  ctx.fillRect(pX + 1, sy + h - 10, pW - 2, 3)
  ctx.fillStyle = '#1A1840'
  ctx.fillRect(pX + 1, sy + h - 16, pW - 2, 1)
  ctx.fillRect(pX + 1, sy + h - 10, pW - 2, 1)

  // Dot-matrix vent on panel
  ctx.fillStyle = '#0A0820'
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < Math.floor(pW / 2); col++) {
      ctx.fillRect(pX + col * 2 + 1, sy + 22 + row * 3, 1, 1)
    }
  }

  // ── Animated RGB strip at bottom ──
  const t = Date.now() / 2000
  const rgb1 = `hsl(${(t * 60) % 360},90%,60%)`
  const rgb2 = `hsl(${(t * 60 + 120) % 360},90%,60%)`
  ctx.globalAlpha = 0.75 * alpha
  const rgbGrad = ctx.createLinearGradient(sx, 0, sx + w, 0)
  rgbGrad.addColorStop(0, rgb1); rgbGrad.addColorStop(1, rgb2)
  ctx.fillStyle = rgbGrad
  ctx.fillRect(sx + 1, sy + h - 3, w - 2, 3)
  // Floor bleed
  ctx.globalAlpha = 0.12 * alpha
  ctx.fillStyle = rgb1
  ctx.fillRect(sx, sy + h, w, 5)
  ctx.globalAlpha = alpha
}

function drawSucculent(ctx, obj, camX, camY, alpha) {
  const cx = Math.floor(obj.x + obj.w / 2 - camX)
  const cy = Math.floor(obj.y + obj.h / 2 - camY)
  const r  = Math.min(obj.w, obj.h) * 0.50
  ctx.globalAlpha = alpha
  // Outer petals
  const outer = [0, Math.PI * 0.4, Math.PI * 0.8, Math.PI * 1.2, Math.PI * 1.6]
  for (const a of outer) {
    ctx.fillStyle = '#4A7A52'
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 0.54, r * 0.44, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#6AAF74'
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * r * 0.74, cy + Math.sin(a) * r * 0.64, r * 0.14, 0, Math.PI * 2)
    ctx.fill()
  }
  // Inner petals
  const inner = [Math.PI * 0.2, Math.PI * 0.6, Math.PI, Math.PI * 1.4, Math.PI * 1.8]
  for (const a of inner) {
    ctx.fillStyle = '#5A8A60'
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * r * 0.28, cy + Math.sin(a) * r * 0.24, r * 0.30, 0, Math.PI * 2)
    ctx.fill()
  }
  // Centre bud
  ctx.fillStyle = '#7EC882'
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.24, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#C8F0CA'
  ctx.beginPath()
  ctx.arc(cx - 1, cy - 1, r * 0.09, 0, Math.PI * 2)
  ctx.fill()
}

function drawObject(ctx, obj, camX, camY, alpha = 1) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const prevAlpha = ctx.globalAlpha
  ctx.globalAlpha = alpha

  if (obj.id === 'lr-lamp-shade') {
    drawLampShade(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'lamp-halo') {
    drawLampHalo(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'monitor-screen-1' || obj.id === 'monitor-screen-2') {
    drawMonitorScreen(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'monstera-leaves') {
    drawMonstera(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'plant') {
    drawBushyPlant(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'mug-steam') {
    drawMugSteam(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'lr-rug') {
    drawRug(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'lr-desk') {
    drawLrDesk(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'lr-mug') {
    drawLrMug(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'lr-mug-rim') {
    ctx.globalAlpha = prevAlpha
    return  // rim drawn inside drawLrMug
  }
  if (obj.id === 'lr-pc') {
    drawLrPc(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'lr-succ-plant') {
    drawSucculent(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'lr-bookshelf') {
    drawLrBookshelf(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }

  ctx.fillStyle = obj.color
  ctx.fillRect(sx, sy, obj.w, obj.h)

  if (obj.id?.startsWith('sofa') && !obj.id.includes('-')) {
    ctx.fillStyle = darken(obj.color, 0.85)
    ctx.fillRect(sx + 4, sy + obj.h - 20, obj.w - 8, 4)
    for (let i = 1; i < 3; i++) {
      ctx.fillRect(sx + Math.floor(obj.w * i / 3), sy + 20, 4, obj.h - 24)
    }
  }

  if (obj.id?.startsWith('shelf') && !obj.id.includes('-')) {
    ctx.fillStyle = lighten(obj.color, 1.3)
    ctx.fillRect(sx, sy, obj.w, 4)
    ctx.fillRect(sx, sy + Math.floor(obj.h / 2), obj.w, 4)
    const bookColors = ['#CC4444', '#4A90D9', '#50C878', '#FFB347', '#9B59B6']
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = bookColors[i % bookColors.length]
      ctx.fillRect(sx + 4 + i * 10, sy + 6, 8, Math.floor(obj.h / 2) - 8)
    }
  }

  if (obj.id?.startsWith('frame') && obj.id.length <= 7) {
    ctx.strokeStyle = lighten(obj.color, 1.4)
    ctx.lineWidth = 2
    ctx.strokeRect(sx + 2, sy + 2, obj.w - 4, obj.h - 4)
  }

  ctx.globalAlpha = prevAlpha
}

export function drawFrame(ctx, canvas, player, camera, rooms) {
  const { x: camX, y: camY } = camera
  const { width: cw, height: ch } = canvas

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, cw, ch)

  for (const room of rooms) {
    const roomLeft   = room.col * ROOM_W
    const roomTop    = room.row * ROOM_H
    const roomRight  = roomLeft + ROOM_W
    const roomBottom = roomTop  + ROOM_H
    if (roomRight < camX || roomLeft > camX + cw) continue
    if (roomBottom < camY || roomTop > camY + ch) continue
    drawRoom(ctx, room, camX, camY)
  }

  const allObjects = []
  for (const room of rooms) {
    const roomLeft   = room.col * ROOM_W
    const roomTop    = room.row * ROOM_H
    const roomRight  = roomLeft + ROOM_W
    const roomBottom = roomTop  + ROOM_H
    if (roomRight < camX || roomLeft > camX + cw) continue
    if (roomBottom < camY || roomTop > camY + ch) continue
    for (const obj of room.objects) {
      if (obj.x + obj.w > camX && obj.x < camX + cw &&
          obj.y + obj.h > camY && obj.y < camY + ch) {
        allObjects.push(obj)
      }
    }
  }

  // Floor objects (rugs, mats) always render below everything
  const floorObjects = allObjects.filter(o => o.floor)
  const sceneObjects = allObjects.filter(o => !o.floor)

  for (const obj of floorObjects) {
    drawObject(ctx, obj, camX, camY, 1)
  }

  sceneObjects.sort((a, b) => (a.y + a.h) - (b.y + b.h))

  // Find monitor interact zone once for proximity check
  const monitorZone = rooms.flatMap(r => r.interactZones).find(z => z.action === 'funfact')

  let playerDrawn = false
  for (let i = 0; i < sceneObjects.length; i++) {
    const obj = sceneObjects[i]
    if (!playerDrawn && (obj.y + obj.h) >= player.y) {
      drawHan(ctx, player, camX, camY)
      playerDrawn = true
    }

    const playerSpriteTop = player.y - SPRITE_PX_H
    const objOverlapsPlayer = (
      obj.blocking &&
      obj.y < player.y &&
      (obj.y + obj.h) > playerSpriteTop &&
      obj.x < player.x + 16 &&
      (obj.x + obj.w) > player.x - 16
    )

    obj._alpha = obj._alpha ?? 1.0
    const targetAlpha = objOverlapsPlayer && obj.id !== 'lr-bookshelf' ? 0.4 : 1.0
    obj._alpha += (targetAlpha - obj._alpha) * 0.15

    // Smooth monitor power-on when player enters interact zone
    if (obj.id === 'monitor-screen-1' || obj.id === 'monitor-screen-2') {
      const inZone = monitorZone &&
        player.x >= monitorZone.x && player.x <= monitorZone.x + monitorZone.w &&
        player.y >= monitorZone.y && player.y <= monitorZone.y + monitorZone.h
      obj._screenBrightness = obj._screenBrightness ?? 0
      obj._screenBrightness += ((inZone ? 1 : 0) - obj._screenBrightness) * 0.05
    }

    drawObject(ctx, obj, camX, camY, obj._alpha)
  }

  if (!playerDrawn) drawHan(ctx, player, camX, camY)
}

function darken(hex, factor) {
  if (!hex || hex.startsWith('rgba') || hex.startsWith('rgb')) return hex || '#000'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `#${Math.round(r*factor).toString(16).padStart(2,'0')}${Math.round(g*factor).toString(16).padStart(2,'0')}${Math.round(b*factor).toString(16).padStart(2,'0')}`
}

function lighten(hex, factor) {
  if (!hex || hex.startsWith('rgba') || hex.startsWith('rgb')) return hex || '#fff'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `#${Math.min(255,Math.round(r*factor)).toString(16).padStart(2,'0')}${Math.min(255,Math.round(g*factor)).toString(16).padStart(2,'0')}${Math.min(255,Math.round(b*factor)).toString(16).padStart(2,'0')}`
}
