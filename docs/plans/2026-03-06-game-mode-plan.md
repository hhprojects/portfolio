# Game Mode Implementation Plan

> **For the implementer:** Execute this plan task-by-task using /sp_sdd or /sp_execute.

**Goal:** Add an opt-in 2.5D top-down RPG game mode to the portfolio, accessible via a Play button in the Hero section.

**Architecture:** Hybrid Canvas (game world, sprite, rooms) + HTML overlay (UI, popups). React component wraps a <canvas> with absolute-positioned HTML overlay. requestAnimationFrame game loop. Rooms defined as data in rooms.js.

**Tech Stack:** React, Vite, HTML5 Canvas API, CSS animations

---

## World Layout Reference

```
World size: 3200 × 600 (logical pixels, 1:1 with canvas pixels)

x: [   0 — 800   ] [  800 — 1600  ] [ 1600 — 2400  ] [ 2400 — 3200  ]
   [ Living Room  ] [   Workshop   ] [    Gallery   ] [    Contact   ]
   [ About / Bio  ] [    Skills    ] [   Projects   ] [   Contact    ]

Vertical layout (each room):
  y 0   – 140  : north wall (drawn, collision)
  y 140 – 540  : walkable floor
  y 540 – 600  : south wall (drawn, collision)

Door openings (y 220–380) at x=800, 1600, 2400
Player spawn: x=80, y=380 (Living Room, facing down)
```

---

### Task 1: Game mode toggle

**Files:**
- Modify `src/App.jsx`
- Modify `src/components/Hero.jsx`
- Modify `src/components/Hero.css`

**Code:**

`src/App.jsx`:
```jsx
import { useState, useRef } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import GameMode from './components/game/GameMode'

function App() {
  const [gameMode, setGameMode] = useState(false)
  const scrollPosRef = useRef(0)

  const handlePlay = () => {
    scrollPosRef.current = window.scrollY
    setGameMode(true)
  }

  const handleExit = () => {
    setGameMode(false)
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPosRef.current, behavior: 'instant' })
    })
  }

  return (
    <>
      <Navbar />
      <Hero onPlay={handlePlay} />
      <About />
      <Skills />
      <Projects />
      <Contact />
      <Footer />
      {gameMode && <GameMode onExit={handleExit} />}
    </>
  )
}

export default App
```

`src/components/Hero.jsx` — add `onPlay` prop and Play button inside `.hero-cta`:
```jsx
import { useState, useEffect, useRef } from 'react'
import './Hero.css'
import portfolioImage from '../assets/Portfolio Image (With Lighting).png'

function Hero({ onPlay }) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentRole, setCurrentRole] = useState(0)
  const heroRef = useRef(null)

  const roles = ['Software Engineer', 'Web Developer', 'Designer']

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true)
          else setIsVisible(false)
        })
      },
      { threshold: 0.3, rootMargin: '0px' }
    )
    if (heroRef.current) observer.observe(heroRef.current)
    return () => { if (heroRef.current) observer.unobserve(heroRef.current) }
  }, [])

  useEffect(() => {
    if (!isVisible) return
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [isVisible, roles.length])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="hero" ref={heroRef}>
      <div className="hero-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}></div>
        ))}
      </div>

      <div className={`hero-logo ${isVisible ? 'visible' : ''}`}>
        <img src={portfolioImage} alt="Portfolio Logo" className="logo-image" />
      </div>

      <div className="hero-content">
        <div className={`hero-text ${isVisible ? 'visible' : ''}`}>
          <p className="hero-greeting">Hi, I'm</p>
          <h1 className="hero-title">
            <span className="title-line gradient-text">Han Hua</span>
          </h1>
          <div className="hero-subtitle-container">
            <p className="hero-subtitle">
              I'm a{' '}
              <span className="role-text" key={currentRole}>
                {roles[currentRole]}
              </span>
            </p>
          </div>
          <p className="hero-description">
            Crafting beautiful, functional solutions that bring ideas to life
          </p>
          <div className="hero-cta">
            <button className="cta-button primary" onClick={() => scrollToSection('projects')}>
              View My Work
            </button>
            <button className="cta-button secondary" onClick={() => scrollToSection('contact')}>
              Get In Touch
            </button>
            <button className="cta-button play-btn" onClick={onPlay}>
              🎮 Play
            </button>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="mouse"><div className="wheel"></div></div>
        <p>Scroll Down</p>
      </div>
    </section>
  )
}

export default Hero
```

Append to `src/components/Hero.css`:
```css
/* Play button */
.cta-button.play-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
}

.cta-button.play-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(240, 147, 251, 0.6);
}

@media (max-width: 768px) {
  .cta-button.play-btn {
    display: none;
  }
}
```

**Commit:** `git commit -m "feat: add game mode toggle state and Play button in Hero"`

---

### Task 2: Pixelate transition CSS animation

**Files:**
- Create `src/components/game/GameMode.css`

**Code:**

`src/components/game/GameMode.css`:
```css
/* ── GameMode container ────────────────────────────────────────────── */
.game-mode-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

.game-mode-root canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

/* ── Pixelate transition overlay ──────────────────────────────────── */
.pixelate-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  /* The actual pixelation is done via canvas filter in JS.
     This overlay handles opacity cross-fade. */
  background: transparent;
  transition: opacity 200ms ease;
}

/* Entering: game fades in after pixelate peaks */
.game-mode-root.entering .pixelate-overlay {
  animation: pixelate-in 800ms ease forwards;
}

/* Exiting: game pixelates out */
.game-mode-root.exiting .pixelate-overlay {
  animation: pixelate-out 800ms ease forwards;
}

/* CSS pixelation simulation using scale + blur trick */
@keyframes pixelate-in {
  0%   { filter: blur(0px) brightness(1); opacity: 1; }
  30%  { filter: blur(2px) brightness(1.4); opacity: 1; }
  60%  { filter: blur(4px) brightness(0.8); opacity: 0.8; }
  100% { filter: blur(0px) brightness(1); opacity: 0; }
}

@keyframes pixelate-out {
  0%   { filter: blur(0px) brightness(1); opacity: 0; }
  40%  { filter: blur(4px) brightness(0.8); opacity: 0.8; }
  70%  { filter: blur(2px) brightness(1.4); opacity: 1; }
  100% { filter: blur(0px) brightness(1); opacity: 1; }
}

/* Canvas-level pixelate effect (applied via JS class toggle) */
.game-mode-root.entering canvas {
  animation: canvas-pixelate-in 800ms ease forwards;
}

.game-mode-root.exiting canvas {
  animation: canvas-pixelate-out 800ms ease forwards;
}

@keyframes canvas-pixelate-in {
  0%   { filter: blur(16px) brightness(2); opacity: 0; transform: scale(1.04); }
  40%  { filter: blur(8px) brightness(1.5); opacity: 0.6; transform: scale(1.02); }
  70%  { filter: blur(2px) brightness(1.1); opacity: 0.9; transform: scale(1.01); }
  100% { filter: blur(0px) brightness(1); opacity: 1; transform: scale(1); }
}

@keyframes canvas-pixelate-out {
  0%   { filter: blur(0px) brightness(1); opacity: 1; transform: scale(1); }
  30%  { filter: blur(2px) brightness(1.1); opacity: 0.9; transform: scale(1.01); }
  60%  { filter: blur(8px) brightness(1.5); opacity: 0.6; transform: scale(1.02); }
  100% { filter: blur(16px) brightness(2); opacity: 0; transform: scale(1.04); }
}

/* ── Exit button ──────────────────────────────────────────────────── */
.game-exit-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 20;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  letter-spacing: 1px;
  transition: background 0.2s;
  backdrop-filter: blur(4px);
}

.game-exit-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* ── Room label (top-left HUD) ─────────────────────────────────────── */
.game-room-label {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 20;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.4);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
}

/* ── Controls hint (bottom-left HUD) ─────────────────────────────── */
.game-controls-hint {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  z-index: 20;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  letter-spacing: 1px;
  pointer-events: none;
}
```

