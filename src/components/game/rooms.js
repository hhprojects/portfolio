export const ROOM_W  = 640
export const ROOM_H  = 640
export const WORLD_W = ROOM_W * 2
export const WORLD_H = ROOM_H * 2

export const WALL_TOP    = 120
export const WALL_BOTTOM = 580
export const WALL_LEFT   = 20
export const WALL_RIGHT  = 620
export const DOOR_SIZE   = 80
export const DOOR_MID_X  = ROOM_W / 2
export const DOOR_MID_Y  = Math.floor(WALL_TOP + (WALL_BOTTOM - WALL_TOP) / 2)

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
  LR_WALL2:        '#30284C',
  LR_FLOOR2:       '#131020',
  LR_DESK:         '#E8E4F0',
  LR_DESK_LEG:     '#5A5880',
  LR_MONITOR:      '#0A0814',
  LR_SCREEN:       '#0A1628',
  LR_PC:           '#0D0B1E',
  LR_LAMP_POLE:    '#4A476A',
  LR_LAMP_SHADE:   '#F5EDD8',
  LR_SHELF2:       '#1A1730',
  LR_MUG:          '#0A0814',
  LR_RUG2:         '#DEDBD4',
  LR_POT:          '#C4673A',
  LR_PLANT_DARK:   '#1E4D2B',
  LR_SUCCULENT:    '#5A7A5F',
  WS_FLOOR: '#14121F', WS_WALL: '#1C1A2E', WS_BENCH: '#4A3728', WS_MONITOR: '#1A1A2E',
  WS_SCREEN: '#00FF88', WS_SHELF: '#6B4C3B', WS_STICKY: '#FFE066',
  GL_FLOOR: '#16141E', GL_WALL: '#0E0C14', GL_FRAME: '#8B7340', GL_MAT: '#0A0810', GL_PLACARD: '#1A1520',
  CT_FLOOR: '#C8A870', CT_WALL: '#E2D4B0',
}

// ── Living Room (col=0, row=0) — doors: right, bottom ─────────────────────
const LR_DOORS = { right: true, bottom: true }
const LR_OBJS  = [
  // Rug (floor decoration, south of furniture so draws after it)
  box('lr-rug',           100, 350, 360, 155, COLORS.LR_RUG2, { floor: true }),

  // Bookshelf (left wall)
  box('lr-bookshelf',      22,  45, 120, 105, COLORS.LR_SHELF2,  { blocking: true }),

  // Floor lamp (beside bookshelf, base at WALL_TOP+20=140)
  box('lamp-halo',        157,  68,  28,  28, COLORS.LR_LAMP_SHADE),
  box('lr-lamp-base',     161, 150,  18,   5, COLORS.LR_LAMP_POLE),
  box('lr-lamp-pole',     168, 100,   5,  50, COLORS.LR_LAMP_POLE),
  box('lr-lamp-shade',    157,  82,  28,  22, COLORS.LR_LAMP_SHADE),

  // Desk (right side of room)
  box('lr-desk',          370, 155, 210,  30, COLORS.LR_DESK, { displayH: 40 }),
  box('lr-desk-leg-l',    378, 195,   6,  50, COLORS.LR_DESK_LEG),
  box('lr-desk-leg-r',    566, 195,   6,  50, COLORS.LR_DESK_LEG),

  // Monitors (special render for screens)
  box('lr-monitor-1',     390, 127,  52,  59, COLORS.LR_MONITOR, { blocking: true, displayH: 37 }),
  box('monitor-screen-1', 394, 131,  44,  55, COLORS.LR_SCREEN,  { displayH: 10 }),
  box('lr-stand-1',       410, 161,  12,  25, COLORS.LR_MONITOR, { displayH: 6 }),
  box('lr-monitor-2',     455, 127,  52,  59, COLORS.LR_MONITOR, { blocking: true, displayH: 37 }),
  box('monitor-screen-2', 459, 131,  44,  55, COLORS.LR_SCREEN,  { displayH: 10 }),
  box('lr-stand-2',       475, 161,  12,  25, COLORS.LR_MONITOR, { displayH: 6 }),

  // Keyboard (on desk, below monitors)
  box('keyboard',         415, 167,  55,  21, '#333'),

  // Coffee mug + steam
  box('lr-mug',           531, 154,  13,  42, COLORS.LR_MUG,        { displayH: 12 }),
  box('lr-mug-rim',       529, 150,  17,  46, '#333333',             { displayH:  5 }),
  box('mug-steam',        533, 135,   9,  61, '#FFFFFF',             { displayH: 16 }),

  // Succulent on desk
  box('lr-succ-pot',      563, 152,  14,  44, COLORS.LR_POT,        { displayH: 14 }),
  box('lr-succ-plant',    561, 140,  18,  56, COLORS.LR_SUCCULENT,  { displayH: 13 }),

  // Monstera (special render for leaves)
  box('monstera-pot',     549, 483,  27,  21, COLORS.LR_POT),
  box('monstera-pot-rim', 543, 477,  39,   6, '#D4774A'),
  box('monstera-soil',    552, 483,  21,   6, '#1A0A00'),
  box('monstera-leaves',  540, 426,  45,  51, COLORS.LR_PLANT_DARK),
]
const LR_ZONES = [
  { id: 'bookshelf-interact', x:  16, y: 155, w: 134, h:  20, label: 'About Me', action: 'about'   },
  { id: 'monitor-interact',   x: 370, y: 140, w: 210, h:  80, label: 'Fun Fact', action: 'funfact' },
]

