"use client"

import { useEffect } from "react"

/**
 * Shared scroll-lock utility using a global counter.
 * Multiple consumers (mobile menu, modal) can lock independently
 * without clobbering each other's body overflow state.
 */
let lockCount = 0

function lock() {
  lockCount++
  if (lockCount === 1) {
    document.body.style.overflow = "hidden"
  }
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.body.style.overflow = ""
  }
}

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      lock()
      return () => unlock()
    }
  }, [isLocked])
}