**Commit:** `git commit -m "feat: add game mode CSS with pixelate transition animations"`

---

### Task 3: GameMode.jsx shell

**Files:**
- Create `src/components/game/GameMode.jsx`

**Code:**

`src/components/game/GameMode.jsx`:
```jsx
import { useEffect, useRef, useState, useCallback } from 'react'
import './GameMode.css'
import { useGameLoop } from './useGameLoop'
import { ROOMS } from './rooms'
import { drawFrame } from './renderer'
import { createPlayerState, updatePlayer } from './physics'
import GameOverlay from './GameOverlay'

const WORLD_WIDTH  = 3200
const WORLD_HEIGHT = 600

export default function GameMode({ onExit }) {
  const canvasRef   = useRef(null)
  const rootRef     = useRef(null)

  // All mutable game state lives in refs (never triggers re-render)
  const playerRef   = useRef(createPlayerState())
  const cameraRef   = useRef({ x: 0, y: 0 })
  const keysRef     = useRef({})

  // React state only for overlay/UI
  const [transitionState, setTransitionState] = useState('entering') // entering | playing | exiting
  const [overlayState, setOverlayState]       = useState({ interactLabel: null, popup: null })
  const [currentRoomName, setCurrentRoomName] = useState('Living Room')

  // ── Transition: entering → playing after animation ──────────────
  useEffect(() => {
    const timer = setTimeout(() => setTransitionState('playing'), 850)
    return () => clearTimeout(timer)
  }, [])

  // ── ESC to exit ──────────────────────────────────────────────────
  const triggerExit = useCallback(() => {
    if (transitionState === 'exiting') return
    // Dismiss popup first if open
    if (overlayState.popup) {
      setOverlayState(s => ({ ...s, popup: null }))
      return
    }
    setTransitionState('exiting')
    setTimeout(() => onExit(), 850)
  }, [transitionState, overlayState.popup, onExit])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') triggerExit()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [triggerExit])

  // ── Key tracking ─────────────────────────────────────────────────
  useEffect(() => {
    const down = (e) => { keysRef.current[e.key] = true }
    const up   = (e) => { keysRef.current[e.key] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup',   up)
    }
  }, [])

  // ── Canvas resize ────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ── Game loop ────────────────────────────────────────────────────
  const { start, stop } = useGameLoop((dt) => {
    if (transitionState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Update player + collision
    updatePlayer(playerRef.current, keysRef.current, ROOMS, dt, WORLD_WIDTH, WORLD_HEIGHT)

    // Update camera
    const cam    = cameraRef.current
    const player = playerRef.current
    const targetX = player.x - canvas.width  / 2
    const targetY = player.y - canvas.height / 2
    const lerp = 1 - Math.pow(0.01, dt)         // frame-rate independent lerp (α ≈ 0.1/frame at 60fps)
    cam.x += (targetX - cam.x) * lerp
    cam.y += (targetY - cam.y) * lerp
    cam.x = Math.max(0, Math.min(cam.x, WORLD_WIDTH  - canvas.width))
    cam.y = Math.max(0, Math.min(cam.y, WORLD_HEIGHT - canvas.height))

    // Determine current room for HUD
    const roomIdx = Math.floor(player.x / 800)
    const room = ROOMS[Math.min(roomIdx, ROOMS.length - 1)]
    if (room && room.name !== currentRoomName) {
      setCurrentRoomName(room.name)
    }

    // Check interact zones
    let nearZone = null
    for (const r of ROOMS) {
      for (const zone of r.interactZones) {
        const zx = zone.x, zy = zone.y, zw = zone.w, zh = zone.h
        const px = player.x, py = player.y
        if (px > zx && px < zx + zw && py > zy && py < zy + zh) {
          nearZone = zone
          break
        }
      }
    }

    // Handle [W] interact press
    if (nearZone && (keysRef.current['w'] || keysRef.current['W'] || keysRef.current['ArrowUp'])) {
      // Only fire once per press
      if (!keysRef.current.__interactFired) {
        keysRef.current.__interactFired = true
        setOverlayState(s => ({ ...s, popup: nearZone.action }))
      }
    } else {
      keysRef.current.__interactFired = false
    }

    setOverlayState(s => ({
      ...s,
      interactLabel: nearZone ? `[W] ${nearZone.label}` : null
    }))

    // Draw frame
    drawFrame(ctx, canvas, playerRef.current, cameraRef.current, ROOMS)
  })

  useEffect(() => {
    start()
    return () => stop()
  }, [start, stop])

  return (
    <div className={`game-mode-root ${transitionState}`} ref={rootRef}>
      <canvas ref={canvasRef} />
      <div className="pixelate-overlay" />

      {/* HUD */}
      <div className="game-room-label">{currentRoomName}</div>
      <div className="game-controls-hint">WASD / ↑↓←→ Move &nbsp;|&nbsp; W Interact &nbsp;|&nbsp; ESC Exit</div>
      <button className="game-exit-btn" onClick={triggerExit}>✕ ESC</button>

      {/* HTML overlay (interact prompts + popups) */}
      <GameOverlay
        overlayState={overlayState}
        onDismiss={() => setOverlayState(s => ({ ...s, popup: null }))}
      />
    </div>
  )
}
```

**Commit:** `git commit -m "feat: add GameMode.jsx shell with canvas, ESC exit, and transition states"`

---

### Task 4: useGameLoop.js hook

**Files:**
- Create `src/components/game/useGameLoop.js`

**Code:**

`src/components/game/useGameLoop.js`:
```js
import { useRef, useCallback, useEffect } from 'react'

/**
 * requestAnimationFrame game loop hook.
 * Calls `callback(dt)` every frame, where dt is delta time in seconds.
 * dt is capped at 50ms (0.05s) to prevent physics tunneling on tab switch.
 *
 * Usage:
 *   const { start, stop } = useGameLoop((dt) => { ... update logic ... })
 *   useEffect(() => { start(); return () => stop() }, [start, stop])
 */
export function useGameLoop(callback) {
  const rafRef       = useRef(null)
  const lastTimeRef  = useRef(null)
  const callbackRef  = useRef(callback)
  const activeRef    = useRef(false)

  // Keep callbackRef current without restarting the loop
  useEffect(() => {
    callbackRef.current = callback
  })

  const stop = useCallback(() => {
    activeRef.current = false
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    lastTimeRef.current = null
  }, [])

  const start = useCallback(() => {
    if (activeRef.current) return   // already running
    activeRef.current  = true
    lastTimeRef.current = null

    const loop = (timestamp) => {
      if (!activeRef.current) return

      if (lastTimeRef.current !== null) {
        const rawDt = (timestamp - lastTimeRef.current) / 1000
        const dt    = Math.min(rawDt, 0.05)  // cap at 50ms
        callbackRef.current(dt)
      }

      lastTimeRef.current = timestamp
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [])

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop])

  return { start, stop }
}
```

**Commit:** `git commit -m "feat: add useGameLoop hook with delta time and frame cap"`

---

### Task 5: sprites.js — Han pixel art sprite

**Files:**
- Create `src/components/game/sprites.js`

**Code:**