// ── Workshop (col=1, row=0) — doors: left, bottom ─────────────────────────
const WS_DOORS  = { left: true, bottom: true }
const WS_OBJS   = [
  box('ws-corkboard',  340,  12, 268,  96, '#5C4A2A'),
  box('ws-hw-shelf',    18,  78, 246,  14, '#3A2E1A'),
  box('ws-raspi',       40,  64,  38,  32, '#1A4A2A'),
  box('ws-chip',        91,  73,  22,  22, '#1A1A1A'),
  box('ws-gameboy',    125,  60,  24,  36, '#9090A0'),
  box('ws-hw-led',      18, 114, 246,  38, '#FFD080'),
]
const WS_ZONES  = [
  { id: 'corkboard-interact', x: 340, y:  12, w: 268, h: 145, label: 'Skills', action: 'skills' },
]

// ── Gallery (col=0, row=1) — doors: top, right ────────────────────────────
const GL_DOORS = { top: true, right: true }

// Gallery layout constants
const GL_COLS        = 4
const GL_FRAME_W     = 110
const GL_FRAME_H     = 75
const GL_H_STEP      = 130   // frame width + gap
const GL_V_STEP      = 107   // frame + placard gap + placard + row gap
const GL_FIRST_X     = 40
const GL_FIRST_Y     = 148
const GL_PLACARD_W   = 75
const GL_PLACARD_H   = 14
const GL_PLACARD_GAP = 8

// ── Single source of truth: add a project here to show it in the gallery ──
export const GL_PROJECTS = [
  {
    imgPath: 'muse/dark_board.jpg',
    action: 'project1',
    label: 'Muse',
    title: 'Muse \u2013 Workflow Dashboard',
    description: 'A full-stack dashboard for workflow management with containerized backend and frontend services. Features task tracking, calendar, and event management.',
  },
  {
    imgPath: 'youtube_music_streamer/player.jpg',
    action: 'project2',
    label: 'YT Music',
    title: 'YouTube Music Streamer',
    description: 'A cross-platform mobile app to search YouTube, download audio, and manage a personal music library with a full-featured in-app player. Backend runs on a home server via Tailscale.',
  },
  {
    imgPath: 'xuan-dashboard/home.jpg',
    action: 'project3',
    label: 'Openclaw',
    title: 'Openclaw Dashboard',
    description: 'A personal AI dashboard on a Raspberry Pi. Live activity feed, pixel-art AI team visualization, kanban board, calendar with cron jobs, reading list with KB ingestion, and analytics.',
  },
  {
    imgPath: 'portfolio/portfolio.jpg',
    action: 'project4',
    label: 'Portfolio',
    title: 'Portfolio Website',
    description: 'This portfolio \u2014 built with React and Vite. Smooth animations, responsive design, and this 2.5D canvas game mode.',
  },
]

function buildGalleryObjects(projects) {
  const objs = []

  // Column spotlights — one per column, height covers all rows in that column
  for (let col = 0; col < Math.min(projects.length, GL_COLS); col++) {
    let lastRow = 0
    for (let i = col; i < projects.length; i += GL_COLS) lastRow = Math.floor(i / GL_COLS)
    const spotH = GL_FIRST_Y + lastRow * GL_V_STEP
    objs.push(box(`gl-spot-col-${col}`, GL_FIRST_X + col * GL_H_STEP, 0, GL_FRAME_W, spotH, '#000'))
  }

  // Frames, mats, images, placards
  for (let i = 0; i < projects.length; i++) {
    const col = i % GL_COLS
    const row = Math.floor(i / GL_COLS)
    const fx  = GL_FIRST_X + col * GL_H_STEP
    const fy  = GL_FIRST_Y + row * GL_V_STEP
    const px  = fx + Math.floor((GL_FRAME_W - GL_PLACARD_W) / 2)
    const py  = fy + GL_FRAME_H + GL_PLACARD_GAP
    objs.push(box(`gl-frame-${i}`,     fx,     fy,     GL_FRAME_W,      GL_FRAME_H,      COLORS.GL_FRAME))
    objs.push(box(`gl-frame-mat-${i}`, fx + 4, fy + 4, GL_FRAME_W - 8,  GL_FRAME_H - 8,  COLORS.GL_MAT))
    objs.push(box(`gl-frame-img-${i}`, fx + 9, fy + 9, GL_FRAME_W - 18, GL_FRAME_H - 18, '#000'))
    objs.push(box(`gl-placard-${i}`,   px,     py,     GL_PLACARD_W,    GL_PLACARD_H,    COLORS.GL_PLACARD))
  }

  return objs
}

