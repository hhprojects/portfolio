export const ROOM_W  = 640
export const ROOM_H  = 640
export const WORLD_W = ROOM_W * 2
export const WORLD_H = ROOM_H * 2

const WALL_TOP    = 120
const WALL_BOTTOM = 580
const WALL_LEFT   = 20
const WALL_RIGHT  = 620
const DOOR_SIZE   = 80
const DOOR_MID_X  = ROOM_W / 2
const DOOR_MID_Y  = Math.floor(WALL_TOP + (WALL_BOTTOM - WALL_TOP) / 2)

// doors: { top, bottom, left, right } — true means a door gap exists on that side
function roomWalls(col, row, doors = {}) {
  const ox = col * ROOM_W
  const oy = row * ROOM_H
  const walls = []

  // North wall (top band)
  if (doors.top) {
    walls.push({ x: ox, y: oy, w: DOOR_MID_X - DOOR_SIZE / 2, h: WALL_TOP })
    walls.push({ x: ox + DOOR_MID_X + DOOR_SIZE / 2, y: oy, w: ROOM_W - DOOR_MID_X - DOOR_SIZE / 2, h: WALL_TOP })
  } else {
    walls.push({ x: ox, y: oy, w: ROOM_W, h: WALL_TOP })
  }

  // South wall (bottom band)
  if (doors.bottom) {
    walls.push({ x: ox, y: oy + WALL_BOTTOM, w: DOOR_MID_X - DOOR_SIZE / 2, h: ROOM_H - WALL_BOTTOM })
    walls.push({ x: ox + DOOR_MID_X + DOOR_SIZE / 2, y: oy + WALL_BOTTOM, w: ROOM_W - DOOR_MID_X - DOOR_SIZE / 2, h: ROOM_H - WALL_BOTTOM })
  } else {
    walls.push({ x: ox, y: oy + WALL_BOTTOM, w: ROOM_W, h: ROOM_H - WALL_BOTTOM })
  }

  // West wall (left strip)
  if (doors.left) {
    walls.push({ x: ox, y: oy, w: WALL_LEFT, h: DOOR_MID_Y - DOOR_SIZE / 2 })
    walls.push({ x: ox, y: oy + DOOR_MID_Y + DOOR_SIZE / 2, w: WALL_LEFT, h: ROOM_H - DOOR_MID_Y - DOOR_SIZE / 2 })
  } else {
    walls.push({ x: ox, y: oy, w: WALL_LEFT, h: ROOM_H })
  }

  // East wall (right strip)
  if (doors.right) {
    walls.push({ x: ox + WALL_RIGHT, y: oy, w: ROOM_W - WALL_RIGHT, h: DOOR_MID_Y - DOOR_SIZE / 2 })
    walls.push({ x: ox + WALL_RIGHT, y: oy + DOOR_MID_Y + DOOR_SIZE / 2, w: ROOM_W - WALL_RIGHT, h: ROOM_H - DOOR_MID_Y - DOOR_SIZE / 2 })
  } else {
    walls.push({ x: ox + WALL_RIGHT, y: oy, w: ROOM_W - WALL_RIGHT, h: ROOM_H })
  }

  return walls
}

function offsetObjects(objects, col, row) {
  const ox = col * ROOM_W
  const oy = row * ROOM_H
  return objects.map(obj => ({ ...obj, x: obj.x + ox, y: obj.y + oy }))
}

function box(id, x, y, w, h, color, opts = {}) {
  return { id, x, y, w, h, color, blocking: false, label: null, ...opts }
}

const COLORS = {
  LR_FLOOR: '#C4A882', LR_WALL: '#8B7355', LR_SOFA: '#6B4C3B', LR_SOFA_L: '#7D5A47',
  LR_TABLE: '#A0522D', LR_RUG: '#8B1A3A', LR_SHELF: '#5C3A1E', LR_LAMP: '#D4AA70',
  WS_FLOOR: '#8B8B8B', WS_WALL: '#696969', WS_BENCH: '#4A3728', WS_MONITOR: '#1A1A2E',
  WS_SCREEN: '#00FF88', WS_SHELF: '#6B4C3B', WS_STICKY: '#FFE066',
  GL_FLOOR: '#E8E0D0', GL_WALL: '#C8BDB0', GL_FRAME: '#2C1810', GL_MAT: '#F5F0E8', GL_PLACARD: '#D4C4A0',
  CT_FLOOR: '#B8C4CC', CT_WALL: '#8A9BA8', CT_DESK: '#5C3A1E', CT_COMPUTER: '#1A1A2E',
  CT_MAILBOX: '#CC4444', CT_WINDOW: '#87CEEB',
}