`src/components/game/sprites.js`:
```js
/**
 * Han pixel-art sprite definitions.
 * Each frame is a 10×14 grid of color characters.
 * SPRITE_SCALE = 4  →  rendered at 40×56 canvas pixels.
 *
 * Palette:
 *   _ = transparent
 *   H = skin (#F4C4A1)
 *   A = hair (#2C1810)
 *   E = eye  (#1A0A10)
 *   B = blue body (#4A90D9)
 *   D = dark blue (#2E6DA4)
 *   N = navy pants (#2C3E50)
 *   S = shoe (#1A1A1A)
 *   W = white accent (#FFFFFF)
 *   R = blush/mouth (#E8A090)
 */

export const SPRITE_SCALE = 4
export const SPRITE_W     = 10   // grid columns
export const SPRITE_H     = 14   // grid rows
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

// ── Sprite grids (10 chars wide × 14 rows) ─────────────────────────

// Facing DOWN — idle / frame 1 (feet together)
const DOWN_1 = [
  '__AAAAAA__',  // 0  hair top
  '_AHHHHHHA_',  // 1  head
  '_AHEHHEHA_',  // 2  eyes (E at col 3 & 6)
  '_AHHRRHHА_',  // 3  cheeks/nose — note: last A is Cyrillic typo-safe, use latin below
  '__HHHHHH__',  // 4  chin
  '_BBBBBBBB_',  // 5  body top
  '_BBBBBBBB_',  // 6  body mid
  '_BDBBBDBB_',  // 7  body detail (arm outline)
  '_BBBBBBBB_',  // 8  body bottom
  '__NN__NN__',  // 9  pants (left leg: col 2-3, right leg: col 6-7)
  '__NN__NN__',  // 10
  '__NN__NN__',  // 11
  '__NN__NN__',  // 12
  '_SSS__SSS_',  // 13 shoes (col 1-3, 6-8)
]

// Facing DOWN — frame 2 (walk: feet apart)
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
  '___N___N__',  // legs spread
  '___N___N__',
  '__NN___NN_',
  '__NN___NN_',
  '__SS___SS_',  // shoes
]

// Facing UP — idle
const UP_1 = [
  '__AAAAAA__',
  '_AAAAAAA__',  // back of head
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

// Facing UP — frame 2 (walk)
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

// Facing LEFT — idle
const LEFT_1 = [
  '___AAAA___',
  '__AHHHHHA_',
  '_AHEHHHHA_',  // single eye on left
  '_AHHRRHHA_',
  '__HHHHHH__',
  '_BBBBBBBB_',
  '_BBBBBBBB_',
  'DBBBBBBBB_',  // left arm shadow
  '_BBBBBBBB_',
  '__NNNN____',  // both legs visible from side
  '__NNNN____',
  '__NNNN____',
  '__NNNN____',
  '_SSSSS____',
]

// Facing LEFT — frame 2 (walk: front leg forward)
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

// Facing RIGHT — idle (mirror of LEFT)
const RIGHT_1 = [
  '___AAAA___',
  '_AHHHHHA__',
  '_AHHHHHEHA',  // single eye on right
  '_AHHRRHA__',
  '__HHHHHH__',
  '_BBBBBBBB_',
  '_BBBBBBBB_',
  '_BBBBBBBBD',  // right arm shadow
  '_BBBBBBBB_',
  '____NNNN__',
  '____NNNN__',
  '____NNNN__',
  '____NNNN__',
  '____SSSSS_',
]

// Facing RIGHT — frame 2 (walk)
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

// ── Draw function ───────────────────────────────────────────────────

/**
 * Draw a sprite grid onto ctx at world position (x, y),
 * offset by camera (camX, camY). Optional alpha for translucency.
 */
export function drawSprite(ctx, grid, worldX, worldY, camX, camY, alpha = 1) {
  const sx = Math.floor(worldX - camX)
  const sy = Math.floor(worldY - camY)
  const prevAlpha = ctx.globalAlpha
  ctx.globalAlpha = alpha

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const ch = grid[row][col]
      if (ch === '_' || ch === ' ') continue
      // Handle Cyrillic A accidentally typed above — treat as hair
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

/**
 * Returns the correct sprite grid for the player given direction and walk frame.
 * @param {'down'|'up'|'left'|'right'} dir
 * @param {number} frame - 0 or 1
 */
export function getHanSprite(dir, frame) {
  const f = frame % 2
  switch (dir) {
    case 'up':    return f === 0 ? UP_1    : UP_2
    case 'left':  return f === 0 ? LEFT_1  : LEFT_2
    case 'right': return f === 0 ? RIGHT_1 : RIGHT_2
    default:      return f === 0 ? DOWN_1  : DOWN_2
  }
}

/**
 * Draw the Han player sprite.
 * Player coords = center-bottom of sprite (feet position).
 */
export function drawHan(ctx, player, camX, camY, alpha = 1) {
  const { x, y, dir, walkFrame, isMoving } = player
  // Sprite origin = top-left; sprite center-bottom = (x, y)
  const spritX = x - SPRITE_PX_W / 2
  const spritY = y - SPRITE_PX_H

  // Walk frame only advances when moving
  const grid = getHanSprite(dir, isMoving ? walkFrame : 0)
  drawSprite(ctx, grid, spritX, spritY, camX, camY, alpha)

  // Interact bubble: small '!' above head when near an interact zone
  if (player.nearInteract) {
    ctx.globalAlpha = alpha
    ctx.fillStyle = '#FFE600'
    ctx.font = `bold ${SPRITE_SCALE * 3}px monospace`
    ctx.textAlign = 'center'
    ctx.fillText('!', Math.floor(x - camX), Math.floor(y - SPRITE_PX_H - 4 - camY))
    ctx.globalAlpha = 1
  }
}
```

**Commit:** `git commit -m "feat: add Han pixel-art sprites with 4-direction walk animation"`

---

### Task 6: rooms.js — 4 room definitions

**Files:**
- Create `src/components/game/rooms.js`

**Code:**