function buildGalleryZones(projects) {
  return projects.map((p, i) => {
    const col = i % GL_COLS
    const row = Math.floor(i / GL_COLS)
    const fx  = GL_FIRST_X + col * GL_H_STEP
    const fy  = GL_FIRST_Y + row * GL_V_STEP
    return {
      id:    `gl-frame-zone-${i}`,
      x:     fx - 12,
      y:     fy - 8,
      w:     GL_FRAME_W + 22,
      h:     GL_FRAME_H + GL_PLACARD_GAP + GL_PLACARD_H + 18,
      label: p.label,
      action: p.action,
    }
  })
}

const GL_OBJS  = [
  ...buildGalleryObjects(GL_PROJECTS),
  box('gl-bench-1', 130, 420, 110, 38, '#1E1A2E'),
  box('gl-bench-2', 370, 420, 110, 38, '#1E1A2E'),
]
const GL_ZONES = buildGalleryZones(GL_PROJECTS)

// ── Contact (col=1, row=1) — doors: top, left ─────────────────────────────
const CT_DOORS  = { top: true, left: true }
const CT_OBJS   = [
  // Warm afternoon window (right wall)
  box('ct-window',          480,  30, 120,  90, '#F5D870'),
  // Bulletin board (left wall)
  box('ct-bulletin',         30,  28,  80,  62, '#5A3A1A'),
  // Classic red British post box — customer side
  box('ct-postbox',         530, 290,  52,  95, '#CC1A1A', { blocking: true }),
  // Scattered newspapers on customer floor
  box('ct-newspaper-1',     200, 380,  55,  38, '#E8E0C8', { floor: true }),
  box('ct-newspaper-2',     315, 425,  48,  34, '#DDD4B8', { floor: true }),
  box('ct-newspaper-3',     420, 355,  52,  36, '#E4DCC4', { floor: true }),
  // Employee floor band (purely visual, drawn as floor)
  box('ct-employee-floor',   20, 540, 600,  40, '#A07840', { floor: true }),
  // Full-width counter — invisible collision walls (top + face)
  box('ct-counter-wall',     20, 470, 600,  10, '#3A2210', { blocking: true }),
  box('ct-counter-block',    20, 494, 600,  46, '#3D1F0D', { blocking: true }),
  // Counter top surface (lighter mahogany, visible from above)
  box('ct-counter-top',      20, 470, 600,  24, '#6B3A1F'),
  // Counter front face (dark mahogany, facing player)
  box('ct-counter-face',     20, 494, 600,  46, '#3D1F0D'),
  // Glass partition rising from back edge of counter (always on top of player)
  box('ct-glass-panel',      20, 420, 600,  50, '#C8E8F4', { alwaysOnTop: true }),
  // Lamp halo (drawn before scene objects)
  box('ct-lamp-halo',        68, 445,  46,  46, '#FFD080'),
  // Brass desk lamp on counter surface
  box('ct-lamp',             80, 455,  22,  18, '#C8A030'),
  // Rubber stamp on counter
  box('ct-stamp',           200, 462,  28,  16, '#CC2020'),
  // Paper tray on counter
  box('ct-tray',            320, 460,  55,  20, '#6B3A1F'),
  // Service bell on counter
  box('ct-bell',            480, 458,  20,  20, '#C8A030'),
]
const CT_ZONES  = [
  { id: 'counter-interact', x: 20, y: 420, w: 600, h: 100, label: 'Contact Me', action: 'contact' },
]

export const ROOMS = [
  {
    id: 0, col: 0, row: 0,
    name: 'Living Room',
    bgColor:    COLORS.LR_FLOOR2,
    wallColor:  COLORS.LR_WALL2,
    floorColor: COLORS.LR_FLOOR2,
    doors: LR_DOORS,
    walls: [
      ...roomWalls(0, 0, LR_DOORS),
      { x: 370, y: 170, w: 210, h: 36 },   // desk front edge
{ x:  22, y:  40, w: 120, h: 115 },  // bookshelf
      { x: 549, y: 483, w:  27, h:  21 },  // monstera pot
      { x: 161, y: 130, w:  22, h:  25 },  // lamp
    ],
    objects:       offsetObjects(LR_OBJS, 0, 0),
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
