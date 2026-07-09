/**
 * umais-ali, GSAP-driven "character" layer.
 *
 * Pure enhancement: every animation here degrades to an instant, fully
 * visible state if GSAP fails to load or the user prefers reduced motion.
 * Nothing in here owns accessibility/state (that stays in site-main.js);
 * this file only ever touches opacity/transform for visual polish.
 */
;(() => {
  const hasGsap = typeof window.gsap !== 'undefined'
  const gsap = window.gsap

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  const canAnimate = hasGsap && !prefersReducedMotion()

  // ─── Bento card reveal-on-scroll ───────────────────────────────────────
  // Each card settles in independently as it crosses the viewport threshold,
  // no inter-card stagger math needed, the cascading feel comes naturally
  // from scroll position.
  const reveals = document.querySelectorAll('.reveal')
  if (reveals.length) {
    if (canAnimate) {
      gsap.set(reveals, { y: 32, scale: 0.97 })
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            gsap.to(entry.target, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              ease: 'expo.out',
            })
            io.unobserve(entry.target)
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
      )
      for (const el of reveals) io.observe(el)
    } else {
      for (const el of reveals) el.style.opacity = '1'
    }
  }

  // ─── Bento card magnetic tilt (desktop, fine pointer only) ─────────────
  if (canAnimate && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const MAX_TILT = 7
    for (const card of document.querySelectorAll('.bento-card')) {
      const quickRotateX = gsap.quickTo(card, 'rotateX', { duration: 0.5, ease: 'power3.out' })
      const quickRotateY = gsap.quickTo(card, 'rotateY', { duration: 0.5, ease: 'power3.out' })
      const quickScale = gsap.quickTo(card, 'scale', { duration: 0.5, ease: 'power3.out' })
      gsap.set(card, { transformPerspective: 900, transformOrigin: 'center' })

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width - 0.5
        const py = (e.clientY - rect.top) / rect.height - 0.5
        quickRotateX(-py * MAX_TILT * 2)
        quickRotateY(px * MAX_TILT * 2)
        quickScale(1.015)
      })
      card.addEventListener('mouseleave', () => {
        quickRotateX(0)
        quickRotateY(0)
        quickScale(1)
      })
    }
  }

  // ─── Hero stat count-up ─────────────────────────────────────────────────
  const statEls = document.querySelectorAll('#top .num-display')
  if (canAnimate && statEls.length) {
    for (const [idx, el] of statEls.entries()) {
      const raw = el.textContent?.trim() ?? ''
      const match = raw.match(/^(\d+(?:\.\d+)?)(.*)$/)
      if (!match) continue
      const target = Number.parseFloat(match[1])
      const suffix = match[2]
      const counter = { value: 0 }
      gsap.to(counter, {
        value: target,
        duration: 1.3,
        delay: 0.5 + idx * 0.12,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = `${Math.round(counter.value)}${suffix}`
        },
        onComplete: () => {
          el.textContent = raw
        },
      })
    }
  }

  // ─── Project modal content stagger ─────────────────────────────────────
  document.body.addEventListener('htmx:afterSettle', (e) => {
    const target = e.detail?.target
    if (!(target instanceof HTMLElement) || target.id !== 'project-modal-content') return
    const blocks = target.querySelectorAll('.modal-reveal')
    if (!blocks.length) return

    if (canAnimate) {
      gsap.fromTo(
        blocks,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.07, delay: 0.05 },
      )
    } else {
      for (const el of blocks) el.style.opacity = '1'
    }
  })
})()
