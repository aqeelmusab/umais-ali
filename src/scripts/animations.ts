import { animate, inView, motionValue, springValue, styleEffect } from 'motion'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function initAnimations(): () => void {
  const cleanups: Array<() => void> = []

  if (prefersReducedMotion()) {
    // Reveal all reveals immediately
    const reveals = document.querySelectorAll('.reveal') as NodeListOf<HTMLElement>
    for (const el of reveals) {
      el.style.opacity = '1'
      el.style.pointerEvents = 'auto'
      cleanups.push(() => {
        el.style.opacity = ''
        el.style.pointerEvents = ''
      })
    }
    return () => {
      for (const clean of cleanups) clean()
    }
  }

  // ─── Bento Card Reveal-on-Scroll ─────────────────────────────────────
  const reveals = document.querySelectorAll('.reveal') as NodeListOf<HTMLElement>
  if (reveals.length > 0) {
    // Set initial custom state for styles to prevent layout shift before animation
    for (const el of reveals) {
      el.style.opacity = '0'
    }

    // Index each card up front so cards that enter the viewport together
    // (e.g. two side-by-side in the same row) cascade in with a slight
    // stagger instead of popping in simultaneously, which read as flat/cheap.
    const revealOrder = new Map<Element, number>()
    reveals.forEach((el, idx) => {
      revealOrder.set(el, idx)
    })

    const stopInView = inView(
      '.reveal',
      (element) => {
        const hEl = element as HTMLElement
        hEl.style.pointerEvents = 'auto'
        const idx = revealOrder.get(hEl) ?? 0
        const animation = animate(
          hEl,
          {
            opacity: [0, 1],
            y: [40, 0],
            scale: [0.95, 1],
          },
          {
            duration: 0.9,
            delay: Math.min(idx, 4) * 0.09,
            ease: [0.22, 1, 0.36, 1],
          },
        )
        return () => {
          animation.cancel()
        }
      },
      {
        amount: 0.15,
        margin: '0px 0px -8% 0px',
      },
    )

    cleanups.push(() => {
      stopInView()
      for (const el of reveals) {
        el.style.opacity = ''
        el.style.pointerEvents = ''
      }
    })
  }

  // ─── Bento Card Magnetic Tilt ────────────────────────────────────────
  const isHoverFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (isHoverFine) {
    const cards = document.querySelectorAll('.bento-card') as NodeListOf<HTMLElement>
    const MAX_TILT = 7

    for (const card of cards) {
      card.style.perspective = '900px'
      card.style.transformOrigin = 'center'

      const targetRotateX = motionValue(0)
      const targetRotateY = motionValue(0)
      const targetScale = motionValue(1)

      const rotateX = springValue(targetRotateX, { stiffness: 220, damping: 24 })
      const rotateY = springValue(targetRotateY, { stiffness: 220, damping: 24 })
      const scale = springValue(targetScale, { stiffness: 220, damping: 24 })

      const cancelStyle = styleEffect(card, {
        rotateX,
        rotateY,
        scale,
      })

      const handlePointerMove = (e: PointerEvent) => {
        const rect = card.getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width - 0.5
        const py = (e.clientY - rect.top) / rect.height - 0.5

        targetRotateX.set(-py * MAX_TILT * 2)
        targetRotateY.set(px * MAX_TILT * 2)
        targetScale.set(1.015)
      }

      const handlePointerLeave = () => {
        targetRotateX.set(0)
        targetRotateY.set(0)
        targetScale.set(1)
      }

      card.addEventListener('pointermove', handlePointerMove)
      card.addEventListener('pointerleave', handlePointerLeave)
      card.addEventListener('pointercancel', handlePointerLeave)

      cleanups.push(() => {
        card.removeEventListener('pointermove', handlePointerMove)
        card.removeEventListener('pointerleave', handlePointerLeave)
        card.removeEventListener('pointercancel', handlePointerLeave)
        cancelStyle()
        // Nullify values
        targetRotateX.destroy()
        targetRotateY.destroy()
        targetScale.destroy()
        rotateX.destroy()
        rotateY.destroy()
        scale.destroy()
        card.style.removeProperty('perspective')
        card.style.removeProperty('transform-origin')
      })
    }
  }

  // ─── Hero statistic count-up ──────────────────────────────────────────
  const stats = document.querySelectorAll('#top .num-display') as NodeListOf<HTMLElement>
  if (stats.length > 0) {
    stats.forEach((el, idx) => {
      const original = el.textContent?.trim() ?? ''
      const match = original.match(/^(\d+(?:\.\d+)?)(.*)$/)
      if (!match) return

      const numStr = match[1]
      const suffix = match[2]
      if (!numStr || suffix === undefined) return

      const targetValue = parseFloat(numStr)

      const delay = 0.5 + idx * 0.12

      const controls = animate(0, targetValue, {
        duration: 1.3,
        delay,
        ease: 'easeOut',
        onUpdate: (value) => {
          el.textContent = `${Math.round(value)}${suffix}`
        },
        onComplete: () => {
          el.textContent = original
        },
      })

      cleanups.push(() => {
        controls.cancel()
        el.textContent = original
      })
    })
  }

  return () => {
    for (const clean of cleanups) clean()
  }
}
