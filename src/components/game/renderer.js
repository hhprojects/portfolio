import { drawHan, SPRITE_PX_H } from './sprites'

const NORTH_WALL_H = 140
const SOUTH_WALL_Y = 554

function drawRoom(ctx, room, camX, camY, cw, ch) {
  ctx.fillStyle = room.floorColor
  ctx.fillRect(Math.floor(room.id * 800 - camX), Math.floor(NORTH_WALL_H - camY), 800, SOUTH_WALL_Y - NORTH_WALL_H)

  ctx.fillStyle = room.wallColor
  ctx.fillRect(Math.floor(room.id * 800 - camX), Math.floor(-camY), 800, NORTH_WALL_H)

  ctx.fillStyle = darken(room.wallColor, 0.6)
  ctx.fillRect(Math.floor(room.id * 800 - camX), Math.floor(SOUTH_WALL_Y - camY), 800, 600 - SOUTH_WALL_Y)

  if (room.id < 3) {
    const doorX = Math.floor((room.id + 1) * 800 - camX)
    ctx.fillStyle = room.floorColor
    ctx.fillRect(doorX - 20, Math.floor(-camY), 20, NORTH_WALL_H)
  }

  ctx.fillStyle = darken(room.wallColor, 0.8)
  ctx.fillRect(Math.floor(room.id * 800 - camX), Math.floor(NORTH_WALL_H - 4 - camY), 800, 4)
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
  const visLeft  = camX
  const visRight = camX + cw

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, cw, ch)

  for (const room of rooms) {
    const roomLeft  = room.id * 800
    const roomRight = roomLeft + 800
    if (roomRight < visLeft || roomLeft > visRight) continue
    drawRoom(ctx, room, camX, camY, cw, ch)
  }

  const allObjects = []
  for (const room of rooms) {
    const roomLeft  = room.id * 800
    const roomRight = roomLeft + 800
    if (roomRight < visLeft || roomLeft > visRight) continue
    for (const obj of room.objects) {
      if (obj.x + obj.w > visLeft && obj.x < visRight) allObjects.push(obj)
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

    // Smooth alpha fade using stored _alpha
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