`src/components/game/rooms.js`:
```js
/**
 * World room definitions.
 *
 * World layout: 3200 × 600 px
 * Each room is 800 wide. Rooms are connected by door openings (y 220–380).
 *
 * Each room:
 *   id, name, bgColor, floorColor, wallColor
 *   walls[]       — AABB collision rectangles { x, y, w, h }
 *   objects[]     — visual items { id, x, y, w, h, color, blocking, label, drawFn }
 *   interactZones[] — { id, x, y, w, h, label, action }
 *
 * Player hitbox is 20×12 (feet area), centered at player.x, player.y.
 */

// ── Door gap constants ──────────────────────────────────────────────
const DOOR_TOP    = 220
const DOOR_BOTTOM = 380
const DOOR_W      = 20   // thin wall divider width

// ── Room boundary walls (shared) ───────────────────────────────────
const northWall = (rx) => ({ x: rx,       y: 0,   w: 800, h: 140 })
const southWall = (rx) => ({ x: rx,       y: 554, w: 800, h: 46  })
const doorAbove = (rx) => ({ x: rx + 800 - DOOR_W, y: 0,         w: DOOR_W, h: DOOR_TOP    })
const doorBelow = (rx) => ({ x: rx + 800 - DOOR_W, y: DOOR_BOTTOM, w: DOOR_W, h: 600 - DOOR_BOTTOM })

function roomWalls(rx, isLast = false) {
  const walls = [northWall(rx), southWall(rx)]
  if (!isLast) {
    walls.push(doorAbove(rx), doorBelow(rx))
  } else {
    // East boundary wall
    walls.push({ x: rx + 780, y: 0, w: 20, h: 600 })
  }
  return walls
}

// ── Color palette ──────────────────────────────────────────────────
const COLORS = {
  // Living Room
  LR_FLOOR:    '#C4A882',
  LR_WALL:     '#8B7355',
  LR_SOFA:     '#6B4C3B',
  LR_SOFA_L:   '#7D5A47',
  LR_TABLE:    '#A0522D',
  LR_RUG:      '#8B1A3A',
  LR_SHELF:    '#5C3A1E',
  LR_LAMP:     '#D4AA70',

  // Workshop
  WS_FLOOR:    '#8B8B8B',
  WS_WALL:     '#696969',
  WS_BENCH:    '#4A3728',
  WS_MONITOR:  '#1A1A2E',
  WS_SCREEN:   '#00FF88',
  WS_SHELF:    '#6B4C3B',
  WS_STICKY:   '#FFE066',

  // Gallery
  GL_FLOOR:    '#E8E0D0',
  GL_WALL:     '#C8BDB0',
  GL_FRAME:    '#2C1810',
  GL_MAT:      '#F5F0E8',
  GL_PLACARD:  '#D4C4A0',

  // Contact
  CT_FLOOR:    '#B8C4CC',
  CT_WALL:     '#8A9BA8',
  CT_DESK:     '#5C3A1E',
  CT_COMPUTER: '#1A1A2E',
  CT_MAILBOX:  '#CC4444',
  CT_WINDOW:   '#87CEEB',
}

// ── Helper: simple colored rect object ─────────────────────────────
function box(id, x, y, w, h, color, opts = {}) {
  return { id, x, y, w, h, color, blocking: false, label: null, ...opts }
}

// ── ROOM 0: Living Room (x 0–800) ─────────────────────────────────
const LIVING_ROOM = {
  id: 0,
  name: 'Living Room',
  bgColor:    COLORS.LR_FLOOR,
  wallColor:  COLORS.LR_WALL,
  floorColor: COLORS.LR_FLOOR,

  walls: [
    ...roomWalls(0),
    // West boundary
    { x: 0, y: 0, w: 20, h: 600 },
    // Sofa (blocking — Han walks behind it)
    { x: 60,  y: 190, w: 200, h: 60 },
    // Bookshelf
    { x: 360, y: 140, w: 60,  h: 100 },
    // Coffee table
    { x: 110, y: 310, w: 120, h: 60  },
  ],

  objects: [
    // Rug (floor level, not blocking)
    box('rug',       80,  290, 280, 150, COLORS.LR_RUG),
    // Coffee table
    box('table',    110,  310, 120,  60, COLORS.LR_TABLE, { blocking: false }),
    // Sofa (blocking — tall backrest)
    box('sofa',      60,  190, 200,  80, COLORS.LR_SOFA,  { blocking: true, label: 'Sofa' }),
    box('sofa-l',    60,  190,  20,  80, COLORS.LR_SOFA_L),   // left arm
    box('sofa-r',   240,  190,  20,  80, COLORS.LR_SOFA_L),   // right arm
    // Bookshelf (blocking)
    box('shelf',    360,  140,  60, 120, COLORS.LR_SHELF, { blocking: true, label: 'Bookshelf' }),
    // Lamp
    box('lamp-base', 620, 340,  16,  60, COLORS.LR_LAMP),
    box('lamp-head', 606, 320,  44,  24, COLORS.LR_LAMP),
    // Wall art (picture frame above sofa)
    box('picture',  130,  150,  80,  60, '#8B7355'),
    box('picture-i', 138, 158,  64,  44, '#D4A090'),   // picture fill
  ],

  interactZones: [
    {
      id: 'bookshelf-interact',
      x: 340, y: 140, w: 100, h: 140,
      label: 'About Me',
      action: 'about',
    },
    {
      id: 'picture-interact',
      x: 110, y: 140, w: 120, h: 100,
      label: 'Fun Fact',
      action: 'funfact',
    },
  ],
}

// ── ROOM 1: Workshop (x 800–1600) ─────────────────────────────────
const WORKSHOP = {
  id: 1,
  name: 'Workshop',
  bgColor:    COLORS.WS_FLOOR,
  wallColor:  COLORS.WS_WALL,
  floorColor: COLORS.WS_FLOOR,

  walls: [
    ...roomWalls(800),
    // Workbench (long table across back)
    { x: 840, y: 160, w: 400, h: 50 },
    // Side shelf
    { x: 1500, y: 155, w: 80,  h: 110 },
  ],

  objects: [
    // Workbench
    box('bench',      840, 160, 400, 50, COLORS.WS_BENCH, { blocking: true }),
    // Monitor on bench
    box('monitor',    940, 135,  80, 60, COLORS.WS_MONITOR, { blocking: true, label: 'Monitor' }),
    box('screen',     948, 141,  64, 48, COLORS.WS_SCREEN),
    // Keyboard
    box('keyboard',   960, 210,  60, 16, '#333'),
    // Side shelf
    box('shelf',     1500, 155,  80, 110, COLORS.WS_BENCH, { blocking: true }),
    // Toolbox on floor
    box('toolbox',   1380, 400,  70,  50, '#8B0000'),
    box('toolbox-l', 1380, 400,  70,  12, '#AA1111'),  // lid
    // Sticky notes on wall
    box('sticky1',    870, 150,  30,  25, COLORS.WS_STICKY),
    box('sticky2',    910, 145,  30,  25, '#FFC0CB'),
    box('sticky3',    950, 152,  30,  25, '#90EE90'),
    // Floor cable/mat
    box('mat',        920, 340, 100,  60, '#555'),
  ],

  interactZones: [
    {
      id: 'monitor-interact',
      x: 900, y: 130, w: 160, h: 140,
      label: 'Skills',
      action: 'skills',
    },
    {
      id: 'stickies-interact',
      x: 850, y: 140, w: 140, h: 100,
      label: 'Tech Stack',
      action: 'techstack',
    },
  ],
}

// ── ROOM 2: Gallery (x 1600–2400) ─────────────────────────────────
const GALLERY = {
  id: 2,
  name: 'Gallery',
  bgColor:    COLORS.GL_FLOOR,
  wallColor:  COLORS.GL_WALL,
  floorColor: COLORS.GL_FLOOR,

  walls: [
    ...roomWalls(1600),
    // No furniture blocking — open floor
  ],

  objects: [
    // 4 framed project screenshots on north wall
    // Frame 1
    box('frame1',      1640, 148, 120, 80, COLORS.GL_FRAME),
    box('frame1-mat',  1644, 152, 112, 72, COLORS.GL_MAT),
    box('frame1-img',  1650, 158, 100, 60, '#667EEA'),   // project color
    box('placard1',    1660, 235,  80, 16, COLORS.GL_PLACARD),
    // Frame 2
    box('frame2',      1800, 148, 120, 80, COLORS.GL_FRAME),
    box('frame2-mat',  1804, 152, 112, 72, COLORS.GL_MAT),
    box('frame2-img',  1810, 158, 100, 60, '#F093FB'),
    box('placard2',    1820, 235,  80, 16, COLORS.GL_PLACARD),
    // Frame 3
    box('frame3',      1960, 148, 120, 80, COLORS.GL_FRAME),
    box('frame3-mat',  1964, 152, 112, 72, COLORS.GL_MAT),
    box('frame3-img',  1970, 158, 100, 60, '#4ECDC4'),
    box('placard3',    1980, 235,  80, 16, COLORS.GL_PLACARD),
    // Frame 4
    box('frame4',      2120, 148, 120, 80, COLORS.GL_FRAME),
    box('frame4-mat',  2124, 152, 112, 72, COLORS.GL_MAT),
    box('frame4-img',  2130, 158, 100, 60, '#FF6B6B'),
    box('placard4',    2140, 235,  80, 16, COLORS.GL_PLACARD),
    // Bench seating (for viewing)
    box('bench1',      1740, 420, 120,  40, '#A0896C'),
    box('bench2',      2020, 420, 120,  40, '#A0896C'),
    // Spotlight circles on floor (decorative)
    box('spot1',       1690, 370,  20,  20, 'rgba(255,240,180,0.4)'),
    box('spot2',       1850, 370,  20,  20, 'rgba(255,240,180,0.4)'),
    box('spot3',       2010, 370,  20,  20, 'rgba(255,240,180,0.4)'),
    box('spot4',       2170, 370,  20,  20, 'rgba(255,240,180,0.4)'),
  ],

  interactZones: [
    { id: 'frame1-interact', x: 1630, y: 140, w: 140, h: 120, label: 'Project 1', action: 'project1' },
    { id: 'frame2-interact', x: 1790, y: 140, w: 140, h: 120, label: 'Project 2', action: 'project2' },
    { id: 'frame3-interact', x: 1950, y: 140, w: 140, h: 120, label: 'Project 3', action: 'project3' },
    { id: 'frame4-interact', x: 2110, y: 140, w: 140, h: 120, label: 'Project 4', action: 'project4' },
  ],
}

// ── ROOM 3: Contact Room (x 2400–3200) ────────────────────────────
const CONTACT_ROOM = {
  id: 3,
  name: 'Contact',
  bgColor:    COLORS.CT_FLOOR,
  wallColor:  COLORS.CT_WALL,
  floorColor: COLORS.CT_FLOOR,

  walls: [
    ...roomWalls(2400, true),  // isLast = true → east boundary wall
    // Desk
    { x: 2500, y: 165, w: 200, h: 50 },
    // Mailbox stand
    { x: 2900, y: 280, w: 50,  h: 100 },
  ],

  objects: [
    // Window on north wall (decorative)
    box('window',      2680, 145, 160, 100, COLORS.CT_WINDOW),
    box('window-f',    2684, 149, 152,  92, '#D0EFFF'),   // sky
    box('window-bird1', 2700, 170, 8,   4,  '#1A1A2E'),   // bird
    box('window-bird2', 2720, 162, 8,   4,  '#1A1A2E'),
    // Window frame cross
    box('win-hbar',    2684, 192, 152,   4, '#8A9BA8'),
    box('win-vbar',    2758, 149,   4,  92, '#8A9BA8'),
    // Desk
    box('desk',        2500, 165, 200,  50, COLORS.CT_DESK, { blocking: true }),
    box('desk-leg1',   2510, 215,  12,  80, COLORS.CT_DESK),
    box('desk-leg2',   2680, 215,  12,  80, COLORS.CT_DESK),
    // Computer on desk
    box('computer',    2560, 130,  80,  60, COLORS.CT_COMPUTER, { blocking: true, label: 'Computer' }),
    box('comp-screen', 2568, 136,  64,  48, '#00AAFF'),
    box('comp-base',   2590, 215,  36,  10, '#333'),
    // Mailbox
    box('mailbox',     2896, 260,  58,  30, COLORS.CT_MAILBOX, { blocking: true }),
    box('mailbox-lid', 2896, 250,  58,  14, '#AA2222'),
    box('mailbox-slot',2910, 262,  30,   6, '#1A0000'),  // slot
    box('mailbox-stand',2916, 290,  26, 90, '#555'),
    // Chair
    box('chair-seat',  2570, 250,  60,  50, '#4A3728'),
    box('chair-back',  2570, 210,  60,  50, '#4A3728', { blocking: true }),
    // Plant (corner)
    box('plant-pot',   3080, 380,  40,  40, '#8B4513'),
    box('plant',       3070, 330,  60,  60, '#228B22'),
    box('plant2',      3062, 310,  76,  40, '#2E8B57'),
  ],

  interactZones: [
    {
      id: 'computer-interact',
      x: 2520, y: 125, w: 160, h: 160,
      label: 'Contact Me',
      action: 'contact',
    },
    {
      id: 'mailbox-interact',
      x: 2870, y: 240, w: 120, h: 160,
      label: 'Send Mail',
      action: 'contact',
    },
  ],
}

export const ROOMS = [LIVING_ROOM, WORKSHOP, GALLERY, CONTACT_ROOM]
```

