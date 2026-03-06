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

  const playerRef   = useRef(createPlayerState())
  const cameraRef   = useRef({ x: 0, y: 0 })
  const keysRef     = useRef({})

  const [transitionState, setTransitionState] = useState('entering')
  const [overlayState, setOverlayState]       = useState({ interactLabel: null, popup: null })
  const [currentRoomName, setCurrentRoomName] = useState('Living Room')

  useEffect(() => {
    const timer = setTimeout(() => setTransitionState('playing'), 850)
    return () => clearTimeout(timer)
  }, [])

  const triggerExit = useCallback(() => {
    if (transitionState === 'exiting') return
    if (overlayState.popup) {
      setOverlayState(s => ({ ...s, popup: null }))
      return
    }
    setTransitionState('exiting')
    setTimeout(() => onExit(), 850)
  }, [transitionState, overlayState.popup, onExit])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') triggerExit() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [triggerExit])

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

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      // Scale canvas logical size so the 600px-tall world fills the viewport height.
      // CSS stretches the canvas to 100% width/height (image-rendering: pixelated).
      const scale = window.innerHeight / WORLD_HEIGHT
      canvas.width  = Math.round(window.innerWidth / scale)
      canvas.height = WORLD_HEIGHT
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const { start, stop } = useGameLoop((dt) => {
    if (transitionState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    updatePlayer(playerRef.current, keysRef.current, ROOMS, dt, WORLD_WIDTH, WORLD_HEIGHT)

    const cam    = cameraRef.current
    const player = playerRef.current
    const targetX = player.x - canvas.width  / 2
    const targetY = player.y - canvas.height / 2
    const CAM_SPEED = 0.12
    const lerp = 1 - Math.pow(1 - CAM_SPEED, dt * 60)
    cam.x += (targetX - cam.x) * lerp
    cam.y += (targetY - cam.y) * lerp
    cam.x = Math.max(0, Math.min(cam.x, WORLD_WIDTH  - canvas.width))
    cam.y = Math.max(0, Math.min(cam.y, WORLD_HEIGHT - canvas.height))

    const roomIdx = Math.floor(player.x / 800)
    const room = ROOMS[Math.min(roomIdx, ROOMS.length - 1)]
    if (room && room.name !== currentRoomName) setCurrentRoomName(room.name)

    let nearZone = null
    for (const r of ROOMS) {
      for (const zone of r.interactZones) {
        const { x: zx, y: zy, w: zw, h: zh } = zone
        if (player.x > zx && player.x < zx + zw && player.y > zy && player.y < zy + zh) {
          nearZone = zone
          break
        }
      }
    }

    if (nearZone && (keysRef.current['w'] || keysRef.current['W'] || keysRef.current['ArrowUp'])) {
      if (!keysRef.current.__interactFired) {
        keysRef.current.__interactFired = true
        setOverlayState(s => ({ ...s, popup: nearZone.action }))
      }
    } else {
      keysRef.current.__interactFired = false
    }

    setOverlayState(s => ({ ...s, interactLabel: nearZone ? `[W] ${nearZone.label}` : null }))

    drawFrame(ctx, canvas, playerRef.current, cameraRef.current, ROOMS)
  })

  useEffect(() => { start(); return () => stop() }, [start, stop])

  return (
    <div className={`game-mode-root ${transitionState}`} ref={rootRef}>
      <canvas ref={canvasRef} />
      <div className="pixelate-overlay" />
      <div className="game-room-label">{currentRoomName}</div>
      <div className="game-controls-hint">WASD / ↑↓←→ Move &nbsp;|&nbsp; W Interact &nbsp;|&nbsp; ESC Exit</div>
      <button className="game-exit-btn" onClick={triggerExit}>✕ ESC</button>
      <GameOverlay
        overlayState={overlayState}
        onDismiss={() => setOverlayState(s => ({ ...s, popup: null }))}
      />
    </div>
  )
}
