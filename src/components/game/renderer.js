import { drawHan, SPRITE_PX_H } from './sprites'
import { ROOM_W, ROOM_H } from './rooms'

const WALL_TOP    = 120
const WALL_BOTTOM = 580
const WALL_LEFT   = 20
const WALL_RIGHT  = 620
const DOOR_SIZE   = 80
const DOOR_MID_X  = 320   // ROOM_W / 2
const DOOR_MID_Y  = 470   // Math.floor(WALL_TOP + (WALL_BOTTOM - WALL_TOP) / 2)

function drawRoom(ctx, room, camX, camY) {
  const ox = room.col * ROOM_W
  const oy = room.row * ROOM_H
  const sx = Math.floor(ox - camX)
  const sy = Math.floor(oy - camY)

  // Floor
  ctx.fillStyle = room.floorColor
  ctx.fillRect(sx + WALL_LEFT, sy + WALL_TOP, ROOM_W - WALL_LEFT - (ROOM_W - WALL_RIGHT), WALL_BOTTOM - WALL_TOP)

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

function drawObject(ctx, obj, camX, camY, alpha = 1) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)
  const prevAlpha = ctx.globalAlpha
  ctx.globalAlpha = alpha

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