**Commit:** `git commit -m "feat: add rooms.js with 4 room definitions, walls, objects, and interact zones"`

---

### Task 7: Canvas renderer

**Files:**
- Create `src/components/game/renderer.js`

**Code:**

`src/components/game/renderer.js`:
```js
/**
 * Canvas renderer for the game world.
 * Pure functions — no React, no state.
 *
 * Drawing order (before Y-sort pass):
 *   1. Floor fill
 *   2. North wall (dark band)
 *   3. South wall (dark band)
 *   4. All room objects + player, Y-sorted (drawScene handles this)
 *
 * Y-sort: objects sorted by (y + h), player inserted at correct depth.
 * Blocking objects overlapping player Y → drawn at 40% alpha.
 */

import { drawHan, SPRITE_PX_H } from './sprites'

const NORTH_WALL_H = 140   // height of the back wall band
const SOUTH_WALL_Y = 554   // where south wall starts
const PIXEL = 2            // upscale for pixel-art furniture details

// ── Floor & wall fill ──────────────────────────────────────────────

function drawRoom(ctx, room, camX, camY, canvasW, canvasH) {
  // Floor
  ctx.fillStyle = room.floorColor
  ctx.fillRect(
    Math.floor(room.id * 800 - camX),
    Math.floor(NORTH_WALL_H - camY),
    800,
    SOUTH_WALL_Y - NORTH_WALL_H
  )

  // North wall band
  ctx.fillStyle = room.wallColor
  ctx.fillRect(
    Math.floor(room.id * 800 - camX),
    Math.floor(-camY),
    800,
    NORTH_WALL_H
  )

  // South wall band
  ctx.fillStyle = darken(room.wallColor, 0.6)
  ctx.fillRect(
    Math.floor(room.id * 800 - camX),
    Math.floor(SOUTH_WALL_Y - camY),
    800,
    600 - SOUTH_WALL_Y
  )

  // Door opening highlight (slightly lighter strip between rooms)
  if (room.id < 3) {
    const doorX = Math.floor((room.id + 1) * 800 - camX)
    ctx.fillStyle = room.floorColor
    // Fill door gap in north wall area
    ctx.fillRect(doorX - 20, Math.floor(-camY), 20, NORTH_WALL_H)
  }

  // Baseboard (floor/wall transition line)
  ctx.fillStyle = darken(room.wallColor, 0.8)
  ctx.fillRect(
    Math.floor(room.id * 800 - camX),
    Math.floor(NORTH_WALL_H - 4 - camY),
    800, 4
  )
}

// ── Object renderer ────────────────────────────────────────────────

function drawObject(ctx, obj, camX, camY, alpha = 1) {
  const sx = Math.floor(obj.x - camX)
  const sy = Math.floor(obj.y - camY)

  const prevAlpha = ctx.globalAlpha
  ctx.globalAlpha = alpha

  // Handle rgba colors directly
  ctx.fillStyle = obj.color
  ctx.fillRect(sx, sy, obj.w, obj.h)

  // Pixel-art detail lines for specific object types (by id prefix)
  if (obj.id?.startsWith('sofa') && !obj.id.includes('-')) {
    // Sofa cushion lines
    ctx.fillStyle = darken(obj.color, 0.85)
    ctx.fillRect(sx + 4, sy + obj.h - 20, obj.w - 8, 4)
    // Seat dividers
    for (let i = 1; i < 3; i++) {
      ctx.fillRect(sx + Math.floor(obj.w * i / 3), sy + 20, 4, obj.h - 24)
    }
  }

  if (obj.id?.startsWith('bench') && !obj.id.includes('-')) {
    // Workbench grain lines
    ctx.fillStyle = darken(obj.color, 0.85)
    for (let i = 0; i < obj.w; i += 20) {
      ctx.fillRect(sx + i, sy, 2, obj.h)
    }
  }

  if (obj.id?.startsWith('shelf') && !obj.id.includes('-')) {
    // Shelf dividers
    ctx.fillStyle = lighten(obj.color, 1.3)
    ctx.fillRect(sx, sy, obj.w, 4)  // top edge
    ctx.fillRect(sx, sy + Math.floor(obj.h / 2), obj.w, 4)  // mid shelf
    // Book spines
    const bookColors = ['#CC4444', '#4A90D9', '#50C878', '#FFB347', '#9B59B6']
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = bookColors[i % bookColors.length]
      ctx.fillRect(sx + 4 + i * 10, sy + 6, 8, Math.floor(obj.h / 2) - 8)
    }
  }

  if (obj.id?.startsWith('frame') && obj.id.length <= 7) {
    // Frame molding border
    ctx.fillStyle = lighten(obj.color, 1.4)
    ctx.strokeStyle = lighten(obj.color, 1.4)
    ctx.lineWidth = 2
    ctx.strokeRect(sx + 2, sy + 2, obj.w - 4, obj.h - 4)
  }

  ctx.globalAlpha = prevAlpha
}

// ── Y-sorted scene draw ─────────────────────────────────────────────

export function drawFrame(ctx, canvas, player, camera, rooms) {
  const { x: camX, y: camY } = camera
  const { width: cw, height: ch } = canvas

  // Clear
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, cw, ch)

  // Determine visible room range
  const visLeft  = camX
  const visRight = camX + cw

  for (const room of rooms) {
    const roomLeft  = room.id * 800
    const roomRight = roomLeft + 800
    if (roomRight < visLeft || roomLeft > visRight) continue
    drawRoom(ctx, room, camX, camY, cw, ch)
  }

  // Collect all visible objects from visible rooms
  const allObjects = []
  for (const room of rooms) {
    const roomLeft  = room.id * 800
    const roomRight = roomLeft + 800
    if (roomRight < visLeft || roomLeft > visRight) continue
    for (const obj of room.objects) {
      if (obj.x + obj.w > visLeft && obj.x < visRight) {
        allObjects.push(obj)
      }
    }
  }

  // Player sort key = bottom of feet
  const playerSortY = player.y

  // Sort objects by bottom edge
  allObjects.sort((a, b) => (a.y + a.h) - (b.y + b.h))

  // Find insertion index for player
  let playerDrawn = false
  for (let i = 0; i < allObjects.length; i++) {
    const obj = allObjects[i]
    if (!playerDrawn && (obj.y + obj.h) >= playerSortY) {
      drawHan(ctx, player, camX, camY)
      playerDrawn = true
    }

    // Translucency: blocking object whose Y range overlaps player sprite
    const playerSpriteTop = player.y - SPRITE_PX_H
    const objOverlapsPlayer = (
      obj.blocking &&
      obj.y < player.y &&
      (obj.y + obj.h) > playerSpriteTop &&
      obj.x < player.x + 16 &&
      (obj.x + obj.w) > player.x - 16
    )

    drawObject(ctx, obj, camX, camY, objOverlapsPlayer ? 0.4 : 1)
  }

  if (!playerDrawn) {
    drawHan(ctx, player, camX, camY)
  }
}

// ── Color utils ────────────────────────────────────────────────────

function darken(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const rd = Math.round(r * factor).toString(16).padStart(2, '0')
  const gd = Math.round(g * factor).toString(16).padStart(2, '0')
  const bd = Math.round(b * factor).toString(16).padStart(2, '0')
  return `#${rd}${gd}${bd}`
}

