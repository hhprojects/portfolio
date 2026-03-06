import { useEffect, useRef, useState, useCallback } from 'react'
import './GameMode.css'
import { useGameLoop } from './useGameLoop'
import { ROOMS, ROOM_W, ROOM_H, WORLD_W, WORLD_H } from './rooms'
import { drawFrame } from './renderer'
import { createPlayerState, updatePlayer } from './physics'
import GameOverlay from './GameOverlay'


export default function GameMode({ onExit }) {
  const canvasRef   = useRef(null)
  const rootRef     = useRef(null)

  const playerRef   = useRef(createPlayerState())
  const cameraRef   = useRef({ x: 0, y: 0 })
  const keysRef     = useRef({})

  // Bug 1 fix: one-shot flag so quick E taps aren't missed between frames
  const interactPressedRef  = useRef(false)
  // Bug 3 fix: track last label to avoid calling setOverlayState every frame
  const lastInteractLabelRef = useRef(null)

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
    const down = (e) => {
      keysRef.current[e.key] = true
      // Bug 1 fix: capture E press as a one-shot flag
      if (e.key === 'e' || e.key === 'E') interactPressedRef.current = true
    }
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
      // Scale so world width always fills viewport width exactly.
      // canvas.height is computed to maintain that scale for the viewport height.
      const scale = window.innerWidth / WORLD_W
      canvas.width  = WORLD_W
      canvas.height = Math.round(window.innerHeight / scale)
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

    updatePlayer(playerRef.current, keysRef.current, ROOMS, dt, WORLD_W, WORLD_H)

    const cam    = cameraRef.current
    const player = playerRef.current
    const CAM_SPEED = 0.12
    const lerp = 1 - Math.pow(1 - CAM_SPEED, dt * 60)

    // Camera: X is fixed at 0 (world width = canvas width, both columns always visible).
    // Y follows the player with a soft lerp.
    const targetY = player.y - canvas.height / 2
    cam.x = 0
    cam.y += (targetY - cam.y) * lerp
    cam.y = Math.max(0, Math.min(cam.y, WORLD_H - canvas.height))

    const col  = player.x >= ROOM_W ? 1 : 0
    const row  = player.y >= ROOM_H ? 1 : 0
    const room = ROOMS.find(r => r.col === col && r.row === row)
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

    // Update nearInteract so the ! exclamation bubble renders above the player sprite
    playerRef.current.nearInteract = !!nearZone

    // Bug 1 fix: use event-driven one-shot flag instead of polling keysRef
    if (nearZone && interactPressedRef.current) {
      interactPressedRef.current = false
      setOverlayState(s => ({ ...s, popup: nearZone.action }))
    }

    // Bug 3 fix: only call setOverlayState when the label actually changes
    const newLabel = nearZone ? `[E] ${nearZone.label}` : null
    if (newLabel !== lastInteractLabelRef.current) {
      lastInteractLabelRef.current = newLabel
      setOverlayState(s => ({ ...s, interactLabel: newLabel }))
    }

    drawFrame(ctx, canvas, playerRef.current, cameraRef.current, ROOMS)
  })

  useEffect(() => { start(); return () => stop() }, [start, stop])

  return (
    <div className={`game-mode-root ${transitionState}`} ref={rootRef}>
      <canvas ref={canvasRef} />
      <div className="pixelate-overlay" />
      <div className="game-room-label">{currentRoomName}</div>
      <div className="game-controls-hint">WASD / ↑↓←→ Move &nbsp;|&nbsp; E Interact &nbsp;|&nbsp; ESC Exit</div>
      <button className="game-exit-btn" onClick={triggerExit}>✕ ESC</button>
      <GameOverlay
        overlayState={overlayState}
        onDismiss={() => setOverlayState(s => ({ ...s, popup: null }))}
      />
    </div>
  )
}
