export const SPRITE_SCALE = 4
export const SPRITE_W     = 10
export const SPRITE_H     = 14
export const SPRITE_PX_W  = SPRITE_W * SPRITE_SCALE   // 40
export const SPRITE_PX_H  = SPRITE_H * SPRITE_SCALE   // 56

const PALETTE = {
  'H': '#F4C4A1',
  'A': '#2C1810',
  'E': '#1A0A10',
  'B': '#4A90D9',
  'D': '#2E6DA4',
  'N': '#2C3E50',
  'S': '#1A1A1A',
  'W': '#FFFFFF',
  'R': '#E8A090',
}

const DOWN_1 = [
  '__AAAAAA__',
  '_AHHHHHHA_',
  '_AHEHHEHA_',
  '_AHHRRHHA_',
  '__HHHHHH__',
  '_BBBBBBBB_',
  '_BBBBBBBB_',
  '_BDBBBDBB_',
  '_BBBBBBBB_',
  '__NN__NN__',
  '__NN__NN__',
  '__NN__NN__',
  '__NN__NN__',
  '_SSS__SSS_',
]

const DOWN_2 = [
  '__AAAAAA__',
  '_AHHHHHHA_',
  '_AHEHHEHA_',
  '_AHHRRHHA_',
  '__HHHHHH__',
  '_BBBBBBBB_',
  '_BBBBBBBB_',
  '_BDBBBDBB_',
  '_BBBBBBBB_',
  '___N___N__',
  '___N___N__',
  '__NN___NN_',
  '__NN___NN_',
  '__SS___SS_',
]

const UP_1 = [
  '__AAAAAA__',
  '_AAAAAAA__',
  '_AAAAAAA__',
  '_AHHHHHA__',
  '__HHHHHH__',
  '_BBBBBBBB_',
  '_BBBBBBBB_',
  '_BDBBBDBB_',
  '_BBBBBBBB_',
  '__NN__NN__',
  '__NN__NN__',
  '__NN__NN__',
  '__NN__NN__',
  '_SSS__SSS_',
]

const UP_2 = [
  '__AAAAAA__',
  '_AAAAAAA__',
  '_AAAAAAA__',
  '_AHHHHHA__',
  '__HHHHHH__',
  '_BBBBBBBB_',
  '_BBBBBBBB_',
  '_BDBBBDBB_',
  '_BBBBBBBB_',
  '___N___N__',
  '___N___N__',
  '__NN___NN_',
  '__NN___NN_',
  '__SS___SS_',
]

const LEFT_1 = [
  '___AAAA___',
  '__AHHHHHA_',
  '_AHEHHHHA_',
  '_AHHRRHHA_',
  '__HHHHHH__',
  '_BBBBBBBB_',
  '_BBBBBBBB_',
  'DBBBBBBBB_',
  '_BBBBBBBB_',
  '__NNNN____',
  '__NNNN____',
  '__NNNN____',
  '__NNNN____',
  '_SSSSS____',
]

const LEFT_2 = [
  '___AAAA___',
  '__AHHHHHA_',
  '_AHEHHHHA_',
  '_AHHRRHHA_',
  '__HHHHHH__',
  '_BBBBBBBB_',
  '_BBBBBBBB_',
  'DBBBBBBBB_',
  '_BBBBBBBB_',
  '____NNN___',
  '__NNN_____',
  '__NNN_____',
  '__NNN_____',
  '_SSS__SS__',
]

const RIGHT_1 = [
  '___AAAA___',
  '_AHHHHHA__',
  '_AHHHHHEHA',
  '_AHHRRHA__',
  '__HHHHHH__',
  '_BBBBBBBB_',
  '_BBBBBBBB_',
  '_BBBBBBBBD',
  '_BBBBBBBB_',
  '____NNNN__',
  '____NNNN__',
  '____NNNN__',
  '____NNNN__',
  '____SSSSS_',
]

const RIGHT_2 = [
  '___AAAA___',
  '_AHHHHHA__',
  '_AHHHHHEHA',
  '_AHHRRHA__',
  '__HHHHHH__',
  '_BBBBBBBB_',
  '_BBBBBBBB_',
  '_BBBBBBBBD',
  '_BBBBBBBB_',
  '___NNN____',
  '_____NNN__',
  '_____NNN__',
  '_____NNN__',
  '__SS__SSS_',
]

export function drawSprite(ctx, grid, worldX, worldY, camX, camY, alpha = 1) {
  const sx = Math.floor(worldX - camX)
  const sy = Math.floor(worldY - camY)
  const prevAlpha = ctx.globalAlpha
  ctx.globalAlpha = alpha

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const ch = grid[row][col]
      if (ch === '_' || ch === ' ') continue
      const color = PALETTE[ch] ?? PALETTE['A']
      ctx.fillStyle = color
      ctx.fillRect(
        sx + col * SPRITE_SCALE,
        sy + row * SPRITE_SCALE,
        SPRITE_SCALE,
        SPRITE_SCALE
      )
    }
  }

  ctx.globalAlpha = prevAlpha
}

export function getHanSprite(dir, frame) {
  const f = frame % 2
  switch (dir) {
    case 'up':    return f === 0 ? UP_1    : UP_2
    case 'left':  return f === 0 ? LEFT_1  : LEFT_2
    case 'right': return f === 0 ? RIGHT_1 : RIGHT_2
    default:      return f === 0 ? DOWN_1  : DOWN_2
  }
}

export function drawHan(ctx, player, camX, camY, alpha = 1) {
  const { x, y, dir, walkFrame, isMoving, nearInteract } = player
  const spritX = x - SPRITE_PX_W / 2
  const spritY = y - SPRITE_PX_H
  const grid = getHanSprite(dir, isMoving ? walkFrame : 0)
  drawSprite(ctx, grid, spritX, spritY, camX, camY, alpha)

  if (nearInteract) {
    ctx.globalAlpha = alpha
    ctx.fillStyle = '#FFE600'
    ctx.font = `bold ${SPRITE_SCALE * 3}px monospace`
    ctx.textAlign = 'center'
    ctx.fillText('!', Math.floor(x - camX), Math.floor(y - SPRITE_PX_H - 4 - camY))
    ctx.globalAlpha = 1
  }
}