function lighten(hex, factor) {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const rl = Math.min(255, Math.round(r * factor)).toString(16).padStart(2, '0')
  const gl = Math.min(255, Math.round(g * factor)).toString(16).padStart(2, '0')
  const bl = Math.min(255, Math.round(b * factor)).toString(16).padStart(2, '0')
  return `#${rl}${gl}${bl}`
}
```

**Commit:** `git commit -m "feat: add canvas renderer with floor/wall draw and object rendering"`

---

### Task 8: WASD movement + collision detection (AABB)

**Files:**
- Create `src/components/game/physics.js`

**Code:**

`src/components/game/physics.js`:
```js
/**
 * Player state factory + movement / AABB collision system.
 *
 * Player position = center-bottom (feet). This is the reference point
 * for collision (hitbox) and Y-sorting.
 *
 * Hitbox: 20 wide × 12 tall, centered at (player.x, player.y).
 * AABB collision checks against room walls.
 */

const PLAYER_SPEED    = 150   // px per second
const PLAYER_HW       = 10    // half-width  (hitbox: 20px wide)
const PLAYER_HH       = 6     // half-height (hitbox: 12px tall)
const WALK_ANIM_SPEED = 8     // frames per second (walk frame advance)

export function createPlayerState() {
  return {
    x:           80,      // world x (center-bottom / feet)
    y:           380,     // world y
    dir:         'down',  // 'up' | 'down' | 'left' | 'right'
    isMoving:    false,
    walkFrame:   0,       // 0 or 1
    walkTimer:   0,       // accumulates dt for walk frame flip
    nearInteract: false,  // set by GameMode when near an interact zone
  }
}

/**
 * Update player position based on keys held down.
 * Performs two-axis AABB collision (x first, then y).
 */
export function updatePlayer(player, keys, rooms, dt, worldW, worldH) {
  const up    = keys['ArrowUp']    || keys['w'] || keys['W']
  const down  = keys['ArrowDown']  || keys['s'] || keys['S']
  const left  = keys['ArrowLeft']  || keys['a'] || keys['A']
  const right = keys['ArrowRight'] || keys['d'] || keys['D']

  let dx = 0
  let dy = 0

  if (up)    dy -= 1
  if (down)  dy += 1
  if (left)  dx -= 1
  if (right) dx += 1

  // Normalize diagonal movement
  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.SQRT2
    dx *= inv
    dy *= inv
  }

  const isMoving = dx !== 0 || dy !== 0
  player.isMoving = isMoving

  // Update direction facing
  if (dy < 0) player.dir = 'up'
  else if (dy > 0) player.dir = 'down'
  else if (dx < 0) player.dir = 'left'
  else if (dx > 0) player.dir = 'right'

  // Walk animation timer
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

  // Collect all wall rects from all rooms
  const walls = rooms.flatMap(r => r.walls)

  // ── X-axis movement + collision ──
  const newX = player.x + dx * speed
  const hitboxX = { x: newX - PLAYER_HW, y: player.y - PLAYER_HH, w: PLAYER_HW * 2, h: PLAYER_HH * 2 }

  if (!collidesWithAny(hitboxX, walls)) {
    player.x = newX
  }

  // ── Y-axis movement + collision ──
  const newY = player.y + dy * speed
  const hitboxY = { x: player.x - PLAYER_HW, y: newY - PLAYER_HH, w: PLAYER_HW * 2, h: PLAYER_HH * 2 }

  if (!collidesWithAny(hitboxY, walls)) {
    player.y = newY
  }

  // ── World bounds clamp (hard stop) ──
  player.x = Math.max(PLAYER_HW, Math.min(worldW - PLAYER_HW, player.x))
  player.y = Math.max(PLAYER_HH + 140, Math.min(worldH - PLAYER_HH - 46, player.y))
}

