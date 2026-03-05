import { useRef, useCallback, useEffect } from 'react'

/**
 * requestAnimationFrame game loop hook.
 * Calls callback(dt) every frame, where dt is delta time in seconds.
 * dt is capped at 50ms (0.05s) to prevent physics tunneling on tab switch.
 */
export function useGameLoop(callback) {
  const rafRef       = useRef(null)
  const lastTimeRef  = useRef(null)
  const callbackRef  = useRef(callback)
  const activeRef    = useRef(false)

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
    if (activeRef.current) return
    activeRef.current  = true
    lastTimeRef.current = null

    const loop = (timestamp) => {
      if (!activeRef.current) return
      if (lastTimeRef.current !== null) {
        const rawDt = (timestamp - lastTimeRef.current) / 1000
        const dt    = Math.min(rawDt, 0.05)
        callbackRef.current(dt)
      }
      lastTimeRef.current = timestamp
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [])

  useEffect(() => () => stop(), [stop])

  return { start, stop }
}
