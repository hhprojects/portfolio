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
  const radii  = [90, 65, 40]
  const alphas = [0.02, 0.04, 0.06]
  for (let i = 0; i < radii.length; i++) {
    ctx.beginPath()
    ctx.arc(cx, cy, radii[i], 0, Math.PI * 2)
    ctx.fillStyle = '#FFD580'
    ctx.globalAlpha = alphas[i] * alpha
    ctx.fill()
  }
}

function drawMonitorScreen(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#0A1628'
  ctx.fillRect(sx, sy, obj.w, obj.h)
  ctx.fillStyle = '#1E3A5F'
  ctx.fillRect(sx + 4, sy + 4, Math.floor(obj.w * 0.65), Math.floor(obj.h * 0.55))
  const glows = [{ pad: 1, a: 0.08 }, { pad: 2, a: 0.05 }, { pad: 3, a: 0.02 }]
  for (const g of glows) {
    ctx.globalAlpha = g.a * alpha
    ctx.fillStyle = '#4A8FE0'
    ctx.fillRect(sx - g.pad, sy - g.pad, obj.w + g.pad * 2, obj.h + g.pad * 2)
  }
}

function drawMonstera(ctx, obj, camX, camY, alpha) {
  const cx = Math.floor(obj.x + obj.w / 2 - camX)
  const cy = Math.floor(obj.y + obj.h     - camY)
  const leaves = [
    { angle: -0.9, len: 95,  width: 30, color: '#1E4D2B' },
    { angle: -0.4, len: 115, width: 34, color: '#2D7A3F' },
    { angle:  0.0, len: 105, width: 32, color: '#1E4D2B' },
    { angle:  0.4, len: 100, width: 28, color: '#2D7A3F' },
    { angle:  0.9, len:  85, width: 24, color: '#1E4D2B' },
  ]
  ctx.globalAlpha = alpha
  for (const leaf of leaves) {
    const rad  = leaf.angle - Math.PI / 2
    const tipX = cx + Math.cos(rad) * leaf.len
    const tipY = cy + Math.sin(rad) * leaf.len
    const midX = cx + Math.cos(rad) * leaf.len * 0.5
    const midY = cy + Math.sin(rad) * leaf.len * 0.5
    const px   = Math.cos(leaf.angle) * leaf.width / 2
    const py   = Math.sin(leaf.angle) * leaf.width / 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.quadraticCurveTo(midX - px, midY - py, tipX, tipY)
    ctx.quadraticCurveTo(midX + px, midY + py, cx, cy)
    ctx.fillStyle = leaf.color
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(tipX, tipY)
    ctx.strokeStyle = '#3A9455'
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.4 * alpha
    ctx.stroke()
    ctx.globalAlpha = alpha
  }
}

function drawMugSteam(ctx, obj, camX, camY, alpha) {
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
}

function drawLrBookshelf(ctx, obj, camX, camY, alpha) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  // Shelf back panel
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#F8F6F1'
  ctx.fillRect(sx, sy, obj.w, obj.h)
  // Two shelf dividers
  ctx.fillStyle = '#E0DDD6'
  ctx.fillRect(sx, sy, obj.w, 3)
  ctx.fillRect(sx, sy + Math.floor(obj.h / 2), obj.w, 3)
  // A few sparse books (minimalist — only 3, lots of negative space)
  const books = [
    { x: 6,  h: 55, color: '#C4673A' },
    { x: 18, h: 45, color: '#2C2C2C' },
    { x: 30, h: 50, color: '#6B8F71' },
  ]
  for (const b of books) {
    ctx.fillStyle = b.color
    ctx.fillRect(sx + b.x, sy + 8, 9, b.h)
    // Book top highlight
    ctx.fillStyle = lighten(b.color, 1.25)
    ctx.fillRect(sx + b.x, sy + 8, 9, 3)
  }
}

function drawObject(ctx, obj, camX, camY, alpha = 1) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const prevAlpha = ctx.globalAlpha
  ctx.globalAlpha = alpha

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
  if (obj.id === 'mug-steam') {
    drawMugSteam(ctx, obj, camX, camY, alpha)
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

  allObjects.sort((a, b) => (a.y + a.h) - (b.y + b.h))

  let playerDrawn = false
  for (let i = 0; i < allObjects.length; i++) {
    const obj = allObjects[i]
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
    const targetAlpha = objOverlapsPlayer ? 0.4 : 1.0
    obj._alpha += (targetAlpha - obj._alpha) * 0.15

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