/**
 * AABB overlap test between two rectangles.
 * Each rect: { x, y, w, h }
 */
function aabbOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  )
}

function collidesWithAny(hitbox, walls) {
  for (const wall of walls) {
    if (aabbOverlap(hitbox, wall)) return true
  }
  return false
}
```

**Commit:** `git commit -m "feat: add physics.js with WASD movement, AABB collision, and walk animation"`

---

### Task 9: Camera system — follows Han with lerp, clamps at room boundaries

> The camera system is already wired into `GameMode.jsx` (Task 3) via the game loop callback.
> This task documents the camera math and updates `GameMode.jsx` to use the corrected lerp formula for frame-rate independence.

**Files:**
- Modify `src/components/game/GameMode.jsx` — update camera block in the game loop

**Code:**

Replace the camera update block inside the `useGameLoop` callback in `GameMode.jsx` with:

```js
// ── Camera: smooth lerp follow, clamped to world bounds ──
const cam     = cameraRef.current
const player  = playerRef.current
const VW      = canvas.width
const VH      = canvas.height

// Target: center player in viewport
const targetX = player.x - VW / 2
const targetY = player.y - VH / 2

// Frame-rate independent lerp: alpha = 1 - (1 - speed)^(dt*60)
// speed = 0.1 → feels smooth at 60fps; accelerates on slow frames
const CAM_SPEED = 0.12
const alpha = 1 - Math.pow(1 - CAM_SPEED, dt * 60)

cam.x += (targetX - cam.x) * alpha
cam.y += (targetY - cam.y) * alpha

// Clamp so camera never shows outside world bounds
cam.x = Math.max(0, Math.min(cam.x, WORLD_WIDTH  - VW))
cam.y = Math.max(0, Math.min(cam.y, WORLD_HEIGHT - VH))
```

No additional file needed — camera state lives in `cameraRef` in `GameMode.jsx`.

**Commit:** `git commit -m "feat: camera system with frame-rate-independent lerp and world boundary clamp"`

---

### Task 10: Y-sorting + translucency — objects render at 40% alpha when Han's Y overlaps them

> Y-sorting and translucency are already implemented in `renderer.js` (Task 7).
> This task refines the overlap detection and adds a smooth alpha transition.

**Files:**
- Modify `src/components/game/renderer.js` — improve translucency logic

**Code:**

Replace the Y-sorted render loop in `drawFrame` with:

```js
// Sort objects by bottom edge (Y + H)
allObjects.sort((a, b) => (a.y + a.h) - (b.y + b.h))

const playerBottom = player.y            // feet
const playerTop    = player.y - SPRITE_PX_H  // top of sprite

let playerDrawn = false

for (let i = 0; i < allObjects.length; i++) {
  const obj = allObjects[i]

  // Draw player at correct depth (before any object whose bottom > player feet)
  if (!playerDrawn && (obj.y + obj.h) >= playerBottom) {
    drawHan(ctx, player, camX, camY)
    playerDrawn = true
  }

  // Translucency check:
  // Object is 'blocking' AND Han's sprite vertically overlaps it
  // AND Han is horizontally near it (within 24px of object x-range)
  const objTop    = obj.y
  const objBottom = obj.y + obj.h
  const vertOverlap = objBottom > playerTop && objTop < playerBottom
  const horizNear   = (
    player.x + 20 > obj.x &&
    player.x - 20 < obj.x + obj.w
  )

  // Smooth alpha: compute target alpha per frame
  // 0.4 when fully behind, 1.0 when not behind
  // (Use stored alpha for smooth transition — see note below)
  const targetAlpha = (obj.blocking && vertOverlap && horizNear) ? 0.4 : 1.0
  // For instant effect (no lerp): pass targetAlpha directly
  drawObject(ctx, obj, camX, camY, targetAlpha)
}

if (!playerDrawn) {
  drawHan(ctx, player, camX, camY)
}
```

> **Note:** For smooth alpha fade-in/out (instead of a snap), store `obj._alpha` per object and lerp toward `targetAlpha` each frame:
> ```js
> obj._alpha = obj._alpha ?? 1.0
> obj._alpha += (targetAlpha - obj._alpha) * 0.15  // lerp factor
> drawObject(ctx, obj, camX, camY, obj._alpha)
> ```
> Mutating `_alpha` on the rooms data is acceptable since rooms.js objects are module-level state.

**Commit:** `git commit -m "feat: Y-sorting and 40% translucency when Han walks behind blocking objects"`

---

### Task 11: GameOverlay.jsx — interact prompt, popup cards, ESC dismiss

**Files:**
- Create `src/components/game/GameOverlay.jsx`
- Append overlay styles to `src/components/game/GameMode.css`

**Code:**

`src/components/game/GameOverlay.jsx`:
```jsx
import React from 'react'

/**
 * HTML overlay rendered on top of the canvas.
 * - Interact prompt: shown when player is near an interact zone
 * - Popup cards: About, Skills, Projects, Contact
 * - ESC to dismiss popup
 */
export default function GameOverlay({ overlayState, onDismiss }) {
  const { interactLabel, popup } = overlayState

  return (
    <div className="game-overlay" style={{ pointerEvents: popup ? 'all' : 'none' }}>
      {/* Interact prompt */}
      {interactLabel && !popup && (
        <div className="interact-prompt">
          <span className="interact-key">{interactLabel.split(' ')[0]}</span>
          <span className="interact-text"> {interactLabel.split(' ').slice(1).join(' ')}</span>
        </div>
      )}

      {/* Popup cards */}
      {popup && (
        <div className="popup-backdrop" onClick={onDismiss}>
          <div className="popup-card" onClick={e => e.stopPropagation()}>
            <button className="popup-close" onClick={onDismiss}>✕</button>
            <PopupContent action={popup} />
          </div>
        </div>
      )}
    </div>
  )
}

