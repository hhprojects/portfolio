const PLAYER_SPEED    = 150
const PLAYER_HW       = 10
const PLAYER_HH       = 6
const WALK_ANIM_SPEED = 8

export function createPlayerState() {
  return {
    x:            80,
    y:            380,
    dir:          'down',
    isMoving:     false,
    walkFrame:    0,
    walkTimer:    0,
    nearInteract: false,
  }
}

export function updatePlayer(player, keys, rooms, dt, worldW, worldH) {
  const up    = keys['ArrowUp']    || keys['w'] || keys['W']
  const down  = keys['ArrowDown']  || keys['s'] || keys['S']
  const left  = keys['ArrowLeft']  || keys['a'] || keys['A']
  const right = keys['ArrowRight'] || keys['d'] || keys['D']

  let dx = 0, dy = 0
  if (up)    dy -= 1
  if (down)  dy += 1
  if (left)  dx -= 1
  if (right) dx += 1

  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.SQRT2
    dx *= inv
    dy *= inv
  }

  const isMoving = dx !== 0 || dy !== 0
  player.isMoving = isMoving

  if (dy < 0) player.dir = 'up'
  else if (dy > 0) player.dir = 'down'
  else if (dx < 0) player.dir = 'left'
  else if (dx > 0) player.dir = 'right'

  if (isMoving) {
    player.walkTimer += dt * WALK_ANIM_SPEED
    if (player.walkTimer >= 1) {
      player.walkTimer -= 1
      player.walkFrame = 1 - player.walkFrame
    }
  } else {
    player.walkFrame = 0
    player.walkTimer = 0
  }

  if (!isMoving) return

  const speed = PLAYER_SPEED * dt
  const walls = rooms.flatMap(r => r.walls)

  const newX = player.x + dx * speed
  const hitboxX = { x: newX - PLAYER_HW, y: player.y - PLAYER_HH, w: PLAYER_HW * 2, h: PLAYER_HH * 2 }
  if (!collidesWithAny(hitboxX, walls)) player.x = newX

  const newY = player.y + dy * speed
  const hitboxY = { x: player.x - PLAYER_HW, y: newY - PLAYER_HH, w: PLAYER_HW * 2, h: PLAYER_HH * 2 }
  if (!collidesWithAny(hitboxY, walls)) player.y = newY

  player.x = Math.max(PLAYER_HW, Math.min(worldW - PLAYER_HW, player.x))
  player.y = Math.max(PLAYER_HH + 140, Math.min(worldH - PLAYER_HH - 46, player.y))
}

function aabbOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function collidesWithAny(hitbox, walls) {
  for (const wall of walls) {
    if (aabbOverlap(hitbox, wall)) return true
  }
  return false
}
