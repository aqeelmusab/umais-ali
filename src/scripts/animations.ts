import { animate } from 'motion'

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

    // A plain, single-shot IntersectionObserver (rather than Motion's
    // `inView`, which re-fires every time an element re-enters the
    // viewport) so each card plays its entrance exactly once and never
    // re-animates on scroll-back-up-then-down.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const hEl = entry.target as HTMLElement
          observer.unobserve(hEl)
          hEl.style.pointerEvents = 'auto'
          const idx = revealOrder.get(hEl) ?? 0
          const animation = animate(
            hEl,
            {
              opacity: [0, 1],
              y: [64, 0],
              filter: ['blur(14px)', 'blur(0px)'],
            },
            {
              duration: 1.1,
              delay: Math.min(idx, 4) * 0.1,
              ease: [0.16, 1, 0.3, 1],
            },
          )
          cleanups.push(() => animation.cancel())
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -8% 0px',
      },
    )
    for (const el of reveals) observer.observe(el)

    cleanups.push(() => {
      observer.disconnect()
      for (const el of reveals) {
        el.style.opacity = ''
        el.style.pointerEvents = ''
      }
    })
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