// ── Living Room (col=0, row=0) — doors: right, bottom ─────────────────────
const LR_DOORS  = { right: true, bottom: true }
const LR_OBJS   = [
  box('rug',       60, 270, 260, 160, COLORS.LR_RUG),
  box('table',     100, 310, 110, 55, COLORS.LR_TABLE),
  box('sofa',       60, 180, 190, 80, COLORS.LR_SOFA,   { blocking: true }),
  box('sofa-l',     60, 180,  20, 80, COLORS.LR_SOFA_L),
  box('sofa-r',    230, 180,  20, 80, COLORS.LR_SOFA_L),
  box('shelf',     360, 135,  60, 110, COLORS.LR_SHELF,  { blocking: true }),
  box('lamp-base', 520, 330,  14,  55, COLORS.LR_LAMP),
  box('lamp-head', 507, 312,  40,  22, COLORS.LR_LAMP),
  box('picture',   110, 138,  70,  55, '#8B7355'),
  box('picture-i', 117, 145,  56,  41, '#D4A090'),
]
const LR_ZONES  = [
  { id: 'bookshelf-interact', x: 330, y: 125, w: 100, h: 130, label: 'About Me',  action: 'about'   },
  { id: 'picture-interact',   x:  95, y: 130, w: 110, h:  95, label: 'Fun Fact',  action: 'funfact' },
]

// ── Workshop (col=1, row=0) — doors: left, bottom ─────────────────────────
const WS_DOORS  = { left: true, bottom: true }
const WS_OBJS   = [
  box('bench',   40, 165, 360,  50, COLORS.WS_BENCH,   { blocking: true }),
  box('monitor', 130, 138,  80,  60, COLORS.WS_MONITOR, { blocking: true }),
  box('screen',  138, 144,  64,  48, COLORS.WS_SCREEN),
  box('keyboard',155, 215,  60,  14, '#333'),
  box('shelf',   480, 155,  80, 100, COLORS.WS_BENCH,   { blocking: true }),
  box('toolbox', 360, 390,  70,  50, '#8B0000'),
  box('toolbox-l',360,390,  70,  12, '#AA1111'),
  box('sticky1',  52, 152,  28,  22, COLORS.WS_STICKY),
  box('sticky2',  88, 147,  28,  22, '#FFC0CB'),
  box('sticky3', 124, 154,  28,  22, '#90EE90'),
  box('mat',     200, 340,  90,  55, '#555'),
]
const WS_ZONES  = [
  { id: 'monitor-interact',  x: 100, y: 130, w: 150, h: 140, label: 'Skills',     action: 'skills'    },
  { id: 'stickies-interact', x:  35, y: 140, w: 130, h:  95, label: 'Tech Stack', action: 'techstack' },
]

// ── Gallery (col=0, row=1) — doors: top, right ────────────────────────────
const GL_DOORS  = { top: true, right: true }
const GL_OBJS   = [
  box('frame1',      40, 148, 110, 75, COLORS.GL_FRAME),
  box('frame1-mat',  44, 152, 102, 67, COLORS.GL_MAT),
  box('frame1-img',  49, 157,  92, 57, '#667EEA'),
  box('placard1',    55, 230,  75, 14, COLORS.GL_PLACARD),
  box('frame2',     170, 148, 110, 75, COLORS.GL_FRAME),
  box('frame2-mat', 174, 152, 102, 67, COLORS.GL_MAT),
  box('frame2-img', 179, 157,  92, 57, '#F093FB'),
  box('placard2',   185, 230,  75, 14, COLORS.GL_PLACARD),
  box('frame3',     310, 148, 110, 75, COLORS.GL_FRAME),
  box('frame3-mat', 314, 152, 102, 67, COLORS.GL_MAT),
  box('frame3-img', 319, 157,  92, 57, '#4ECDC4'),
  box('placard3',   325, 230,  75, 14, COLORS.GL_PLACARD),
  box('frame4',     440, 148, 110, 75, COLORS.GL_FRAME),
  box('frame4-mat', 444, 152, 102, 67, COLORS.GL_MAT),
  box('frame4-img', 449, 157,  92, 57, '#FF6B6B'),
  box('placard4',   455, 230,  75, 14, COLORS.GL_PLACARD),
  box('bench1',     130, 420, 110,  38, '#A0896C'),
  box('bench2',     370, 420, 110,  38, '#A0896C'),
]
const GL_ZONES  = [
  { id: 'frame1-interact', x:  28, y: 140, w: 132, h: 114, label: 'Project 1', action: 'project1' },
  { id: 'frame2-interact', x: 158, y: 140, w: 132, h: 114, label: 'Project 2', action: 'project2' },
  { id: 'frame3-interact', x: 298, y: 140, w: 132, h: 114, label: 'Project 3', action: 'project3' },
  { id: 'frame4-interact', x: 428, y: 140, w: 132, h: 114, label: 'Project 4', action: 'project4' },
]

