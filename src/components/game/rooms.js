const DOOR_TOP    = 220
const DOOR_BOTTOM = 380
const DOOR_W      = 20

const northWall = (rx) => ({ x: rx,       y: 0,   w: 800, h: 140 })
const southWall = (rx) => ({ x: rx,       y: 554, w: 800, h: 46  })
const doorAbove = (rx) => ({ x: rx + 800 - DOOR_W, y: 0,         w: DOOR_W, h: DOOR_TOP    })
const doorBelow = (rx) => ({ x: rx + 800 - DOOR_W, y: DOOR_BOTTOM, w: DOOR_W, h: 600 - DOOR_BOTTOM })

function roomWalls(rx, isLast = false) {
  const walls = [northWall(rx), southWall(rx)]
  if (!isLast) {
    walls.push(doorAbove(rx), doorBelow(rx))
  } else {
    walls.push({ x: rx + 780, y: 0, w: 20, h: 600 })
  }
  return walls
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

function box(id, x, y, w, h, color, opts = {}) {
  return { id, x, y, w, h, color, blocking: false, label: null, ...opts }
}

const LIVING_ROOM = {
  id: 0, name: 'Living Room', bgColor: COLORS.LR_FLOOR, wallColor: COLORS.LR_WALL, floorColor: COLORS.LR_FLOOR,
  walls: [
    ...roomWalls(0),
    { x: 0, y: 0, w: 20, h: 600 },
    { x: 60,  y: 190, w: 200, h: 60 },
    { x: 360, y: 140, w: 60,  h: 100 },
    { x: 110, y: 310, w: 120, h: 60  },
  ],
  objects: [
    box('rug', 80, 290, 280, 150, COLORS.LR_RUG),
    box('table', 110, 310, 120, 60, COLORS.LR_TABLE),
    box('sofa', 60, 190, 200, 80, COLORS.LR_SOFA, { blocking: true, label: 'Sofa' }),
    box('sofa-l', 60, 190, 20, 80, COLORS.LR_SOFA_L),
    box('sofa-r', 240, 190, 20, 80, COLORS.LR_SOFA_L),
    box('shelf', 360, 140, 60, 120, COLORS.LR_SHELF, { blocking: true, label: 'Bookshelf' }),
    box('lamp-base', 620, 340, 16, 60, COLORS.LR_LAMP),
    box('lamp-head', 606, 320, 44, 24, COLORS.LR_LAMP),
    box('picture', 130, 150, 80, 60, '#8B7355'),
    box('picture-i', 138, 158, 64, 44, '#D4A090'),
  ],
  interactZones: [
    { id: 'bookshelf-interact', x: 340, y: 140, w: 100, h: 140, label: 'About Me', action: 'about' },
    { id: 'picture-interact', x: 110, y: 140, w: 120, h: 100, label: 'Fun Fact', action: 'funfact' },
  ],
}

const WORKSHOP = {
  id: 1, name: 'Workshop', bgColor: COLORS.WS_FLOOR, wallColor: COLORS.WS_WALL, floorColor: COLORS.WS_FLOOR,
  walls: [
    ...roomWalls(800),
    { x: 840, y: 160, w: 400, h: 50 },
    { x: 1500, y: 155, w: 80, h: 110 },
  ],
  objects: [
    box('bench', 840, 160, 400, 50, COLORS.WS_BENCH, { blocking: true }),
    box('monitor', 940, 135, 80, 60, COLORS.WS_MONITOR, { blocking: true }),
    box('screen', 948, 141, 64, 48, COLORS.WS_SCREEN),
    box('keyboard', 960, 210, 60, 16, '#333'),
    box('shelf', 1500, 155, 80, 110, COLORS.WS_BENCH, { blocking: true }),
    box('toolbox', 1380, 400, 70, 50, '#8B0000'),
    box('toolbox-l', 1380, 400, 70, 12, '#AA1111'),
    box('sticky1', 870, 150, 30, 25, COLORS.WS_STICKY),
    box('sticky2', 910, 145, 30, 25, '#FFC0CB'),
    box('sticky3', 950, 152, 30, 25, '#90EE90'),
    box('mat', 920, 340, 100, 60, '#555'),
  ],
  interactZones: [
    { id: 'monitor-interact', x: 900, y: 130, w: 160, h: 140, label: 'Skills', action: 'skills' },
    { id: 'stickies-interact', x: 850, y: 140, w: 140, h: 100, label: 'Tech Stack', action: 'techstack' },
  ],
}

const GALLERY = {
  id: 2, name: 'Gallery', bgColor: COLORS.GL_FLOOR, wallColor: COLORS.GL_WALL, floorColor: COLORS.GL_FLOOR,
  walls: [...roomWalls(1600)],
  objects: [
    box('frame1', 1640, 148, 120, 80, COLORS.GL_FRAME),
    box('frame1-mat', 1644, 152, 112, 72, COLORS.GL_MAT),
    box('frame1-img', 1650, 158, 100, 60, '#667EEA'),
    box('placard1', 1660, 235, 80, 16, COLORS.GL_PLACARD),
    box('frame2', 1800, 148, 120, 80, COLORS.GL_FRAME),
    box('frame2-mat', 1804, 152, 112, 72, COLORS.GL_MAT),
    box('frame2-img', 1810, 158, 100, 60, '#F093FB'),
    box('placard2', 1820, 235, 80, 16, COLORS.GL_PLACARD),
    box('frame3', 1960, 148, 120, 80, COLORS.GL_FRAME),
    box('frame3-mat', 1964, 152, 112, 72, COLORS.GL_MAT),
    box('frame3-img', 1970, 158, 100, 60, '#4ECDC4'),
    box('placard3', 1980, 235, 80, 16, COLORS.GL_PLACARD),
    box('frame4', 2120, 148, 120, 80, COLORS.GL_FRAME),
    box('frame4-mat', 2124, 152, 112, 72, COLORS.GL_MAT),
    box('frame4-img', 2130, 158, 100, 60, '#FF6B6B'),
    box('placard4', 2140, 235, 80, 16, COLORS.GL_PLACARD),
    box('bench1', 1740, 420, 120, 40, '#A0896C'),
    box('bench2', 2020, 420, 120, 40, '#A0896C'),
  ],
  interactZones: [
    { id: 'frame1-interact', x: 1630, y: 140, w: 140, h: 120, label: 'Project 1', action: 'project1' },
    { id: 'frame2-interact', x: 1790, y: 140, w: 140, h: 120, label: 'Project 2', action: 'project2' },
    { id: 'frame3-interact', x: 1950, y: 140, w: 140, h: 120, label: 'Project 3', action: 'project3' },
    { id: 'frame4-interact', x: 2110, y: 140, w: 140, h: 120, label: 'Project 4', action: 'project4' },
  ],
}

const CONTACT_ROOM = {
  id: 3, name: 'Contact', bgColor: COLORS.CT_FLOOR, wallColor: COLORS.CT_WALL, floorColor: COLORS.CT_FLOOR,
  walls: [
    ...roomWalls(2400, true),
    { x: 2500, y: 165, w: 200, h: 50 },
    { x: 2900, y: 280, w: 50, h: 100 },
  ],
  objects: [
    box('window', 2680, 145, 160, 100, COLORS.CT_WINDOW),
    box('window-f', 2684, 149, 152, 92, '#D0EFFF'),
    box('win-hbar', 2684, 192, 152, 4, '#8A9BA8'),
    box('win-vbar', 2758, 149, 4, 92, '#8A9BA8'),
    box('desk', 2500, 165, 200, 50, COLORS.CT_DESK, { blocking: true }),
    box('desk-leg1', 2510, 215, 12, 80, COLORS.CT_DESK),
    box('desk-leg2', 2680, 215, 12, 80, COLORS.CT_DESK),
    box('computer', 2560, 130, 80, 60, COLORS.CT_COMPUTER, { blocking: true }),
    box('comp-screen', 2568, 136, 64, 48, '#00AAFF'),
    box('comp-base', 2590, 215, 36, 10, '#333'),
    box('mailbox', 2896, 260, 58, 30, COLORS.CT_MAILBOX, { blocking: true }),
    box('mailbox-lid', 2896, 250, 58, 14, '#AA2222'),
    box('mailbox-slot', 2910, 262, 30, 6, '#1A0000'),
    box('mailbox-stand', 2916, 290, 26, 90, '#555'),
    box('chair-seat', 2570, 250, 60, 50, '#4A3728'),
    box('chair-back', 2570, 210, 60, 50, '#4A3728', { blocking: true }),
    box('plant-pot', 3080, 380, 40, 40, '#8B4513'),
    box('plant', 3070, 330, 60, 60, '#228B22'),
  ],
  interactZones: [
    { id: 'computer-interact', x: 2520, y: 125, w: 160, h: 160, label: 'Contact Me', action: 'contact' },
    { id: 'mailbox-interact', x: 2870, y: 240, w: 120, h: 160, label: 'Send Mail', action: 'contact' },
  ],
}

export const ROOMS = [LIVING_ROOM, WORKSHOP, GALLERY, CONTACT_ROOM]