function PopupContent({ action }) {
  switch (action) {
    case 'about':
      return (
        <div className="popup-body">
          <h2 className="popup-title">👋 About Me</h2>
          <div className="popup-section">
            <p>Hi! I'm <strong>Han Hua</strong> — a Software Engineer, Web Developer, and Designer based in Singapore.</p>
            <p>I craft beautiful, functional solutions that bring ideas to life. I love working across the full stack, from pixel-perfect UIs to scalable backend systems.</p>
            <p>When I'm not coding, you'll find me exploring new tech, gaming, or designing something just for fun — like this game mode.</p>
          </div>
          <div className="popup-tags">
            {['React', 'TypeScript', 'Python', 'Node.js', 'Design Systems'].map(t => (
              <span key={t} className="popup-tag">{t}</span>
            ))}
          </div>
        </div>
      )

    case 'funfact':
      return (
        <div className="popup-body">
          <h2 className="popup-title">🎲 Fun Fact</h2>
          <div className="popup-section">
            <p className="popup-big-text">I built this portfolio game mode from scratch — pixel art and all. 🎮</p>
            <p>WASD to move, W to interact, ESC to return to the normal portfolio. You already knew that though.</p>
          </div>
        </div>
      )

    case 'skills':
    case 'techstack':
      return (
        <div className="popup-body">
          <h2 className="popup-title">⚡ Skills</h2>
          <div className="popup-section">
            <p className="popup-subtitle">Languages & Frameworks</p>
            <div className="popup-tags">
              {['JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js', 'Express', 'FastAPI'].map(t => (
                <span key={t} className="popup-tag">{t}</span>
              ))}
            </div>
            <p className="popup-subtitle">Tools & Platforms</p>
            <div className="popup-tags">
              {['Git', 'Docker', 'PostgreSQL', 'Redis', 'AWS', 'Vite', 'Tailwind CSS', 'Figma'].map(t => (
                <span key={t} className="popup-tag tag-secondary">{t}</span>
              ))}
            </div>
            <p className="popup-subtitle">Practices</p>
            <div className="popup-tags">
              {['TDD', 'CI/CD', 'Agile', 'REST APIs', 'System Design', 'UI/UX'].map(t => (
                <span key={t} className="popup-tag tag-accent">{t}</span>
              ))}
            </div>
          </div>
        </div>
      )

    case 'project1':
    case 'project2':
    case 'project3':
    case 'project4': {
      const idx = parseInt(action.replace('project', '')) - 1
      const projects = [
        { title: 'Xuan Dashboard',  desc: 'Personal AI assistant dashboard with real-time task management, calendar, and habit tracking.', tech: ['React', 'FastAPI', 'PostgreSQL', 'WebSockets'], color: '#667EEA' },
        { title: 'Portfolio',        desc: 'This portfolio! Built with React + Vite, featuring smooth animations and — yes — this game mode.', tech: ['React', 'Vite', 'CSS', 'Canvas API'], color: '#F093FB' },
        { title: 'Project Three',   desc: 'Description coming soon. Walk through the gallery to see what\'s on the wall!', tech: ['TypeScript', 'Node.js', 'Docker'], color: '#4ECDC4' },
        { title: 'Project Four',    desc: 'Description coming soon.', tech: ['Python', 'FastAPI', 'Redis'], color: '#FF6B6B' },
      ]
      const p = projects[idx]
      return (
        <div className="popup-body">
          <div className="popup-project-color" style={{ background: p.color }} />
          <h2 className="popup-title">{p.title}</h2>
          <div className="popup-section">
            <p>{p.desc}</p>
          </div>
          <div className="popup-tags">
            {p.tech.map(t => <span key={t} className="popup-tag">{t}</span>)}
          </div>
          <div className="popup-links">
            <a href="#projects" className="popup-link-btn" onClick={(e) => { e.preventDefault(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }) }}>
              View in Portfolio ↗
            </a>
          </div>
        </div>
      )
    }

    case 'contact':
      return (
        <div className="popup-body">
          <h2 className="popup-title">📬 Get In Touch</h2>
          <div className="popup-section">
            <p>Have a project in mind? Want to work together? Drop me a message!</p>
          </div>
          <form className="popup-form" onSubmit={(e) => { e.preventDefault(); alert('Thanks! (wire up your form handler here)') }}>
            <input  className="popup-input" type="text"  placeholder="Your Name"    required />
            <input  className="popup-input" type="email" placeholder="Your Email"   required />
            <textarea className="popup-textarea"          placeholder="Your Message" rows={4} required />
            <button className="popup-submit" type="submit">Send Message 🚀</button>
          </form>
        </div>
      )

    default:
      return <div className="popup-body"><p>Nothing here yet.</p></div>
  }
}
```

Append to `src/components/game/GameMode.css`:
```css
/* ── HTML overlay layer ────────────────────────────────────────────── */
.game-overlay {
  position: absolute;
  inset: 0;
  z-index: 15;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 6rem;
}

/* Interact prompt */
.interact-prompt {
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  padding: 0.4rem 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #fff;
  animation: prompt-bob 1s ease-in-out infinite;
  pointer-events: none;
  backdrop-filter: blur(4px);
}

.interact-key {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 3px;
  padding: 0 4px;
  font-weight: bold;
  color: #FFE600;
}

@keyframes prompt-bob {
  0%, 100% { transform: translateY(0);    }
  50%       { transform: translateY(-4px); }
}

/* Popup backdrop */
.popup-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
  animation: backdrop-in 0.2s ease;
}

@keyframes backdrop-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Popup card */
.popup-card {
  background: rgba(15, 15, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  max-width: 520px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  animation: card-slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

@keyframes card-slide-up {
  from { transform: translateY(40px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.popup-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #aaa;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.popup-close:hover { background: rgba(255, 80, 80, 0.3); color: #fff; }

.popup-body { color: #e0e0e0; }

.popup-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1rem;
}
```

**Commit:**
```bash
git add src/components/game/GameOverlay.jsx src/components/game/GameOverlay.css
git commit -m "feat: add GameOverlay interact prompts and popup cards"
```

---

### Task 12: Wire it all together + build check

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Hero.jsx`

**Step 1:** Import GameMode in App.jsx and add gameMode state:

```jsx
import { useState, useEffect } from 'react'
import './App.css'
import LoadingScreen from './components/LoadingScreen'
import GameMode from './components/game/GameMode'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Blog from './components/Blog'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  const [loaded, setLoaded] = useState(false)
  const [gameMode, setGameMode] = useState(false)

  useEffect(() => {
    if (document.readyState === 'complete') {
      const t = setTimeout(() => setLoaded(true), 600)
      return () => clearTimeout(t)
    }
    const onLoad = () => setTimeout(() => setLoaded(true), 600)
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return (
    <>
      <LoadingScreen loaded={loaded} />
      {gameMode && <GameMode onExit={() => setGameMode(false)} />}
      <Navbar />
      <Hero onPlayGame={() => setGameMode(true)} />
      <About />
      <Skills />
      <Blog />
      <Projects />
      <Contact />
      <Footer />
    </>
  )
}

export default App
```

**Step 2:** Add `onPlayGame` prop to Hero.jsx — add Play button alongside existing CTAs:

```jsx
// Hero.jsx — add prop and button
function Hero({ onPlayGame }) {
  // ... existing code ...
  // Inside hero-cta div, after Resume button:
  // Only show on desktop (hidden on mobile via CSS)
}
```

Add to hero-cta:
```jsx
<button
  className="cta-button play-game"
  onClick={onPlayGame}
>
  🎮 Play
</button>
```

Add to Hero.css:
```css
.cta-button.play-game {
  background: linear-gradient(135deg, #7e22ce, #00b4d8);
  color: #fff;
  border: none;
}

.cta-button.play-game:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* Hide game mode on mobile */
@media (max-width: 768px) {
  .cta-button.play-game { display: none; }
}
```

**Step 3:** Production build check:
```bash
cd /home/hh-pi/projects/portfolio/.worktrees/feat-game-mode
npm run build 2>&1 | tail -10
```

Expected: `✓ built in Xs` with no errors.

**Step 4:** Final commit:
```bash
git add src/App.jsx src/components/Hero.jsx src/components/Hero.css
git commit -m "feat: wire game mode into App and Hero with Play button"
```

**Step 5:** Push branch and open PR:
```bash
gh auth setup-git
git push -u origin feat/game-mode
gh pr create --title "feat: 2.5D game mode" --body "Adds interactive RPG game mode to portfolio. 🎮" --base master
```

---

## Commit Order Recap

```
feat: game mode toggle state + Play button (hidden mobile)
feat: pixelate transition animation enter/exit
feat: GameMode.jsx shell with canvas, keyboard listener, ESC exit
feat: useGameLoop hook with requestAnimationFrame + delta time
feat: Han pixel art sprite (4-directional, walk + idle)
feat: 4-room world data (Living Room, Workshop, Gallery, Contact)
feat: canvas renderer with room backgrounds and Y-sorted objects
feat: WASD movement with AABB collision detection
feat: camera system with lerp follow and boundary clamping
feat: Y-sorting and translucency (40% alpha behind objects)
feat: GameOverlay interact prompts and popup cards
feat: wire game mode into App and Hero with Play button
```
