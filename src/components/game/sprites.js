export const SPRITE_SCALE = 2
export const SPRITE_W     = 12
export const SPRITE_H     = 20
export const SPRITE_PX_W  = SPRITE_W * SPRITE_SCALE   // 24
export const SPRITE_PX_H  = SPRITE_H * SPRITE_SCALE   // 40

const PALETTE = {
  'H': '#F9D4A8',  // skin
  'I': '#FFE8C0',  // skin highlight
  'A': '#3D1F0F',  // hair dark
  'L': '#7A5230',  // hair mid
  'E': '#1A0A10',  // eyes
  'W': '#FFFFFF',  // eye highlight
  'R': '#F0A0A0',  // blush
  'B': '#4FAAFF',  // shirt bright
  'C': '#2A6FCC',  // shirt shadow
  'D': '#1A4A8A',  // shirt dark / arm
  'N': '#2C3E50',  // pants
  'S': '#1A1A1A',  // shoes
}

const DOWN_1 = [
  '______A_____',  // ahoge
  '___AAAAAAA__',  // hair top
  '__AHHHHHHA__',  // hair sides
  '__AEWHEWHA__',  // eyes top (E=pupil, W=highlight)
  '__AEEHEEHA__',  // eyes bottom
  '__ARHHHHRA__',  // blush
  '___HEHHEH___',  // chin + smile corners
  '___CBBBBC___',  // shoulder (narrow = rounded)
  '__CBBBBBBC__',  // shirt body
  '__CBBBBBBC__',
  '__CBDBDBBC__',  // shirt detail
  '__CBBBBBBC__',
  '__CBBBBBBC__',
  '___NNNNNN___',  // waist
  '___NN__NN___',  // legs together
  '___NN__NN___',
  '___NN__NN___',
  '___NN__NN___',
  '___SS__SS___',  // shoes
  '__SSS__SSS__',
]

const DOWN_2 = [
  '______A_____',
  '___AAAAAAA__',
  '__AHHHHHHA__',
  '__AEWHEWHA__',
  '__AEEHEEHA__',
  '__ARHHHHRA__',
  '___HEHHEH___',
  '___CBBBBC___',
  '__CBBBBBBC__',
  '__CBBBBBBC__',
  '__CBDBDBBC__',
  '__CBBBBBBC__',
  '__CBBBBBBC__',
  '___NNNNNN___',
  '__NN____NN__',  // legs spread
  '__NN____NN__',
  '__NN____NN__',
  '__NN____NN__',
  '__SS____SS__',
  '_SSS____SSS_',
]

const UP_1 = [
  '______A_____',  // ahoge (visible from back)
  '___AAAAAAA__',  // hair top
  '__AAAAAAAA__',  // back of head
  '__AAAAAAAA__',
  '__AAAAAAAA__',
  '__AAAAAAAA__',
  '____HHHH____',  // neck
  '___CBBBBC___',  // shirt shoulder
  '__CBBBBBBC__',
  '__CBBBBBBC__',
  '__CBDBDBBC__',
  '__CBBBBBBC__',
  '__CBBBBBBC__',
  '___NNNNNN___',  // waist
  '___NN__NN___',  // legs
  '___NN__NN___',
  '___NN__NN___',
  '___NN__NN___',
  '___SS__SS___',  // shoes
  '__SSS__SSS__',
]

const UP_2 = [
  '______A_____',
  '___AAAAAAA__',
  '__AAAAAAAA__',
  '__AAAAAAAA__',
  '__AAAAAAAA__',
  '__AAAAAAAA__',
  '____HHHH____',
  '___CBBBBC___',
  '__CBBBBBBC__',
  '__CBBBBBBC__',
  '__CBDBDBBC__',
  '__CBBBBBBC__',
  '__CBBBBBBC__',
  '___NNNNNN___',
  '__NN____NN__',  // legs spread
  '__NN____NN__',
  '__NN____NN__',
  '__NN____NN__',
  '__SS____SS__',
  '_SSS____SSS_',
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
