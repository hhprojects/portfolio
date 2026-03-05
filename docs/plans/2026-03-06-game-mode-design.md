# Game Mode Design — Portfolio Interactive Experience
**Date:** 2026-03-06  
**Status:** Approved

---

## Overview

An opt-in 2.5D top-down RPG game mode layered on top of the existing portfolio. Visitors click **🎮 Play** in the Hero section to enter a pixel-art world where they control a "Han" sprite and explore rooms representing each portfolio section.

The normal portfolio remains the primary experience. Game mode is additive — same content, more personality.

---

## Entry & Transition

- **Trigger:** `🎮 Play` button in Hero section (alongside existing CTAs)
- **Transition:** Pixelate effect — screen chunks into large pixel blocks, then resolves into the pixel art game world (CSS canvas filter + JS animation, ~800ms)
- **Exit:** `ESC` key or `✕` button top-right → reverse pixelate transition back to normal portfolio, scroll position preserved

---

## Architecture

### New Files
```
src/components/game/
  GameMode.jsx       — main container: <canvas> + HTML overlay layer
  useGameLoop.js     — requestAnimationFrame game loop hook
  sprites.js         — pixel art sprite definitions (Han, furniture, walls)
  rooms.js           — room map data (tiles, collision boxes, interactive zones, objects)
  GameOverlay.jsx    — HTML layer: popups, interact prompts, exit button, minimap (optional)
  GameMode.css       — transition animations, overlay styles
```

### Modified Files
- `App.jsx` — add `gameMode` state, render `<GameMode />` overtop when true
- `Hero.jsx` — add `🎮 Play` button

---

## Rendering: Hybrid Canvas + HTML

- **Canvas** — game world, sprite, rooms, pixel art objects, Y-sorting, camera
- **HTML overlay** — interaction prompts (`[W] Interact`), popup cards, exit button
- Canvas is `position: fixed`, full viewport, z-index high
- HTML overlay sits above canvas, pointer-events only on interactive UI elements

---

## Game World

### Movement
- **WASD** or **Arrow keys** — 4-directional movement + diagonals
- Smooth pixel movement via game loop (not React state)
- Speed: ~150px/sec (adjustable)
- Collision detection: axis-aligned bounding box (AABB) against walls and furniture

### Camera
- Follows Han, centered on screen
- Clamps at room boundaries (no scrolling past edges)
- Smooth lerp follow (camera eases toward player position)

### Y-Sorting & Translucency
- All objects sorted by their Y position before drawing each frame
- Han drawn in correct depth order relative to furniture
- When Han's Y overlaps a `blocking: true` object → draw that object at **40% opacity**
- This makes tall objects (walls, bookshelves) become see-through when Han walks behind them

---

## Rooms

Four interconnected rooms. Han can walk freely between them through door openings (no fade — just walk through).

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Living Rm  │──│  Workshop   │──│   Gallery   │──│ Contact Rm  │
│  About/Bio  │  │   Skills    │  │  Projects   │  │   Contact   │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

### 🛋 Living Room (About)
- Sofa, coffee table, bookshelf, framed photo on wall, rug, lamp
- **Bookshelf** → interact → About/Bio popup card
- **Framed photo** → interact → fun personal fact

### 🔧 Workshop (Skills)
- Workbench, monitor, shelves with tech items, toolbox, sticky notes on wall
- **Monitor** → interact → Skills popup (tag grid of all tech)
- **Sticky notes** → hover label showing individual skills

### 🖼 Gallery (Projects)
- Framed project screenshots hung on walls, small placard below each
- **Each frame** → interact → project card popup (same carousel as current portfolio)
- 4 frames total (one per project)

### 📬 Contact Room
- Desk, computer, mailbox, window with outside view
- **Computer / Mailbox** → interact → contact form popup
- **Window** → shows a little outdoor pixel scene (decorative)

---

## Han Sprite

- Same pixel robot aesthetic as AI team page
- Distinct look: **blue body**, no crown antenna, casual
- **4 directional sprites:** facing up, down, left, right
- **Walk animation:** 2-frame leg cycle per direction
- **Idle:** subtle breathing bob
- **Interact animation:** small exclamation `!` bubble when near interactive object

---

## Interactive System

1. Each object in `rooms.js` has an `interactZone` rectangle and `onInteract` action
2. Game loop checks distance between Han and all interact zones each frame
3. If within range → HTML overlay shows `[W] Interact` prompt above object
4. Press W → fires `onInteract` → sets popup state in React → `GameOverlay` renders card

### Popup Cards (HTML overlay)
- Slide up from bottom, dark semi-transparent card, matches portfolio aesthetic
- **About card** — bio text, photo
- **Skills card** — tech tag grid
- **Project card** — title, description, screenshots carousel, tech tags, links
- **Contact card** — name/email/message form
- Dismiss: ESC or click outside

---

## Transition Animation Detail

**Enter game mode (pixelate in):**
1. Canvas appears overtop, starts fully transparent
2. JS draws current viewport to canvas, applies chunky pixelation filter (increasing block size 1→32px over 400ms)
3. Cross-fade to game world as pixelation peaks (~400ms)
4. Total: ~800ms

**Exit game mode (pixelate out):**
1. Game world pixelates out (32→1px, 400ms)
2. Canvas fades out, normal portfolio fades back in
3. Scroll position restored

---

## Out of Scope (YAGNI)
- Mobile touch controls (future enhancement)
- Sound effects / music
- Save state / progress
- Multiplayer
- Minimap

---

## Success Criteria
- Smooth 60fps movement with WASD
- Translucency works correctly when Han walks behind tall objects
- All 4 sections reachable and interactive
- Pixel-art visual style consistent with AI team page
- Pixelate transition feels polished
- ESC always exits cleanly back to portfolio