// ── Contact (col=1, row=1) — doors: top, left ─────────────────────────────
const CT_DOORS  = { top: true, left: true }
const CT_OBJS   = [
  box('window',    300, 140, 150, 100, COLORS.CT_WINDOW),
  box('window-f',  304, 144, 142,  92, '#D0EFFF'),
  box('win-hbar',  304, 188, 142,   4, '#8A9BA8'),
  box('win-vbar',  374, 144,   4,  92, '#8A9BA8'),
  box('desk',      100, 165, 190,  50, COLORS.CT_DESK,     { blocking: true }),
  box('desk-leg1', 110, 215,  12,  70, COLORS.CT_DESK),
  box('desk-leg2', 270, 215,  12,  70, COLORS.CT_DESK),
  box('computer',  155, 130,  80,  60, COLORS.CT_COMPUTER, { blocking: true }),
  box('comp-screen',163,136,  64,  48, '#00AAFF'),
  box('comp-base', 182, 215,  36,  10, '#333'),
  box('mailbox',   496, 255,  56,  28, COLORS.CT_MAILBOX,  { blocking: true }),
  box('mailbox-lid',496,245,  56,  14, '#AA2222'),
  box('mailbox-slot',510,257, 28,   6, '#1A0000'),
  box('mailbox-stand',514,283, 24,  80, '#555'),
  box('chair-seat',160, 250,  58,  48, '#4A3728'),
  box('chair-back',160, 210,  58,  48, '#4A3728',          { blocking: true }),
  box('plant-pot', 530, 390,  38,  38, '#8B4513'),
  box('plant',     520, 342,  58,  56, '#228B22'),
]
const CT_ZONES  = [
  { id: 'computer-interact', x: 115, y: 120, w: 160, h: 155, label: 'Contact Me', action: 'contact' },
  { id: 'mailbox-interact',  x: 468, y: 235, w: 115, h: 155, label: 'Send Mail',  action: 'contact' },
]

export const ROOMS = [
  {
    id: 0, col: 0, row: 0,
    name: 'Living Room',
    bgColor: COLORS.LR_FLOOR, wallColor: COLORS.LR_WALL, floorColor: COLORS.LR_FLOOR,
    doors: LR_DOORS,
    walls:        roomWalls(0, 0, LR_DOORS),
    objects:      offsetObjects(LR_OBJS,  0, 0),
    interactZones: LR_ZONES.map(z => ({ ...z, x: z.x + 0 * ROOM_W, y: z.y + 0 * ROOM_H })),
  },
  {
    id: 1, col: 1, row: 0,
    name: 'Workshop',
    bgColor: COLORS.WS_FLOOR, wallColor: COLORS.WS_WALL, floorColor: COLORS.WS_FLOOR,
    doors: WS_DOORS,
    walls:        roomWalls(1, 0, WS_DOORS),
    objects:      offsetObjects(WS_OBJS,  1, 0),
    interactZones: WS_ZONES.map(z => ({ ...z, x: z.x + 1 * ROOM_W, y: z.y + 0 * ROOM_H })),
  },
  {
    id: 2, col: 0, row: 1,
    name: 'Gallery',
    bgColor: COLORS.GL_FLOOR, wallColor: COLORS.GL_WALL, floorColor: COLORS.GL_FLOOR,
    doors: GL_DOORS,
    walls:        roomWalls(0, 1, GL_DOORS),
    objects:      offsetObjects(GL_OBJS,  0, 1),
    interactZones: GL_ZONES.map(z => ({ ...z, x: z.x + 0 * ROOM_W, y: z.y + 1 * ROOM_H })),
  },
  {
    id: 3, col: 1, row: 1,
    name: 'Contact',
    bgColor: COLORS.CT_FLOOR, wallColor: COLORS.CT_WALL, floorColor: COLORS.CT_FLOOR,
    doors: CT_DOORS,
    walls:        roomWalls(1, 1, CT_DOORS),
    objects:      offsetObjects(CT_OBJS,  1, 1),
    interactZones: CT_ZONES.map(z => ({ ...z, x: z.x + 1 * ROOM_W, y: z.y + 1 * ROOM_H })),
  },
]
