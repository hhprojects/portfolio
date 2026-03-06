import { drawHan, SPRITE_PX_H } from './sprites'
import { ROOM_W, ROOM_H, WALL_TOP, WALL_BOTTOM, WALL_LEFT, WALL_RIGHT, DOOR_SIZE, DOOR_MID_X, DOOR_MID_Y, GL_PROJECTS } from './rooms'

// ── Gallery project screenshot preload ───────────────────────────────────────
const _glImgAssets = import.meta.glob('../../assets/projects/**/*.{jpg,jpeg,png}', { eager: true })
const GL_PROJECT_IMGS = []
for (const project of GL_PROJECTS) {
  const key = `../../assets/projects/${project.imgPath}`
  const mod = _glImgAssets[key]
  const img = new Image()
  img.src = mod ? mod.default : ''
  GL_PROJECT_IMGS.push(img)
}

// ── Contact room — vintage mail office ─────────────────────────────────────
function drawCtRoom(ctx, room, camX, camY) {
  const ox = room.col * ROOM_W
  const oy = room.row * ROOM_H
  const sx = Math.floor(ox - camX)
  const sy = Math.floor(oy - camY)

  const WALL_PLANKS  = ['#E2D4B0', '#EADCB8', '#D8CAA0', '#E6D8B4', '#DCCCA8', '#E8DAB2', '#D4C89C']
  const FLOOR_PLANKS = ['#C8A870', '#B89860', '#C2A268', '#BE9C64', '#C4A46C', '#BA9A62', '#C0A06A']
  const WAINSCOT     = ['#3A2818', '#443022', '#3C2A1A', '#482E1E']
  const SOUTH_COLOR  = '#2A1C0C'
  const NAIL_DARK    = '#8A7040'
  const NAIL_SHINE   = '#D4B870'
  const WAINSCOT_H   = 28

  // ── North wall — cream ivory horizontal planks ───────────────────────────
  const PLANK_H = 14
  const wallRows = Math.ceil(WALL_TOP / PLANK_H)
  for (let i = 0; i < wallRows; i++) {
    const py = sy + i * PLANK_H
    const ph = Math.min(PLANK_H - 1, WALL_TOP - i * PLANK_H)
    if (ph <= 0) break
    const col = WALL_PLANKS[i % WALL_PLANKS.length]
    ctx.fillStyle = col
    ctx.fillRect(sx, py, ROOM_W, ph)
    ctx.globalAlpha = 0.20
    ctx.fillStyle = '#FFF8E8'
    ctx.fillRect(sx, py, ROOM_W, 1)
    ctx.globalAlpha = 0.25
    ctx.fillStyle = '#000'
    ctx.fillRect(sx, py + ph - 1, ROOM_W, 1)
    ctx.globalAlpha = 1
    // Grain flecks
    ctx.globalAlpha = 0.05
    ctx.fillStyle = '#8A6030'
    for (let g = 3; g < ph - 1; g += 5) {
      const len = 50 + Math.floor(((py + g) * 41 + 13) % 100)
      const xo  = 15 + Math.floor(((py + g) * 67 + 7)  % (ROOM_W - 80))
      ctx.fillRect(sx + xo, py + g, len, 1)
    }
    ctx.globalAlpha = 1
    // Brass nail heads
    const nailY = py + Math.floor(ph / 2)
    for (const nx of [sx + 10, sx + Math.floor(ROOM_W/3), sx + Math.floor(ROOM_W*2/3), sx + ROOM_W - 10]) {
      ctx.fillStyle = NAIL_DARK
      ctx.beginPath(); ctx.arc(nx, nailY, 2, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = NAIL_SHINE
      ctx.globalAlpha = 0.7
      ctx.beginPath(); ctx.arc(nx - 0.6, nailY - 0.6, 0.8, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1
    }
  }

  // Wainscoting dark mahogany band at base of north wall
  const wainY = sy + WALL_TOP - WAINSCOT_H
  for (let i = 0; i < Math.ceil(WAINSCOT_H / 7) + 1; i++) {
    const py = wainY + i * 7
    const ph = Math.min(6, sy + WALL_TOP - py)
    if (ph <= 0) break
    ctx.fillStyle = WAINSCOT[i % WAINSCOT.length]
    ctx.fillRect(sx, py, ROOM_W, ph)
  }
  // Wainscot cap rail
  ctx.globalAlpha = 0.35
  ctx.fillStyle = '#D4A860'
  ctx.fillRect(sx, wainY, ROOM_W, 2)
  ctx.globalAlpha = 1

  // Wall base shadow
  if (!room.doors?.top) {
    ctx.globalAlpha = 0.40
    ctx.fillStyle = '#000'
    ctx.fillRect(sx, sy + WALL_TOP - 4, ROOM_W, 4)
    ctx.globalAlpha = 1
  }

  // ── Floor — warm honey oak planks ───────────────────────────────────────
  const FPH = 20
  const floorRows = Math.ceil((WALL_BOTTOM - WALL_TOP) / FPH)
  for (let i = 0; i < floorRows; i++) {
    const py = sy + WALL_TOP + i * FPH
    const ph = Math.min(FPH - 1, WALL_BOTTOM - (WALL_TOP + i * FPH))
    if (ph <= 0) break
    const col = FLOOR_PLANKS[i % FLOOR_PLANKS.length]
    ctx.fillStyle = col
    ctx.fillRect(sx + WALL_LEFT, py, WALL_RIGHT - WALL_LEFT, ph)
    ctx.globalAlpha = 0.28
    ctx.fillStyle = '#000'
    ctx.fillRect(sx + WALL_LEFT, py + ph - 1, WALL_RIGHT - WALL_LEFT, 1)
    ctx.globalAlpha = 0.04
    ctx.fillStyle = '#6A4010'
    for (let g = 4; g < ph - 1; g += 7) {
      ctx.fillRect(sx + WALL_LEFT, py + g, WALL_RIGHT - WALL_LEFT, 1)
    }
    ctx.globalAlpha = 1
  }

  // ── South baseboard ──────────────────────────────────────────────────────
  ctx.fillStyle = SOUTH_COLOR
  ctx.fillRect(sx, sy + WALL_BOTTOM, ROOM_W, ROOM_H - WALL_BOTTOM)
  ctx.globalAlpha = 0.22
  ctx.fillStyle = '#D4A860'
  ctx.fillRect(sx, sy + WALL_BOTTOM, ROOM_W, 2)
  ctx.globalAlpha = 1

  // ── Side wall strips — vertical dark planks ──────────────────────────────
  const VPW = 5
  for (let i = 0; i < Math.ceil(WALL_LEFT / VPW) + 1; i++) {
    const px = sx + i * VPW
    const pw = Math.min(VPW - 1, WALL_LEFT - i * VPW)
    if (pw <= 0) break
    ctx.fillStyle = WAINSCOT[i % WAINSCOT.length]
    ctx.fillRect(px, sy, pw, ROOM_H)
    ctx.globalAlpha = 0.35; ctx.fillStyle = '#000'
    ctx.fillRect(px + pw - 1, sy, 1, ROOM_H)
    ctx.globalAlpha = 0.10; ctx.fillStyle = '#D4A860'
    ctx.fillRect(px, sy, 1, ROOM_H)
    ctx.globalAlpha = 1
  }
  for (let i = 0; i < Math.ceil((ROOM_W - WALL_RIGHT) / VPW) + 2; i++) {
    const px = sx + WALL_RIGHT + i * VPW
    const pw = Math.min(VPW - 1, ROOM_W - WALL_RIGHT - i * VPW)
    if (pw <= 0 || px >= sx + ROOM_W) break
    ctx.fillStyle = WAINSCOT[i % WAINSCOT.length]
    ctx.fillRect(px, sy, pw, ROOM_H)
    ctx.globalAlpha = 0.35; ctx.fillStyle = '#000'
    ctx.fillRect(px + pw - 1, sy, 1, ROOM_H)
    ctx.globalAlpha = 0.10; ctx.fillStyle = '#D4A860'
    ctx.fillRect(px, sy, 1, ROOM_H)
    ctx.globalAlpha = 1
  }

  // ── Door openings ────────────────────────────────────────────────────────
  const doors = room.doors || {}
  if (doors.top)    { ctx.fillStyle = FLOOR_PLANKS[0]; ctx.fillRect(sx + DOOR_MID_X - DOOR_SIZE/2, sy, DOOR_SIZE, WALL_TOP) }
  if (doors.bottom) { ctx.fillStyle = SOUTH_COLOR;     ctx.fillRect(sx + DOOR_MID_X - DOOR_SIZE/2, sy + WALL_BOTTOM, DOOR_SIZE, ROOM_H - WALL_BOTTOM) }
  if (doors.left)   { ctx.fillStyle = FLOOR_PLANKS[0]; ctx.fillRect(sx, sy + DOOR_MID_Y - DOOR_SIZE/2, WALL_LEFT, DOOR_SIZE) }
  if (doors.right)  { ctx.fillStyle = FLOOR_PLANKS[0]; ctx.fillRect(sx + WALL_RIGHT, sy + DOOR_MID_Y - DOOR_SIZE/2, ROOM_W - WALL_RIGHT, DOOR_SIZE) }

}

// ── Contact object renderers ────────────────────────────────────────────────

function drawCtWindow(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // Outer frame — dark wood
  ctx.fillStyle = '#5A4020'
  ctx.fillRect(sx, sy, w, h)

  // Two glass panes with warm afternoon golden light
  const paneW = Math.floor((w - 10) / 2)
  const paneH = h - 8
  ctx.globalAlpha = 0.55 * alpha
  ctx.fillStyle = '#F5D870'
  ctx.fillRect(sx + 4, sy + 4, paneW, paneH)
  ctx.globalAlpha = 0.48 * alpha
  ctx.fillStyle = '#F0CE58'
  ctx.fillRect(sx + 6 + paneW, sy + 4, paneW, paneH)

  // Sunlight streaks
  ctx.globalAlpha = 0.22 * alpha
  ctx.fillStyle = '#FFF8C0'
  ctx.fillRect(sx + 5, sy + 4, 5, paneH)
  ctx.fillRect(sx + 7 + paneW, sy + 4, 5, paneH)

  // Lace curtain — vertical lines
  ctx.globalAlpha = 0.11 * alpha
  ctx.fillStyle = '#FFFFFF'
  for (let lx = 0; lx < paneW; lx += 4) {
    ctx.fillRect(sx + 4 + lx, sy + 4, 1, paneH)
    ctx.fillRect(sx + 6 + paneW + lx, sy + 4, 1, paneH)
  }
  ctx.globalAlpha = alpha

  // Frame dividers
  ctx.fillStyle = '#5A4020'
  ctx.fillRect(sx + 4 + paneW, sy + 4, 4, paneH)
  ctx.fillRect(sx + 4, sy + 4 + Math.floor(paneH / 2), w - 8, 3)

  // Frame bevel highlight
  ctx.globalAlpha = 0.3 * alpha
  ctx.fillStyle = '#C8A060'
  ctx.fillRect(sx, sy, w, 1)
  ctx.fillRect(sx, sy, 1, h)
  ctx.globalAlpha = alpha
}

function drawCtBulletin(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // Wood frame
  ctx.fillStyle = '#5A3A1A'
  ctx.fillRect(sx, sy, w, h)
  ctx.fillStyle = '#3A2210'
  ctx.fillRect(sx + 3, sy + 3, w - 6, h - 6)

  // Cork surface
  ctx.fillStyle = '#C8924A'
  ctx.fillRect(sx + 4, sy + 4, w - 8, h - 8)

  // Cork texture dots
  ctx.globalAlpha = 0.09 * alpha
  ctx.fillStyle = '#6A3A10'
  for (let row = 0; row < Math.floor((h - 10) / 4); row++) {
    for (let col = 0; col < Math.floor((w - 10) / 6); col++) {
      ctx.fillRect(sx + 6 + col * 6, sy + 6 + row * 4, 2, 2)
    }
  }
  ctx.globalAlpha = alpha

  // Pinned notices
  const notices = [
    { x: 6,  y: 6,  w: 20, h: 16, bg: '#FFFDE0', pin: '#CC2020' },
    { x: 30, y: 5,  w: 22, h: 18, bg: '#FFE8E0', pin: '#2060CC' },
    { x: 7,  y: 28, w: 24, h: 14, bg: '#E8FFE0', pin: '#20A040' },
    { x: 34, y: 28, w: 18, h: 14, bg: '#FFF0D0', pin: '#CC8020' },
  ]
  for (const n of notices) {
    ctx.globalAlpha = 0.16 * alpha
    ctx.fillStyle = '#000'
    ctx.fillRect(sx + n.x + 1, sy + n.y + 2, n.w, n.h)
    ctx.globalAlpha = alpha
    ctx.fillStyle = n.bg
    ctx.fillRect(sx + n.x, sy + n.y, n.w, n.h)
    ctx.globalAlpha = 0.45 * alpha
    ctx.fillStyle = '#333'
    ctx.fillRect(sx + n.x + 2, sy + n.y + 3,  n.w - 4, 1)
    ctx.fillRect(sx + n.x + 2, sy + n.y + 6,  n.w - 6, 1)
    ctx.fillRect(sx + n.x + 2, sy + n.y + 9,  n.w - 8, 1)
    ctx.globalAlpha = alpha
    ctx.fillStyle = n.pin
    ctx.beginPath(); ctx.arc(sx + n.x + Math.floor(n.w/2), sy + n.y + 1, 2, 0, Math.PI * 2); ctx.fill()
  }
}

function drawCtCounterTop(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // Top surface — lighter mahogany base
  ctx.fillStyle = '#6B3A1F'
  ctx.fillRect(sx, sy, w, h)

  // Radial gradient highlight — brighter toward player (bottom edge)
  const grad = ctx.createLinearGradient(sx, sy, sx, sy + h)
  grad.addColorStop(0, 'rgba(255,200,120,0.08)')
  grad.addColorStop(1, 'rgba(255,200,120,0.28)')
  ctx.fillStyle = grad
  ctx.fillRect(sx, sy, w, h)

  // Subtle wood grain lines
  ctx.globalAlpha = 0.08 * alpha
  ctx.fillStyle = '#3A1A08'
  for (let gx = 60; gx < w - 20; gx += 80) {
    ctx.fillRect(sx + gx, sy + 2, 1, h - 4)
  }
  ctx.globalAlpha = alpha

  // Brass front rail along bottom edge
  ctx.fillStyle = '#C8A030'
  ctx.fillRect(sx, sy + h - 3, w, 3)
  ctx.fillStyle = '#E0BC50'
  ctx.fillRect(sx + 1, sy + h - 3, w - 2, 1)
}

function drawCtCounterFace(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // Dark mahogany front face
  ctx.fillStyle = '#3D1F0D'
  ctx.fillRect(sx, sy, w, h)

  // Horizontal grain lines
  ctx.globalAlpha = 0.12 * alpha
  ctx.fillStyle = '#1A0A04'
  for (let gy = 8; gy < h - 4; gy += 8) {
    ctx.fillRect(sx + 4, sy + gy, w - 8, 1)
  }
  ctx.globalAlpha = alpha

  // Top edge shadow seam
  ctx.fillStyle = '#1A0A04'
  ctx.fillRect(sx, sy, w, 2)

  // Bottom shadow
  ctx.fillStyle = '#0E0604'
  ctx.fillRect(sx, sy + h - 3, w, 3)
}

function drawCtGlassPanel(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // Brass posts at each end
  ctx.fillStyle = '#C8A030'
  ctx.fillRect(sx, sy, 4, h)
  ctx.fillRect(sx + w - 4, sy, 4, h)

  // Brass top & bottom rails
  ctx.fillStyle = '#C8A030'
  ctx.fillRect(sx, sy, w, 4)
  ctx.fillRect(sx, sy + h - 3, w, 3)
  ctx.fillStyle = '#E0BC50'
  ctx.fillRect(sx + 1, sy, w - 2, 1)

  // Glass fill
  ctx.globalAlpha = 0.40 * alpha
  ctx.fillStyle = '#C8E8F4'
  ctx.fillRect(sx + 4, sy + 4, w - 8, h - 7)

  // Glass sheen
  ctx.globalAlpha = 0.16 * alpha
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(sx + 6, sy + 5, Math.floor(w * 0.28), h - 9)
  ctx.globalAlpha = alpha

  // Vertical brass dividers (~every 80px, at least 5 across full width)
  const divCount = Math.max(5, Math.floor(w / 80))
  ctx.fillStyle = '#B89020'
  for (let i = 1; i < divCount; i++) {
    ctx.fillRect(sx + i * Math.floor(w / divCount), sy + 4, 3, h - 7)
  }
}

function drawCtStamp(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // Rubber head — red ink pad base
  ctx.fillStyle = '#CC2020'
  ctx.fillRect(sx, sy + h - 5, w, 5)
  ctx.fillStyle = '#AA1010'
  ctx.fillRect(sx, sy + h - 5, w, 1)

  // Handle shaft — dark wood
  const shaftX = sx + Math.floor(w * 0.35)
  const shaftW = Math.floor(w * 0.30)
  ctx.fillStyle = '#4A2C10'
  ctx.fillRect(shaftX, sy, shaftW, h - 5)
  ctx.fillStyle = '#5C3818'
  ctx.fillRect(shaftX, sy, 1, h - 5)

  // Handle grip top — brass band
  ctx.fillStyle = '#C8A030'
  ctx.fillRect(sx + Math.floor(w * 0.28), sy, Math.floor(w * 0.44), 3)
  ctx.fillStyle = '#E0BC50'
  ctx.fillRect(sx + Math.floor(w * 0.29), sy, Math.floor(w * 0.42), 1)
}

function drawCtTray(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // Tray rim — dark mahogany walls
  ctx.fillStyle = '#3D1F0D'
  ctx.fillRect(sx, sy + h - 4, w, 4)
  ctx.fillRect(sx, sy, 3, h)
  ctx.fillRect(sx + w - 3, sy, 3, h)

  // Paper stack — three layers with slight offsets for depth
  ctx.fillStyle = '#F0EAD8'
  ctx.fillRect(sx + 3, sy + 1, w - 6, h - 6)
  ctx.fillStyle = '#E8E0C8'
  ctx.fillRect(sx + 3, sy + 3, w - 6, h - 8)
  ctx.fillStyle = '#DDD4B8'
  ctx.fillRect(sx + 3, sy + 5, w - 6, h - 10)

  // Paper edge shadow lines
  ctx.fillStyle = '#C0B898'
  ctx.fillRect(sx + 3, sy + 1, w - 6, 1)
  ctx.fillRect(sx + 3, sy + 3, w - 6, 1)
  ctx.fillRect(sx + 3, sy + 5, w - 6, 1)
}

function drawCtBell(ctx, obj, camX, camY, alpha) {
  const cx = Math.floor(obj.x + obj.w / 2 - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // Bell dome — brass
  ctx.fillStyle = '#C8A030'
  ctx.beginPath()
  ctx.ellipse(cx, sy + Math.floor(h * 0.55), Math.floor(w / 2), Math.floor(h * 0.55), 0, Math.PI, 0)
  ctx.fill()

  // Dome highlight — soft specular
  ctx.fillStyle = '#E8C850'
  ctx.globalAlpha = 0.55 * alpha
  ctx.beginPath()
  ctx.ellipse(cx - Math.floor(w * 0.14), sy + Math.floor(h * 0.28), Math.floor(w * 0.11), Math.floor(h * 0.17), -0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = alpha

  // Button on top
  ctx.fillStyle = '#B89020'
  ctx.fillRect(cx - 2, sy, 4, 5)
  ctx.fillStyle = '#C8A030'
  ctx.beginPath()
  ctx.arc(cx, sy + 2, 3, 0, Math.PI * 2)
  ctx.fill()

  // Base ring
  ctx.fillStyle = '#A07820'
  ctx.fillRect(cx - Math.floor(w / 2), sy + Math.floor(h * 0.54), w, 4)
  ctx.fillStyle = '#C8A030'
  ctx.fillRect(cx - Math.floor(w / 2) + 1, sy + Math.floor(h * 0.54), w - 2, 1)
}

function drawCtLampHalo(ctx, obj, camX, camY, alpha) {
  const cx = Math.floor(obj.x + obj.w / 2 - camX)
  const cy = Math.floor(obj.y + obj.h / 2 - camY)
  ctx.save()
  ctx.translate(cx, cy); ctx.scale(1.4, 0.7); ctx.translate(-cx, -cy)
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, obj.w * 0.55)
  grad.addColorStop(0,    `rgba(255, 210, 100, ${0.50 * alpha})`)
  grad.addColorStop(0.25, `rgba(255, 195,  80, ${0.28 * alpha})`)
  grad.addColorStop(0.55, `rgba(255, 175,  60, ${0.10 * alpha})`)
  grad.addColorStop(1,    `rgba(255, 155,  40, 0)`)
  ctx.fillStyle = grad
  ctx.beginPath(); ctx.arc(cx, cy, obj.w * 0.55, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function drawCtLamp(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  const mx = sx + Math.floor(w / 2)
  ctx.globalAlpha = alpha

  // Base
  ctx.fillStyle = '#A07820'
  ctx.fillRect(mx - 5, sy + h - 4, 10, 4)
  ctx.fillStyle = '#C89A30'
  ctx.fillRect(mx - 5, sy + h - 4, 10, 1)

  // Pole
  ctx.fillStyle = '#B88A28'
  ctx.fillRect(mx - 2, sy + 8, 4, h - 11)
  ctx.fillStyle = '#D4A840'
  ctx.fillRect(mx - 2, sy + 8, 1, h - 11)

  // Shade (trapezoid)
  const inset = 3
  ctx.fillStyle = '#F5E8C0'
  ctx.beginPath()
  ctx.moveTo(sx + inset, sy); ctx.lineTo(sx + w - inset, sy)
  ctx.lineTo(sx + w, sy + 9); ctx.lineTo(sx, sy + 9)
  ctx.closePath(); ctx.fill()
  // Inner lit panel
  ctx.fillStyle = '#FFF5D8'
  ctx.beginPath()
  ctx.moveTo(sx + inset + 2, sy + 1); ctx.lineTo(sx + w - inset - 2, sy + 1)
  ctx.lineTo(sx + w - 2, sy + 8);     ctx.lineTo(sx + 2, sy + 8)
  ctx.closePath(); ctx.fill()
  // Shade brass rim
  ctx.fillStyle = '#C89A30'
  ctx.fillRect(sx - 1, sy + 8, w + 2, 2)
}

function drawCtPostbox(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  const mx = sx + Math.floor(w / 2)
  ctx.globalAlpha = alpha

  // Drop shadow
  ctx.globalAlpha = 0.15 * alpha
  ctx.fillStyle = '#000'
  ctx.fillRect(sx + 4, sy + 6, w, h)
  ctx.globalAlpha = alpha

  // Main body
  ctx.fillStyle = '#CC1A1A'
  ctx.fillRect(sx + 4, sy + 10, w - 8, h - 16)
  // Left highlight curve
  ctx.fillStyle = '#E83030'
  ctx.fillRect(sx + 4, sy + 10, 7, h - 16)
  // Right shadow
  ctx.fillStyle = '#991010'
  ctx.fillRect(sx + w - 11, sy + 10, 7, h - 16)

  // Domed top
  ctx.fillStyle = '#CC1A1A'
  ctx.beginPath(); ctx.ellipse(mx, sy + 12, w/2 - 4, 11, 0, Math.PI, 0); ctx.fill()
  ctx.fillStyle = '#E83030'
  ctx.beginPath(); ctx.ellipse(mx - 3, sy + 10, w/2 - 8, 7, 0, Math.PI, 0); ctx.fill()

  // Crown finial
  ctx.fillStyle = '#BB1010'
  ctx.fillRect(mx - 4, sy + 1, 8, 12)
  ctx.fillStyle = '#AA1010'
  ctx.beginPath(); ctx.arc(mx, sy + 2, 4, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#CC2020'
  ctx.beginPath(); ctx.arc(mx - 1, sy + 1, 3, 0, Math.PI * 2); ctx.fill()

  // Brass letter slot
  const slotY = sy + Math.floor(h * 0.32)
  ctx.fillStyle = '#B89020'
  ctx.fillRect(sx + 7, slotY - 2, w - 14, 11)
  ctx.fillStyle = '#D4AA30'
  ctx.fillRect(sx + 7, slotY - 2, w - 14, 2)
  // Slot opening
  ctx.fillStyle = '#1A0808'
  ctx.fillRect(sx + 9, slotY + 2, w - 18, 4)
  // Flap
  ctx.fillStyle = '#C89020'
  ctx.fillRect(sx + 9, slotY + 2, w - 18, 2)

  // "ROYAL MAIL" text lines
  ctx.globalAlpha = 0.65 * alpha
  ctx.fillStyle = '#FFD060'
  ctx.fillRect(sx + 9,  slotY + 9,  w - 18, 2)
  ctx.fillRect(sx + 11, slotY + 13, w - 22, 1)
  ctx.globalAlpha = alpha

  // Royal cypher emblem
  const emblemY = sy + Math.floor(h * 0.60)
  ctx.fillStyle = '#B89020'
  ctx.beginPath(); ctx.arc(mx, emblemY, 7, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#D4AA30'
  ctx.beginPath(); ctx.arc(mx, emblemY, 5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#CC1A1A'
  ctx.beginPath(); ctx.arc(mx, emblemY, 3, 0, Math.PI * 2); ctx.fill()

  // Bottom base band
  ctx.fillStyle = '#881010'
  ctx.fillRect(sx + 2, sy + h - 8, w - 4, 8)
  ctx.fillStyle = '#AA1818'
  ctx.fillRect(sx + 2, sy + h - 8, w - 4, 2)
}

function drawCtNewspaper(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h, color } = obj
  ctx.globalAlpha = alpha

  // Paper shadow
  ctx.globalAlpha = 0.12 * alpha
  ctx.fillStyle = '#000'
  ctx.fillRect(sx + 2, sy + 2, w, h)
  ctx.globalAlpha = alpha

  // Paper body
  ctx.fillStyle = color
  ctx.fillRect(sx, sy, w, h)

  // Edge shadow
  ctx.globalAlpha = 0.10 * alpha
  ctx.fillStyle = '#000'
  ctx.fillRect(sx, sy, w, 1)
  ctx.fillRect(sx, sy, 1, h)
  ctx.globalAlpha = alpha

  // Headline bar
  ctx.globalAlpha = 0.60 * alpha
  ctx.fillStyle = '#2A2018'
  ctx.fillRect(sx + 4, sy + 4, w - 8, 5)
  ctx.globalAlpha = alpha

  // Two-column text layout
  const col1w = Math.floor((w - 12) / 2)
  ctx.globalAlpha = 0.22 * alpha
  ctx.fillStyle = '#2A2018'
  for (let row = 0; row < 4; row++) {
    ctx.fillRect(sx + 4,            sy + 13 + row * 5, col1w - 1, 2)
    ctx.fillRect(sx + 6 + col1w,    sy + 13 + row * 5, col1w - 1, 2)
  }
  // Photo block in left column
  ctx.globalAlpha = 0.18 * alpha
  ctx.fillRect(sx + 4, sy + 13, col1w - 1, 11)
  ctx.globalAlpha = alpha

  // Fold crease
  ctx.globalAlpha = 0.10 * alpha
  ctx.fillStyle = '#000'
  ctx.fillRect(sx, sy + Math.floor(h / 2), w, 1)
  ctx.globalAlpha = alpha
}

function drawWsRoom(ctx, room, camX, camY) {
  const ox = room.col * ROOM_W
  const oy = room.row * ROOM_H
  const sx = Math.floor(ox - camX)
  const sy = Math.floor(oy - camY)

  // ── Colour palette ───────────────────────────────────────────────────────
  const WALL_PLANKS  = ['#7C5C3C', '#8C6A48', '#745438', '#906E4C', '#6E4E34', '#866244', '#7E5A3C']
  const FLOOR_PLANKS = ['#2E2010', '#382614', '#321C0E', '#3C2818', '#2A1C0C', '#3A2412', '#302010']
  const VPLANK_COLS  = ['#3A2818', '#443022', '#3C2A1A', '#482E1E']
  const SOUTH_COLOR  = '#211409'
  const NAIL_DARK    = '#1A1208'
  const NAIL_SHINE   = '#7A6848'

  // ── Helpers ──────────────────────────────────────────────────────────────
  function plankRow(y, pw, col, clamp) {
    ctx.fillStyle = col
    ctx.fillRect(sx, y, ROOM_W, pw)
    // Highlight top edge
    ctx.globalAlpha = 0.22
    ctx.fillStyle = '#FFF8E8'
    ctx.fillRect(sx, y, ROOM_W, 1)
    // Shadow bottom edge
    ctx.globalAlpha = 0.40
    ctx.fillStyle = '#000'
    ctx.fillRect(sx, y + pw - 1, ROOM_W, 1)
    ctx.globalAlpha = 1
    // Horizontal grain flecks
    ctx.globalAlpha = 0.06
    ctx.fillStyle = '#0A0600'
    for (let g = 3; g < pw - 2; g += 5) {
      const len = 60 + Math.floor(((y + g) * 37 + 17) % 80)
      const xo  = 20 + Math.floor(((y + g) * 53 + 9)  % (ROOM_W - 80))
      ctx.fillRect(sx + xo, y + g, len, 1)
    }
    ctx.globalAlpha = 1
    // Knot (every 5th plank roughly)
    const rowIdx = Math.round((y - sy) / pw)
    if (rowIdx % 5 === 2) {
      const kx = sx + 80 + Math.floor((rowIdx * 97 + 41) % (ROOM_W - 160))
      const kr = 3 + Math.floor((rowIdx * 13 + 7) % 4)
      ctx.fillStyle = darken(col, 0.55)
      ctx.beginPath(); ctx.arc(kx, y + Math.floor(pw / 2), kr, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 0.4
      ctx.fillStyle = darken(col, 0.35)
      ctx.beginPath(); ctx.arc(kx, y + Math.floor(pw / 2), kr + 1, 0, Math.PI * 2); ctx.stroke?.()
      ctx.globalAlpha = 1
    }
    // Nail heads (4 per plank — left, 1/3, 2/3, right)
    const nailY = y + Math.floor(pw / 2)
    for (const nx of [sx + 9, sx + Math.floor(ROOM_W / 3), sx + Math.floor(ROOM_W * 2 / 3), sx + ROOM_W - 9]) {
      ctx.fillStyle = NAIL_DARK
      ctx.beginPath(); ctx.arc(nx, nailY, 2.5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = NAIL_SHINE
      ctx.globalAlpha = 0.7
      ctx.beginPath(); ctx.arc(nx - 0.8, nailY - 0.8, 1, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1
    }
  }

  // ── North wall — horizontal planks ──────────────────────────────────────
  const PLANK_H = 13
  const wallRows = Math.ceil(WALL_TOP / PLANK_H)
  for (let i = 0; i < wallRows; i++) {
    const py  = sy + i * PLANK_H
    const ph  = Math.min(PLANK_H - 1, WALL_TOP - i * PLANK_H)
    if (ph <= 0) break
    plankRow(py, ph, WALL_PLANKS[i % WALL_PLANKS.length])
  }

  // Shadow at base of back wall
  if (!room.doors?.top) {
    ctx.globalAlpha = 0.55
    ctx.fillStyle = '#000'
    ctx.fillRect(sx, sy + WALL_TOP - 5, ROOM_W, 5)
    ctx.globalAlpha = 1
  }

  // ── Floor — worn horizontal floorboards ─────────────────────────────────
  const FPH = 18   // floor plank height
  const floorRows = Math.ceil((WALL_BOTTOM - WALL_TOP) / FPH)
  for (let i = 0; i < floorRows; i++) {
    const py  = sy + WALL_TOP + i * FPH
    const ph  = Math.min(FPH - 1, WALL_BOTTOM - (WALL_TOP + i * FPH))
    if (ph <= 0) break
    const col = FLOOR_PLANKS[i % FLOOR_PLANKS.length]
    ctx.fillStyle = col
    ctx.fillRect(sx + WALL_LEFT, py, WALL_RIGHT - WALL_LEFT, ph)
    // Plank gap shadow
    ctx.globalAlpha = 0.35
    ctx.fillStyle = '#000'
    ctx.fillRect(sx + WALL_LEFT, py + ph - 1, WALL_RIGHT - WALL_LEFT, 1)
    ctx.globalAlpha = 1
    // Subtle grain
    ctx.globalAlpha = 0.05
    ctx.fillStyle = '#0A0600'
    for (let g = 3; g < ph - 1; g += 6) {
      ctx.fillRect(sx + WALL_LEFT, py + g, WALL_RIGHT - WALL_LEFT, 1)
    }
    ctx.globalAlpha = 1
  }

  // ── South wall band — rough dark baseboard ───────────────────────────────
  ctx.fillStyle = SOUTH_COLOR
  ctx.fillRect(sx, sy + WALL_BOTTOM, ROOM_W, ROOM_H - WALL_BOTTOM)
  ctx.globalAlpha = 0.3
  ctx.fillStyle = '#FFF8E8'
  ctx.fillRect(sx, sy + WALL_BOTTOM, ROOM_W, 2)
  ctx.globalAlpha = 1

  // ── West wall strip — tight vertical planks ──────────────────────────────
  const VPW = 5
  for (let i = 0; i < Math.ceil(WALL_LEFT / VPW) + 1; i++) {
    const px = sx + i * VPW
    const pw = Math.min(VPW - 1, WALL_LEFT - i * VPW)
    if (pw <= 0) break
    ctx.fillStyle = VPLANK_COLS[i % VPLANK_COLS.length]
    ctx.fillRect(px, sy, pw, ROOM_H)
    ctx.globalAlpha = 0.4
    ctx.fillStyle = '#000'
    ctx.fillRect(px + pw - 1, sy, 1, ROOM_H)
    ctx.globalAlpha = 1
    // Highlight left edge of each plank
    ctx.globalAlpha = 0.12
    ctx.fillStyle = '#FFF8E8'
    ctx.fillRect(px, sy, 1, ROOM_H)
    ctx.globalAlpha = 1
  }

  // ── East wall strip — tight vertical planks ──────────────────────────────
  for (let i = 0; i < Math.ceil((ROOM_W - WALL_RIGHT) / VPW) + 2; i++) {
    const px = sx + WALL_RIGHT + i * VPW
    const pw = Math.min(VPW - 1, ROOM_W - WALL_RIGHT - i * VPW)
    if (pw <= 0 || px >= sx + ROOM_W) break
    ctx.fillStyle = VPLANK_COLS[i % VPLANK_COLS.length]
    ctx.fillRect(px, sy, pw, ROOM_H)
    ctx.globalAlpha = 0.4
    ctx.fillStyle = '#000'
    ctx.fillRect(px + pw - 1, sy, 1, ROOM_H)
    ctx.globalAlpha = 1
    ctx.globalAlpha = 0.12
    ctx.fillStyle = '#FFF8E8'
    ctx.fillRect(px, sy, 1, ROOM_H)
    ctx.globalAlpha = 1
  }

  // ── Door openings — reveal floor colour ──────────────────────────────────
  const doors = room.doors || {}
  const DOOR_FLOOR = FLOOR_PLANKS[2]
  if (doors.top) {
    ctx.fillStyle = DOOR_FLOOR
    ctx.fillRect(sx + DOOR_MID_X - DOOR_SIZE / 2, sy, DOOR_SIZE, WALL_TOP)
  }
  if (doors.bottom) {
    ctx.fillStyle = SOUTH_COLOR
    ctx.fillRect(sx + DOOR_MID_X - DOOR_SIZE / 2, sy + WALL_BOTTOM, DOOR_SIZE, ROOM_H - WALL_BOTTOM)
  }
  if (doors.left) {
    ctx.fillStyle = DOOR_FLOOR
    ctx.fillRect(sx, sy + DOOR_MID_Y - DOOR_SIZE / 2, WALL_LEFT, DOOR_SIZE)
  }
  if (doors.right) {
    ctx.fillStyle = DOOR_FLOOR
    ctx.fillRect(sx + WALL_RIGHT, sy + DOOR_MID_Y - DOOR_SIZE / 2, ROOM_W - WALL_RIGHT, DOOR_SIZE)
  }
}

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
  const dh = obj.displayH ?? obj.h
  const b  = obj._screenBrightness ?? 0

  // ── Screen background ──
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#0D1117'
  ctx.fillRect(sx, sy, obj.w, dh)

  // ── Title bar ──
  ctx.globalAlpha = b * alpha
  ctx.fillStyle = '#161B22'
  ctx.fillRect(sx, sy, obj.w, 3)

  // Traffic lights (macOS style)
  const dots = ['#FF5F57', '#FFBD2E', '#28C840']
  for (let i = 0; i < dots.length; i++) {
    ctx.fillStyle = dots[i]
    ctx.beginPath()
    ctx.arc(sx + 3 + i * 4, sy + 1.5, 1, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── Syntax-coloured code lines ──
  const lines = [
    { ox:  0, w: 20, c: '#FF7B72' },
    { ox: 22, w: 14, c: '#79C0FF' },
    { ox:  0, w: 12, c: '#FF7B72' },
    { ox: 14, w: 20, c: '#A5D6FF' },
    { ox:  6, w: 26, c: '#7EE787' },
    { ox:  0, w: 16, c: '#FF7B72' },
    { ox: 18, w: 14, c: '#79C0FF' },
  ]
  ctx.globalAlpha = 0.90 * b * alpha
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    ctx.fillStyle = l.c
    ctx.fillRect(sx + 2 + l.ox, sy + 4 + i * 3, l.w, 2)
  }

  // Blinking cursor
  const blink = Math.floor(Date.now() / 530) % 2 === 0
  if (blink) {
    ctx.globalAlpha = 0.95 * b * alpha
    ctx.fillStyle = '#58A6FF'
    ctx.fillRect(sx + 2, sy + 4 + lines.length * 3, 2, 2)
  }

  // Status bar (blue accent strip at bottom)
  ctx.globalAlpha = b * alpha
  ctx.fillStyle = '#1F6FEB'
  ctx.fillRect(sx, sy + dh - 2, obj.w, 2)

  // ── Scanline shimmer (subtle horizontal bands) ──
  ctx.globalAlpha = 0.06 * b * alpha
  ctx.fillStyle = '#000000'
  for (let row = sy; row < sy + dh; row += 2) {
    ctx.fillRect(sx, row, obj.w, 1)
  }

  ctx.globalAlpha = alpha
}

function drawLrMonitorFrame(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const dh = obj.displayH ?? obj.h
  const b  = obj._screenBrightness ?? 1

  // ── Ambient glow — drawn FIRST so the crisp bezel renders on top ──
  if (b > 0.01) {
    ctx.globalAlpha = alpha
    const scx = sx + obj.w / 2
    const scy = sy + dh * 0.7
    const gradR = obj.w * 2.8
    const radGlow = ctx.createRadialGradient(scx, scy, 0, scx, scy, gradR)
    radGlow.addColorStop(0,    `rgba(58,127,220,${0.50 * b})`)
    radGlow.addColorStop(0.25, `rgba(58,127,220,${0.28 * b})`)
    radGlow.addColorStop(0.55, `rgba(58,127,220,${0.10 * b})`)
    radGlow.addColorStop(0.85, `rgba(58,127,220,${0.03 * b})`)
    radGlow.addColorStop(1,    'rgba(58,127,220,0)')
    ctx.fillStyle = radGlow
    ctx.fillRect(sx - gradR, sy - gradR, obj.w + gradR * 2, dh + gradR * 2)

    // Downward bleed onto desk
    const bleedR = obj.w * 2.0
    const bleedGrad = ctx.createRadialGradient(scx, sy + dh, 0, scx, sy + dh, bleedR)
    bleedGrad.addColorStop(0,    `rgba(48,112,210,${0.40 * b})`)
    bleedGrad.addColorStop(0.35, `rgba(48,112,210,${0.18 * b})`)
    bleedGrad.addColorStop(0.70, `rgba(48,112,210,${0.06 * b})`)
    bleedGrad.addColorStop(1,    'rgba(48,112,210,0)')
    ctx.fillStyle = bleedGrad
    ctx.fillRect(sx - bleedR, sy + dh, obj.w + bleedR * 2, bleedR)
  }

  ctx.globalAlpha = alpha

  // ── Bezel — drawn ON TOP of glow ──
  ctx.fillStyle = '#9A96B8'
  ctx.fillRect(sx, sy, obj.w, dh)
  // Top highlight
  ctx.fillStyle = '#D8D4F0'
  ctx.fillRect(sx, sy, obj.w, 2)
  // Left highlight
  ctx.fillStyle = '#C0BCDC'
  ctx.fillRect(sx, sy + 2, 2, dh - 2)
  // Right shadow
  ctx.fillStyle = '#5A5878'
  ctx.fillRect(sx + obj.w - 2, sy + 2, 2, dh - 2)
  // Bottom shadow
  ctx.fillRect(sx + 2, sy + dh - 1, obj.w - 2, 1)
  // Inner dark inset (screen opening)
  ctx.fillStyle = '#0E0B1C'
  ctx.fillRect(sx + 2, sy + 2, obj.w - 4, dh - 3)

  // Power LED — cyan dot, bottom-right of bezel
  ctx.globalAlpha = 0.95 * alpha
  ctx.fillStyle = '#00FFCC'
  ctx.fillRect(sx + obj.w - 5, sy + dh - 3, 2, 2)
  const ledGrad = ctx.createRadialGradient(
    sx + obj.w - 4, sy + dh - 2, 0,
    sx + obj.w - 4, sy + dh - 2, 5
  )
  ledGrad.addColorStop(0,   'rgba(0,255,200,0.55)')
  ledGrad.addColorStop(1,   'rgba(0,255,200,0)')
  ctx.fillStyle = ledGrad
  ctx.fillRect(sx + obj.w - 9, sy + dh - 7, 10, 10)
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
    const dh = obj.displayH ?? obj.h
    ctx.moveTo(sx + i * 7 + 2, sy + dh)
    ctx.bezierCurveTo(
      sx + i * 7 + 2 + xOff,       sy + dh * 0.6,
      sx + i * 7 + 2 - xOff,       sy + dh * 0.3,
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
  const { w } = obj
  const h = obj.displayH ?? obj.h
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
  const { w } = obj
  const h = obj.displayH ?? obj.h
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

function drawLrSuccPot(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const dh = obj.displayH ?? obj.h
  ctx.globalAlpha = alpha
  ctx.fillStyle = obj.color
  ctx.fillRect(sx, sy, obj.w, dh)
}

function drawSucculent(ctx, obj, camX, camY, alpha) {
  const dh = obj.displayH ?? obj.h
  const cx = Math.floor(obj.x + obj.w / 2 - camX)
  const cy = Math.floor(obj.y + dh / 2 - camY)
  const r  = Math.min(obj.w, dh) * 0.50
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

// ── Gallery object renderers ─────────────────────────────────────────────────

function drawGlSpotlight(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const cx = sx + obj.w / 2

  // Triangle clip: narrow at ceiling, wide at frame bottom
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(cx, sy)
  ctx.lineTo(sx + obj.w, sy + obj.h)
  ctx.lineTo(sx,         sy + obj.h)
  ctx.closePath()
  ctx.clip()

  const grad = ctx.createLinearGradient(cx, sy, cx, sy + obj.h)
  grad.addColorStop(0,    `rgba(255,210,100,0)`)
  grad.addColorStop(0.35, `rgba(255,210,100,${0.05 * alpha})`)
  grad.addColorStop(0.75, `rgba(255,210,100,${0.14 * alpha})`)
  grad.addColorStop(1.0,  `rgba(255,200, 80,${0.09 * alpha})`)
  ctx.fillStyle = grad
  ctx.fillRect(sx, sy, obj.w, obj.h)
  ctx.restore()

  // Tiny bright fixture dot at ceiling
  ctx.globalAlpha = 0.65 * alpha
  ctx.fillStyle = '#FFF8E0'
  ctx.beginPath()
  ctx.arc(cx, sy + 3, 2, 0, Math.PI * 2)
  ctx.fill()
}

function drawGlFrame(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  ctx.globalAlpha = alpha

  // Drop shadow
  ctx.globalAlpha = 0.50 * alpha
  ctx.fillStyle = '#000000'
  ctx.fillRect(sx + 5, sy + 5, obj.w, obj.h)

  ctx.globalAlpha = alpha

  // Gold body
  ctx.fillStyle = '#8B7340'
  ctx.fillRect(sx, sy, obj.w, obj.h)

  // Bevel highlights: top + left bright edges
  ctx.fillStyle = '#D4A84C'
  ctx.fillRect(sx, sy, obj.w, 3)
  ctx.fillStyle = '#C49A3C'
  ctx.fillRect(sx, sy + 3, 3, obj.h - 3)

  // Bevel shadows: right + bottom dark edges
  ctx.fillStyle = '#5A4820'
  ctx.fillRect(sx + obj.w - 3, sy + 3, 3, obj.h - 3)
  ctx.fillRect(sx + 3, sy + obj.h - 3, obj.w - 3, 3)

  // Inner dark mat (4px inset)
  ctx.fillStyle = '#0A0810'
  ctx.fillRect(sx + 4, sy + 4, obj.w - 8, obj.h - 8)

  // Project screenshot (9px inset — inside the mat, filling the opening)
  const frameIdx = parseInt(obj.id.replace('gl-frame-', ''), 10)
  const frameImg = GL_PROJECT_IMGS[frameIdx]
  const imgX = sx + 9, imgY = sy + 9, imgW = obj.w - 18, imgH = obj.h - 18
  ctx.globalAlpha = alpha
  if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {
    // Contain-fit: scale image to fit inside imgW×imgH, preserve aspect ratio, letterbox with black
    const scale = Math.min(imgW / frameImg.naturalWidth, imgH / frameImg.naturalHeight)
    const dw = Math.round(frameImg.naturalWidth * scale)
    const dh = Math.round(frameImg.naturalHeight * scale)
    const dx = imgX + Math.floor((imgW - dw) / 2)
    const dy = imgY + Math.floor((imgH - dh) / 2)
    ctx.globalAlpha = alpha
    ctx.drawImage(frameImg, dx, dy, dw, dh)
    // Subtle glass-reflection shimmer: thin white gradient at top
    const shine = ctx.createLinearGradient(dx, dy, dx, dy + dh * 0.35)
    shine.addColorStop(0,   'rgba(255,255,255,0.10)')
    shine.addColorStop(0.5, 'rgba(255,255,255,0.03)')
    shine.addColorStop(1,   'rgba(255,255,255,0)')
    ctx.fillStyle = shine
    ctx.fillRect(dx, dy, dw, dh * 0.35)
  }

  // Thin inner gold rule around mat opening (on top of image)
  ctx.globalAlpha = 0.45 * alpha
  ctx.fillStyle = '#C49A3C'
  ctx.fillRect(sx + 4,          sy + 4,          obj.w - 8, 1)
  ctx.fillRect(sx + 4,          sy + 4,          1,         obj.h - 8)
  ctx.fillRect(sx + obj.w - 5,  sy + 4,          1,         obj.h - 8)
  ctx.fillRect(sx + 4,          sy + obj.h - 5,  obj.w - 8, 1)
}

function drawGlFrameImg(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const idx = parseInt(obj.id.replace('gl-frame-img-', ''), 10)
  const img = GL_PROJECT_IMGS[idx]
  ctx.globalAlpha = alpha
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, sx, sy, obj.w, obj.h)
  } else {
    ctx.fillStyle = '#0A0810'
    ctx.fillRect(sx, sy, obj.w, obj.h)
  }
}

function drawGlPlacard(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  ctx.globalAlpha = alpha

  // Dark body
  ctx.fillStyle = '#1A1520'
  ctx.fillRect(sx, sy, obj.w, obj.h)

  // Top gold rule
  ctx.fillStyle = '#C49A3C'
  ctx.fillRect(sx, sy, obj.w, 1)

  // Simulated text lines
  ctx.globalAlpha = 0.40 * alpha
  ctx.fillStyle = '#4A3F60'
  ctx.fillRect(sx + 6, sy + 4, obj.w - 12, 2)
  ctx.fillRect(sx + 6, sy + 8, Math.floor((obj.w - 12) * 0.60), 2)
}

function drawGlBench(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const legH = 12

  ctx.globalAlpha = alpha

  // Upholstered seat
  ctx.fillStyle = '#1E1A2E'
  ctx.fillRect(sx, sy, obj.w, obj.h - legH)

  // Subtle velvet sheen
  ctx.globalAlpha = 0.16 * alpha
  ctx.fillStyle = '#8070A0'
  ctx.fillRect(sx + 4, sy + 2, obj.w - 8, 3)

  ctx.globalAlpha = alpha

  // Seat bottom edge
  ctx.fillStyle = '#2A2440'
  ctx.fillRect(sx, sy + obj.h - legH - 2, obj.w, 2)

  // Gold legs
  ctx.fillStyle = '#8B7340'
  ctx.fillRect(sx + 6,           sy + obj.h - legH, 4, legH)
  ctx.fillRect(sx + obj.w - 10,  sy + obj.h - legH, 4, legH)

  // Leg highlight edge
  ctx.fillStyle = '#D4A84C'
  ctx.fillRect(sx + 6,          sy + obj.h - legH, 1, legH)
  ctx.fillRect(sx + obj.w - 10, sy + obj.h - legH, 1, legH)

  // Connecting gold rail
  ctx.fillStyle = '#8B7340'
  ctx.fillRect(sx + 6, sy + obj.h - 4, obj.w - 12, 2)
  ctx.fillStyle = '#D4A84C'
  ctx.fillRect(sx + 6, sy + obj.h - 4, obj.w - 12, 1)
}

// ── Workshop object renderers ───────────────────────────────────────────────

function drawWsBench(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  const FACE = 9
  ctx.globalAlpha = alpha

  // Front face
  ctx.fillStyle = '#1C1410'
  ctx.fillRect(sx, sy + h - FACE, w, FACE)
  ctx.fillStyle = '#3A3030'
  ctx.fillRect(sx, sy + h - FACE, w, 2)
  ctx.fillStyle = '#0E0A08'
  ctx.fillRect(sx, sy + h - 2, w, 2)

  // Surface — worn oak
  ctx.fillStyle = '#5E4330'
  ctx.fillRect(sx, sy, w, h - FACE)

  // Horizontal grain lines
  ctx.globalAlpha = 0.07 * alpha
  ctx.fillStyle = '#2A1A0E'
  const grainRows = 9
  for (let i = 0; i < grainRows; i++) {
    ctx.fillRect(sx + 2, sy + 2 + Math.floor(i * (h - FACE - 4) / grainRows), w - 4, 1)
  }
  ctx.globalAlpha = alpha

  // Top specular
  ctx.fillStyle = '#7A5C42'
  ctx.fillRect(sx, sy, w, 3)
  ctx.fillStyle = '#8A6A50'
  ctx.fillRect(sx, sy, w, 1)

  // Metal side bands
  ctx.fillStyle = '#444444'
  ctx.fillRect(sx, sy, 4, h - FACE)
  ctx.fillRect(sx + w - 4, sy, 4, h - FACE)
  ctx.fillStyle = '#666666'
  ctx.fillRect(sx, sy, 1, h - FACE)
  ctx.fillRect(sx + w - 1, sy, 1, h - FACE)

  // Bolt heads on front face
  const bolts = [18, 90, 190, 285, 345]
  for (const bx of bolts) {
    if (bx < w - 10) {
      ctx.fillStyle = '#888'
      ctx.beginPath(); ctx.arc(sx + bx, sy + h - 5, 2.5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#555'
      ctx.beginPath(); ctx.arc(sx + bx + 0.5, sy + h - 4.5, 2.5, 0, Math.PI * 2); ctx.fill()
    }
  }

  // Surface scratch marks
  ctx.globalAlpha = 0.18 * alpha
  ctx.fillStyle = '#2A1810'
  ctx.fillRect(sx + 280, sy + 10, 18, 1)
  ctx.fillRect(sx + 290, sy + 15, 10, 1)
  ctx.fillRect(sx + 320, sy + 8,   6, 1)
  ctx.globalAlpha = alpha
}

function drawWsMonitor(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  const standW = Math.floor(w * 0.4)
  const standH = 4

  // Stand base
  ctx.fillStyle = '#0C0C1A'
  ctx.fillRect(sx + Math.floor((w - standW) / 2), sy + h - standH, standW, standH)
  ctx.fillStyle = '#1A1A30'
  ctx.fillRect(sx + Math.floor((w - standW) / 2), sy + h - standH, standW, 1)

  // Neck
  ctx.fillStyle = '#0E0E1C'
  ctx.fillRect(sx + Math.floor(w / 2) - 3, sy + h - standH - 8, 6, 8)

  // Bezel
  const bezelH = h - standH - 2
  ctx.fillStyle = '#0E0E20'
  ctx.fillRect(sx, sy, w, bezelH)

  // Bottom ridge
  ctx.fillStyle = '#1C1C34'
  ctx.fillRect(sx, sy + bezelH - 3, w, 3)

  // Power LED
  ctx.fillStyle = '#00FF88'
  ctx.globalAlpha = 0.9 * alpha
  ctx.beginPath(); ctx.arc(sx + w - 6, sy + bezelH - 6, 1.5, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 0.15 * alpha
  ctx.beginPath(); ctx.arc(sx + w - 6, sy + bezelH - 6, 4, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = alpha
}

function drawWsScreen(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // Terminal BG
  ctx.fillStyle = '#030A06'
  ctx.fillRect(sx, sy, w, h)

  // Title bar
  ctx.fillStyle = '#0A1F12'
  ctx.fillRect(sx, sy, w, 6)
  ctx.globalAlpha = 0.8 * alpha
  ctx.fillStyle = '#00CC66'
  ctx.fillRect(sx + 2, sy + 2, 10, 2)
  ctx.globalAlpha = alpha

  // Prompt indicator
  ctx.globalAlpha = 0.9 * alpha
  ctx.fillStyle = '#00FF88'
  ctx.fillRect(sx + 2, sy + 8, 5, 2)

  // Terminal lines
  const lines = [
    { ox: 8,  lw: 28, dim: false },
    { ox: 4,  lw: 22, dim: true  },
    { ox: 12, lw: 18, dim: false },
    { ox: 8,  lw: 30, dim: true  },
    { ox: 0,  lw: 24, dim: false },
    { ox: 6,  lw: 20, dim: true  },
    { ox: 10, lw: 26, dim: false },
    { ox: 4,  lw: 16, dim: true  },
  ]
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    ctx.globalAlpha = (l.dim ? 0.35 : 0.75) * alpha
    ctx.fillStyle = '#00FF88'
    ctx.fillRect(sx + 2 + l.ox, sy + 11 + i * 4, Math.min(l.lw, w - 4 - l.ox), 2)
  }

  // Blinking cursor
  if (Math.floor(Date.now() / 600) % 2 === 0) {
    ctx.globalAlpha = 0.9 * alpha
    ctx.fillStyle = '#00FF88'
    ctx.fillRect(sx + 2, sy + 11 + lines.length * 4, 3, 3)
  }

  // Ambient glow
  ctx.globalAlpha = 0.08 * alpha
  const gcx = sx + w / 2, gcy = sy + h / 2
  const gGrad = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, w)
  gGrad.addColorStop(0, '#00FF88')
  gGrad.addColorStop(1, 'rgba(0,255,136,0)')
  ctx.fillStyle = gGrad
  ctx.fillRect(sx - w, sy - h, w * 3, h * 3)
  ctx.globalAlpha = alpha
}

function drawWsKeyboard(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // Base
  ctx.fillStyle = '#222222'
  ctx.fillRect(sx, sy, w, h)

  // Front bevel
  ctx.fillStyle = '#111111'
  ctx.fillRect(sx, sy + h - 3, w, 3)

  // Keycap rows
  const keyColors = ['#2E2E2E', '#2A2A2A', '#333333']
  const keyW = 6, keyH = 4, gap = 1

  // Row 1
  for (let i = 0; i < Math.floor((w - 2) / (keyW + gap)); i++) {
    ctx.fillStyle = keyColors[i % 3]
    ctx.fillRect(sx + 1 + i * (keyW + gap), sy + 2, keyW, keyH)
    ctx.fillStyle = '#3A3A3A'
    ctx.fillRect(sx + 1 + i * (keyW + gap), sy + 2, keyW, 1)
  }
  // Row 2 (offset)
  for (let i = 0; i < Math.floor((w - 5) / (keyW + gap)); i++) {
    ctx.fillStyle = keyColors[(i + 1) % 3]
    ctx.fillRect(sx + 4 + i * (keyW + gap), sy + 7, keyW, keyH)
    ctx.fillStyle = '#3A3A3A'
    ctx.fillRect(sx + 4 + i * (keyW + gap), sy + 7, keyW, 1)
  }

  // LED indicators (top right)
  const ledCols = ['#00FF00', '#FFAA00', '#FFFFFF']
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = ledCols[i]
    ctx.globalAlpha = 0.6 * alpha
    ctx.beginPath(); ctx.arc(sx + w - 5 - i * 5, sy + 2, 1, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = alpha
}

function drawWsToolbox(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  const LID = 12
  ctx.globalAlpha = alpha

  // Body
  ctx.fillStyle = '#8B1010'
  ctx.fillRect(sx, sy + LID, w, h - LID)

  // Front face depth
  ctx.fillStyle = '#6A0A0A'
  ctx.fillRect(sx, sy + h - 5, w, 5)

  // Right shadow
  ctx.fillStyle = '#7A0E0E'
  ctx.fillRect(sx + w - 4, sy + LID, 4, h - LID)

  // Left highlight
  ctx.fillStyle = '#AA1A1A'
  ctx.fillRect(sx, sy + LID, 3, h - LID)

  // Chrome latch
  const lx = sx + Math.floor(w / 2) - 5
  const ly = sy + Math.floor(h * 0.55)
  ctx.fillStyle = '#C0C0C0'
  ctx.fillRect(lx, ly, 10, 6)
  ctx.fillStyle = '#E8E8E8'
  ctx.fillRect(lx, ly, 10, 2)
  ctx.fillStyle = '#888'
  ctx.fillRect(lx, ly + 5, 10, 1)
  ctx.fillStyle = '#AAA'
  ctx.fillRect(lx + 3, ly + 1, 4, 4)
  ctx.fillStyle = '#666'
  ctx.fillRect(lx + 4, ly + 2, 2, 2)

  // Corner rivets
  const rivets = [[5, LID + 5], [w - 5, LID + 5], [5, h - 8], [w - 5, h - 8]]
  for (const [rx, ry] of rivets) {
    ctx.fillStyle = '#C0C0C0'
    ctx.beginPath(); ctx.arc(sx + rx, sy + ry, 2, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#888'
    ctx.beginPath(); ctx.arc(sx + rx + 0.5, sy + ry + 0.5, 2, 0, Math.PI * 2); ctx.fill()
  }
}

function drawWsToolboxLid(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // Lid surface
  ctx.fillStyle = '#AA1414'
  ctx.fillRect(sx, sy, w, h)

  // Top specular
  ctx.fillStyle = '#CC2020'
  ctx.fillRect(sx, sy, w, 2)
  ctx.fillStyle = '#D03030'
  ctx.fillRect(sx + 2, sy, w - 4, 1)

  // Front face
  ctx.fillStyle = '#881010'
  ctx.fillRect(sx, sy + h - 3, w, 3)

  // Right shadow
  ctx.fillStyle = '#991212'
  ctx.fillRect(sx + w - 3, sy, 3, h)

  // Chrome handle bar
  const hx = sx + Math.floor(w / 2) - 10
  ctx.fillStyle = '#C0C0C0'
  ctx.fillRect(hx, sy + 2, 20, 4)
  ctx.fillStyle = '#E0E0E0'
  ctx.fillRect(hx + 2, sy + 2, 16, 2)
  ctx.fillStyle = '#888'
  ctx.fillRect(hx, sy + 5, 20, 1)
  ctx.fillStyle = '#999'
  ctx.fillRect(hx - 2, sy + 2, 4, 4)
  ctx.fillRect(hx + 18, sy + 2, 4, 4)
}

function drawWsSticky(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h, color } = obj

  // Drop shadow
  ctx.globalAlpha = 0.22 * alpha
  ctx.fillStyle = '#000'
  ctx.fillRect(sx + 2, sy + 3, w, h)

  ctx.globalAlpha = alpha

  // Body
  ctx.fillStyle = color
  ctx.fillRect(sx, sy, w, h)

  // Glue strip highlight
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fillRect(sx, sy, w, 4)

  // Dog-ear fold shadow
  const fold = 5
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.beginPath()
  ctx.moveTo(sx + w - fold, sy + h)
  ctx.lineTo(sx + w, sy + h - fold)
  ctx.lineTo(sx + w, sy + h)
  ctx.closePath()
  ctx.fill()

  // Fold highlight
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.beginPath()
  ctx.moveTo(sx + w - fold, sy + h)
  ctx.lineTo(sx + w, sy + h - fold)
  ctx.lineTo(sx + w - fold, sy + h - fold)
  ctx.closePath()
  ctx.fill()

  // Handwritten text lines
  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  ctx.fillRect(sx + 3, sy + 7,  w - 7,  2)
  ctx.fillRect(sx + 3, sy + 12, w - 9,  2)
  ctx.fillRect(sx + 3, sy + 17, w - 11, 1)
}

const SHELF_VISUAL_H = 36  // board's visual height (obj.h is smaller, used only for Y-sort)

function drawWsHwShelf(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w } = obj
  const h = SHELF_VISUAL_H
  ctx.globalAlpha = alpha

  // Board surface — top face (walnut)
  const FACE_H = 7
  ctx.fillStyle = '#4A3820'
  ctx.fillRect(sx, sy, w, h - FACE_H)

  // Front face (dark thick edge)
  ctx.fillStyle = '#1E1008'
  ctx.fillRect(sx, sy + h - FACE_H, w, FACE_H)
  ctx.fillStyle = '#38260E'
  ctx.fillRect(sx, sy + h - FACE_H, w, 1)

  // Top specular highlight
  ctx.fillStyle = '#6A5030'
  ctx.fillRect(sx, sy, w, 2)
  ctx.fillStyle = '#7A6040'
  ctx.fillRect(sx + 3, sy, w - 6, 1)

  // Side edges
  ctx.fillStyle = '#2A1A0A'
  ctx.fillRect(sx, sy, 3, h)
  ctx.fillRect(sx + w - 3, sy, 3, h)

  // Grain lines
  ctx.globalAlpha = 0.13 * alpha
  ctx.fillStyle = '#2E2010'
  for (const gx of [30, 90, 160, 210]) {
    ctx.fillRect(sx + gx, sy + 2, 1, h - FACE_H - 2)
  }
  ctx.globalAlpha = alpha
}

function drawWsHwStrings(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w } = obj
  const h = SHELF_VISUAL_H
  ctx.globalAlpha = alpha

  const bracketH = (obj.y % ROOM_H) - 26
  const stringXs = [sx + 14, sx + w - 17]
  for (const bx of stringXs) {
    const strH = bracketH + h - 10
    // String shadow
    ctx.fillStyle = '#2E2C3E'
    ctx.fillRect(bx + 1, sy - bracketH, 4, strH)
    // String body
    ctx.fillStyle = '#6A6880'
    ctx.fillRect(bx, sy - bracketH, 3, strH)
    // String highlight (left edge)
    ctx.fillStyle = '#9A98B8'
    ctx.fillRect(bx, sy - bracketH, 1, strH)

    // Wall anchor bolt
    ctx.fillStyle = '#2C2A40'
    ctx.beginPath(); ctx.arc(bx + 1, sy - bracketH + 6, 3, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#5A5878'
    ctx.beginPath(); ctx.arc(bx + 1, sy - bracketH + 6, 2, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#8A88A8'
    ctx.beginPath(); ctx.arc(bx + 0.5, sy - bracketH + 5.5, 0.8, 0, Math.PI * 2); ctx.fill()

    // Knot at bottom of string
    const knotY = sy + h - 10
    ctx.fillStyle = '#555368'
    ctx.fillRect(bx - 2, knotY, 7, 5)
    ctx.fillStyle = '#7A7898'
    ctx.fillRect(bx - 2, knotY, 7, 1)
    ctx.fillStyle = '#3A3858'
    ctx.fillRect(bx - 2, knotY + 4, 7, 1)
  }
}

function drawWsRaspi(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // PCB body (green)
  ctx.fillStyle = '#1A4A2A'
  ctx.fillRect(sx, sy, w, h)
  ctx.fillStyle = '#2A6A3A'
  ctx.fillRect(sx, sy, w, 2)
  ctx.fillRect(sx, sy, 2, h)
  ctx.fillStyle = '#0E2818'
  ctx.fillRect(sx + w - 2, sy + 2, 2, h - 2)

  // GPIO pin row along top edge
  ctx.fillStyle = '#C8A060'
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(sx + 2 + i * 4, sy - 3, 2, 4)
  }

  // CPU chip
  ctx.fillStyle = '#0E2818'
  ctx.fillRect(sx + 4, sy + 5, 14, 14)
  ctx.fillStyle = '#1E3828'
  ctx.fillRect(sx + 6, sy + 7, 10, 10)

  // USB ports (right edge)
  ctx.fillStyle = '#888888'
  ctx.fillRect(sx + w - 3, sy + 4, 4, 10)
  ctx.fillStyle = '#BBBBBB'
  ctx.fillRect(sx + w - 2, sy + 5, 3, 4)
  ctx.fillRect(sx + w - 2, sy + 11, 3, 4)

  // Status LEDs
  ctx.fillStyle = '#00FF44'
  ctx.globalAlpha = 0.9 * alpha
  ctx.beginPath(); ctx.arc(sx + w - 5, sy + h - 5, 2, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#FF3300'
  ctx.beginPath(); ctx.arc(sx + w - 11, sy + h - 5, 2, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = alpha
}

function drawWsChip(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // IC body
  ctx.fillStyle = '#181818'
  ctx.fillRect(sx + 3, sy + 3, w - 6, h - 6)
  ctx.fillStyle = '#282828'
  ctx.fillRect(sx + 3, sy + 3, w - 6, 2)
  // Notch
  ctx.fillStyle = '#0A0A0A'
  ctx.beginPath()
  ctx.arc(sx + w / 2, sy + 3, 3, Math.PI, 0)
  ctx.fill()

  // Pins (left & right)
  ctx.fillStyle = '#A8A8A8'
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(sx,         sy + 5 + i * 4, 3, 2)
    ctx.fillRect(sx + w - 3, sy + 5 + i * 4, 3, 2)
  }
  ctx.fillStyle = '#686868'
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(sx + 2,     sy + 5 + i * 4, 1, 2)
    ctx.fillRect(sx + w - 2, sy + 5 + i * 4, 1, 2)
  }

  // Label area
  ctx.fillStyle = '#404040'
  ctx.fillRect(sx + 5, sy + 7, w - 10, 8)
  ctx.fillStyle = '#CCCCCC'
  ctx.fillRect(sx + 6, sy + 9,  w - 14, 1)
  ctx.fillRect(sx + 6, sy + 12, w - 18, 1)
}

function drawWsGameboy(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // Body
  ctx.fillStyle = '#8888A0'
  ctx.fillRect(sx, sy, w, h)
  ctx.fillStyle = '#AAAAC0'
  ctx.fillRect(sx, sy, w, 2)
  ctx.fillRect(sx, sy, 2, h)
  ctx.fillStyle = '#555570'
  ctx.fillRect(sx + w - 2, sy + 2, 2, h - 2)
  ctx.fillRect(sx + 2, sy + h - 2, w - 2, 2)

  // Screen bezel + screen
  const screenH = Math.floor(h * 0.44)
  ctx.fillStyle = '#1A1A28'
  ctx.fillRect(sx + 2, sy + 3, w - 4, screenH + 2)
  ctx.fillStyle = '#2A3A20'
  ctx.fillRect(sx + 4, sy + 5, w - 8, screenH - 2)

  // D-pad
  const dpx = sx + 3, dpy = sy + Math.floor(h * 0.56)
  ctx.fillStyle = '#2A2A3A'
  ctx.fillRect(dpx + 3, dpy, 4, 9)
  ctx.fillRect(dpx, dpy + 3, 10, 3)

  // A/B buttons
  ctx.fillStyle = '#AA2020'
  ctx.beginPath(); ctx.arc(sx + w - 5, sy + Math.floor(h * 0.62), 2.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#2020AA'
  ctx.beginPath(); ctx.arc(sx + w - 10, sy + Math.floor(h * 0.70), 2.5, 0, Math.PI * 2); ctx.fill()

  // Speaker dots
  ctx.fillStyle = '#3A3A52'
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(sx + w - 4, sy + h - 10 + i * 3, 1, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawWsHwLed(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w } = obj
  const t = Date.now() / 2500
  const pulse = 0.82 + Math.sin(t) * 0.06

  // Elongated amber glow — ellipse flattened downward from shelf underside
  ctx.save()
  const gcx = sx + w / 2
  const gcy = sy
  ctx.translate(gcx, gcy)
  ctx.scale(1.0, 0.35)
  ctx.translate(-gcx, -gcy)
  const grad = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, w * 0.60)
  grad.addColorStop(0,    `rgba(255, 195,  90, ${0.52 * pulse * alpha})`)
  grad.addColorStop(0.25, `rgba(255, 175,  70, ${0.28 * pulse * alpha})`)
  grad.addColorStop(0.55, `rgba(255, 155,  50, ${0.11 * pulse * alpha})`)
  grad.addColorStop(1,    `rgba(255, 135,  30, 0)`)
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(gcx, gcy, w * 0.60, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Thin warm LED strip on shelf underside — fades at edges
  const ledGrad = ctx.createLinearGradient(sx, 0, sx + w, 0)
  ledGrad.addColorStop(0,    'rgba(255, 200,  80, 0)')
  ledGrad.addColorStop(0.08, 'rgba(255, 210, 100, 0.85)')
  ledGrad.addColorStop(0.50, 'rgba(255, 218, 112, 1.0)')
  ledGrad.addColorStop(0.92, 'rgba(255, 210, 100, 0.85)')
  ledGrad.addColorStop(1,    'rgba(255, 200,  80, 0)')
  ctx.globalAlpha = 0.65 * alpha
  ctx.fillStyle = ledGrad
  ctx.fillRect(sx, sy, w, 2)
  ctx.globalAlpha = alpha
}

function drawWsCorkboard(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj
  ctx.globalAlpha = alpha

  // Wood frame
  ctx.fillStyle = '#3A2810'
  ctx.fillRect(sx, sy, w, h)
  // Cork surface
  ctx.fillStyle = '#7A6040'
  ctx.fillRect(sx + 4, sy + 4, w - 8, h - 8)

  // Cork grain dots
  ctx.fillStyle = '#6A5030'
  const grainDots = [
    [12,8],[35,15],[55,6],[80,18],[100,9],[120,14],[145,7],[165,16],[190,10],[210,20],[235,8],
    [15,35],[42,28],[68,40],[92,32],[118,38],[142,25],[168,42],[198,30],[220,38],[245,22],
    [20,55],[50,62],[75,48],[105,60],[130,52],[155,65],[180,58],[205,48],[230,62],
    [10,72],[38,68],[65,75],[90,70],[115,78],[140,68],[170,74],[195,82],[218,70],[240,78],
  ]
  for (const [dx, dy] of grainDots) {
    if (dx < w - 10 && dy < h - 10) ctx.fillRect(sx + 6 + dx, sy + 6 + dy, 1, 1)
  }

  // Push pins at all four corners
  for (const [px, py] of [
    [sx + 14, sy + 14], [sx + w - 14, sy + 14],
    [sx + 14, sy + h - 14], [sx + w - 14, sy + h - 14],
  ]) {
    ctx.fillStyle = '#FF5522'
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#CC3300'
    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#FF8866'
    ctx.beginPath(); ctx.arc(px - 1, py - 1, 1.5, 0, Math.PI * 2); ctx.fill()
  }

  // Circuit diagram sketch (left area)
  const nodes = [
    [sx + 28, sy + 28], [sx + 58, sy + 22], [sx + 82, sy + 44],
    [sx + 60, sy + 60], [sx + 28, sy + 58], [sx + 44, sy + 40],
  ]
  ctx.strokeStyle = '#9A8060'
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.55 * alpha
  ctx.beginPath()
  for (const [a, b] of [[0,1],[1,2],[2,3],[3,4],[4,0],[0,5],[5,2]]) {
    ctx.moveTo(nodes[a][0], nodes[a][1])
    ctx.lineTo(nodes[b][0], nodes[b][1])
  }
  ctx.stroke()
  ctx.globalAlpha = 0.75 * alpha
  ctx.fillStyle = '#BAA070'
  for (const [nx, ny] of nodes) {
    ctx.beginPath(); ctx.arc(nx, ny, 2.5, 0, Math.PI * 2); ctx.fill()
  }

  // Pinned sticky notes (slightly rotated)
  ctx.globalAlpha = alpha
  const stickies = [
    { x: sx + 112, y: sy + 10, w: 44, h: 34, color: '#FFE066', rot: -0.05 },
    { x: sx + 170, y: sy + 16, w: 40, h: 30, color: '#FFC0CB', rot:  0.04 },
    { x: sx + 220, y: sy +  8, w: 42, h: 32, color: '#90EE90', rot: -0.03 },
  ]
  for (const s of stickies) {
    ctx.save()
    ctx.translate(s.x + s.w / 2, s.y + s.h / 2)
    ctx.rotate(s.rot)
    ctx.globalAlpha = 0.18 * alpha
    ctx.fillStyle = '#000'
    ctx.fillRect(-s.w / 2 + 2, -s.h / 2 + 3, s.w, s.h)
    ctx.globalAlpha = alpha
    ctx.fillStyle = s.color
    ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h)
    ctx.globalAlpha = 0.12 * alpha
    ctx.fillStyle = '#000'
    ctx.fillRect(-s.w / 2, -s.h / 2, s.w, 6)
    ctx.globalAlpha = alpha
    ctx.fillStyle = '#FF3333'
    ctx.beginPath(); ctx.arc(0, -s.h / 2 + 5, 2.5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#FF8888'
    ctx.beginPath(); ctx.arc(-0.5, -s.h / 2 + 4, 1, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = darken(s.color, 0.62)
    ctx.fillRect(-s.w / 2 + 4, -s.h / 2 + 11, s.w - 8,  2)
    ctx.fillRect(-s.w / 2 + 4, -s.h / 2 + 16, s.w - 12, 2)
    ctx.fillRect(-s.w / 2 + 4, -s.h / 2 + 21, s.w - 10, 2)
    ctx.restore()
  }

  // Label strips (bottom area)
  ctx.globalAlpha = 0.82 * alpha
  ctx.fillStyle = '#EEE8E0'
  ctx.fillRect(sx + 112, sy + h - 26, 62, 16)
  ctx.fillRect(sx + 188, sy + h - 22, 56, 14)
  ctx.globalAlpha = 0.50 * alpha
  ctx.fillStyle = '#887870'
  for (let i = 0; i < 4; i++) ctx.fillRect(sx + 115, sy + h - 23 + i * 3, 56, 1)
  for (let i = 0; i < 3; i++) ctx.fillRect(sx + 191, sy + h - 19 + i * 3, 50, 1)
  ctx.globalAlpha = alpha
}

function drawWsMat(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const { w, h } = obj

  // Drop shadow
  ctx.globalAlpha = 0.15 * alpha
  ctx.fillStyle = '#000'
  ctx.fillRect(sx + 3, sy + 4, w, h)

  ctx.globalAlpha = alpha

  // Base rubber
  ctx.fillStyle = '#2A2A2A'
  ctx.fillRect(sx, sy, w, h)

  // Beveled edges
  ctx.fillStyle = '#3A3A3A'
  ctx.fillRect(sx, sy, w, 3)
  ctx.fillRect(sx, sy, 3, h)
  ctx.fillStyle = '#1A1A1A'
  ctx.fillRect(sx, sy + h - 3, w, 3)
  ctx.fillRect(sx + w - 3, sy, 3, h)

  // Anti-fatigue dot grid
  ctx.fillStyle = '#333'
  const cols = 8, rows = 4
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const bx = sx + 5 + col * Math.floor((w - 10) / cols)
      const by = sy + 5 + row * Math.floor((h - 10) / rows)
      ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2); ctx.fill()
    }
  }
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
  if (obj.id === 'lr-stand-1' || obj.id === 'lr-stand-2') {
    const sx = Math.floor(obj.x - camX)
    const sy = Math.floor(obj.y - camY)
    ctx.globalAlpha = alpha
    ctx.fillStyle = obj.color
    ctx.fillRect(sx, sy, obj.w, obj.displayH ?? obj.h)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'lr-monitor-1' || obj.id === 'lr-monitor-2') {
    drawLrMonitorFrame(ctx, obj, camX, camY, alpha)
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
  if (obj.id === 'lr-succ-pot') {
    drawLrSuccPot(ctx, obj, camX, camY, alpha)
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
  if (obj.id === 'bench') {
    drawWsBench(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'monitor') {
    drawWsMonitor(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'screen') {
    drawWsScreen(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'keyboard') {
    drawWsKeyboard(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'toolbox') {
    drawWsToolbox(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'toolbox-l') {
    drawWsToolboxLid(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'sticky1' || obj.id === 'sticky2' || obj.id === 'sticky3') {
    drawWsSticky(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'mat') {
    drawWsMat(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'ws-hw-shelf') {
    drawWsHwShelf(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'ws-raspi') {
    drawWsRaspi(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'ws-chip') {
    drawWsChip(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'ws-gameboy') {
    drawWsGameboy(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'ws-hw-led') {
    drawWsHwLed(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'ws-corkboard') {
    drawWsCorkboard(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id.startsWith('gl-spot-col-')) {
    drawGlSpotlight(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id.startsWith('gl-frame-') && !obj.id.includes('-mat-') && !obj.id.includes('-img-')) {
    drawGlFrame(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id.startsWith('gl-frame-mat-')) {
    ctx.globalAlpha = prevAlpha
    return  // mat drawn inside drawGlFrame
  }
  if (obj.id.startsWith('gl-frame-img-')) {
    ctx.globalAlpha = prevAlpha
    return  // image drawn inside drawGlFrame
  }
  if (obj.id.startsWith('gl-placard-')) {
    drawGlPlacard(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }
  if (obj.id === 'gl-bench-1' || obj.id === 'gl-bench-2') {
    drawGlBench(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha
    return
  }

  if (obj.id === 'ct-counter-wall' || obj.id === 'ct-counter-block' || obj.id === 'ct-employee-floor') {
    ctx.globalAlpha = prevAlpha; return  // invisible collision / drawn by room background
  }
  if (obj.id === 'ct-window') {
    drawCtWindow(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha; return
  }
  if (obj.id === 'ct-bulletin') {
    drawCtBulletin(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha; return
  }
  if (obj.id === 'ct-counter-top') {
    drawCtCounterTop(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha; return
  }
  if (obj.id === 'ct-counter-face') {
    drawCtCounterFace(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha; return
  }
  if (obj.id === 'ct-glass-panel') {
    drawCtGlassPanel(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha; return
  }
  if (obj.id === 'ct-lamp-halo') {
    drawCtLampHalo(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha; return
  }
  if (obj.id === 'ct-lamp') {
    drawCtLamp(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha; return
  }
  if (obj.id === 'ct-stamp') {
    drawCtStamp(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha; return
  }
  if (obj.id === 'ct-tray') {
    drawCtTray(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha; return
  }
  if (obj.id === 'ct-bell') {
    drawCtBell(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha; return
  }
  if (obj.id === 'ct-postbox') {
    drawCtPostbox(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha; return
  }
  if (obj.id === 'ct-newspaper-1' || obj.id === 'ct-newspaper-2' || obj.id === 'ct-newspaper-3') {
    drawCtNewspaper(ctx, obj, camX, camY, alpha)
    ctx.globalAlpha = prevAlpha; return
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
    if (room.id === 1) {
      drawWsRoom(ctx, room, camX, camY)
    } else if (room.id === 3) {
      drawCtRoom(ctx, room, camX, camY)
    } else {
      drawRoom(ctx, room, camX, camY)
    }
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
  const topObjects   = allObjects.filter(o => o.alwaysOnTop)
  const sceneObjects = allObjects.filter(o => !o.floor && !o.alwaysOnTop)

  // Insert a proxy for shelf strings so they sort between items and player
  const shelfObj = allObjects.find(o => o.id === 'ws-hw-shelf')
  if (shelfObj) {
    sceneObjects.push({
      _isShelfStrings: true, _shelfRef: shelfObj,
      x: shelfObj.x, w: shelfObj.w,
      y: shelfObj.y, h: SHELF_VISUAL_H - 10,  // sort key: y+h ≈ 104
    })
  }

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
    const noFade = obj.id === 'lr-bookshelf' || obj.id === 'lr-monitor-1' || obj.id === 'lr-monitor-2'
    const targetAlpha = objOverlapsPlayer && !noFade ? 0.4 : 1.0
    obj._alpha += (targetAlpha - obj._alpha) * 0.15

    // Smooth monitor power-on when player enters interact zone
    if (obj.id === 'monitor-screen-1' || obj.id === 'monitor-screen-2') {
      const inZone = monitorZone &&
        player.x >= monitorZone.x && player.x <= monitorZone.x + monitorZone.w &&
        player.y >= monitorZone.y && player.y <= monitorZone.y + monitorZone.h
      obj._screenBrightness = obj._screenBrightness ?? 0
      obj._screenBrightness += ((inZone ? 1 : 0) - obj._screenBrightness) * 0.05
      // Sync brightness to the frame so its glow matches
      const frameId = obj.id === 'monitor-screen-1' ? 'lr-monitor-1' : 'lr-monitor-2'
      const frameObj = allObjects.find(o => o.id === frameId)
      if (frameObj) frameObj._screenBrightness = obj._screenBrightness
    }

    if (obj._isShelfStrings) {
      drawWsHwStrings(ctx, obj._shelfRef, camX, camY, obj._shelfRef._alpha ?? 1)
      continue
    }

    drawObject(ctx, obj, camX, camY, obj._alpha)
  }

  if (!playerDrawn) drawHan(ctx, player, camX, camY)

  // Always-on-top objects — sorted by topZ (priority tier) then y+h
  topObjects.sort((a, b) => ((a.topZ ?? 0) - (b.topZ ?? 0)) || ((a.y + a.h) - (b.y + b.h)))
  for (const obj of topObjects) {
    drawObject(ctx, obj, camX, camY, obj._alpha ?? 1)
  }
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
