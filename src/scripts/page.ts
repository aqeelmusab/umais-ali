// Lightweight page interactions. Focus stays on performance, simplicity, and progressive enhancement.

import { animate, stagger } from 'motion'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function easeOutQuart(t: number): number {
  return 1 - (1 - t) ** 4
}

function clampScroll(value: number): number {
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  return Math.min(max, Math.max(0, value))
}

let smoothScrollFrame = 0

export function smoothScrollTo(top: number, duration = 900): void {
  if (prefersReducedMotion()) {
    window.scrollTo(0, top)
    return
  }

  cancelAnimationFrame(smoothScrollFrame)
  const start = window.scrollY
  const target = clampScroll(top)
  const distance = target - start
  const startTime = performance.now()

  function tick(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(1, elapsed / duration)
    window.scrollTo(0, Math.round(start + distance * easeOutQuart(progress)))
    if (progress < 1) {
      smoothScrollFrame = requestAnimationFrame(tick)
    }
  }

  smoothScrollFrame = requestAnimationFrame(tick)
}

// ─── Scroll locking handlers ──────────────────────────────────────────
let scrollLockCount = 0

export function lockScroll(): void {
  if (scrollLockCount === 0) {
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`
    }
    document.documentElement.classList.add('is-scroll-locked')
    document.body.classList.add('is-scroll-locked')
  }
  scrollLockCount++
}

export function unlockScroll(): void {
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0) {
    document.body.classList.remove('is-scroll-locked')
    document.documentElement.classList.remove('is-scroll-locked')
    document.body.style.removeProperty('padding-right')
  }
}

// ─── Anchor Target Resolution ─────────────────────────────────────────
function getAnchorTarget(link: HTMLAnchorElement): HTMLElement | null {
  const rawHref = link.getAttribute('href')
  if (!rawHref || rawHref === '#') return null

  let url: URL
  try {
    url = new URL(rawHref, window.location.href)
  } catch {
    return null
  }

  if (
    url.origin !== window.location.origin ||
    url.pathname !== window.location.pathname ||
    !url.hash
  ) {
    return null
  }
  return document.getElementById(decodeURIComponent(url.hash.slice(1)))
}

function scrollToAnchorTarget(target: HTMLElement): void {
  const nav = document.getElementById('site-nav')
  const navOffset = nav
    ? Math.ceil(nav.getBoundingClientRect().height + nav.getBoundingClientRect().top + 16)
    : 0
  const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - navOffset)
  smoothScrollTo(top)
  if (target.id) {
    history.pushState(null, '', `#${target.id}`)
  }
}

// ─── Focus trapping logic ────────────────────────────────────────────
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function trapFocus(container: HTMLElement, e: KeyboardEvent): void {
  const focusables = container.querySelectorAll(FOCUSABLE_SELECTOR) as NodeListOf<HTMLElement>
  if (focusables.length === 0) return
  if (focusables.length === 1) {
    e.preventDefault()
    focusables[0]?.focus()
    return
  }
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last?.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first?.focus()
  }
}

// Initialize lightweight page controls when DOM is ready
export function initPageInteractions(): void {
  // ─── Header: glass transition on scroll ───
  const nav = document.getElementById('site-nav')
  if (nav) {
    let navTicking = false
    const updateNavState = () => {
      const isScrolled = nav.classList.contains('is-scrolled')
      const shouldScroll = isScrolled ? window.scrollY > 10 : window.scrollY > 44
      nav.classList.toggle('is-scrolled', shouldScroll)
      navTicking = false
    }
    const onScrollNav = () => {
      if (!navTicking) {
        navTicking = true
        requestAnimationFrame(updateNavState)
      }
    }
    window.addEventListener('scroll', onScrollNav, { passive: true })
    updateNavState()
  }

  // ─── Mobile Menu ───
  const menu = document.getElementById('mobile-menu') as HTMLElement | null
  const menuToggle = document.getElementById('mobile-menu-toggle') as HTMLElement | null
  const menuNavLinks = menu ? (Array.from(menu.querySelectorAll('nav a')) as HTMLElement[]) : []
  const menuFooter = menu?.querySelector('[data-menu-footer]') as HTMLElement | null
  const menuStaggerItems = [...menuNavLinks, ...(menuFooter ? [menuFooter] : [])]

  // Keep track of the in-flight sheet animation so a rapid open/close toggle
  // (e.g. double-tapping the trigger) cancels the previous run instead of
  // fighting it.
  let menuAnimation: ReturnType<typeof animate> | null = null

  function resetMenuStaggerItems() {
    for (const el of menuStaggerItems) {
      el.style.removeProperty('opacity')
      el.style.removeProperty('transform')
    }
  }

  function openMenu() {
    if (!menu) return
    if (menu.classList.contains('is-open')) return
    menuAnimation?.stop()

    menu.removeAttribute('inert')
    menu.classList.add('is-open')
    menu.setAttribute('aria-hidden', 'false')
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'true')
      menuToggle.setAttribute('aria-label', 'Close menu')
    }
    lockScroll()

    if (prefersReducedMotion()) {
      menu.style.display = 'flex'
      menu.style.removeProperty('opacity')
      menu.style.removeProperty('transform')
      resetMenuStaggerItems()
    } else {
      // Set the pre-animation state before revealing the sheet so nothing
      // flashes fully open for a frame before Motion takes over. The sheet
      // itself only ever fades (no scale/translate): this is a full-bleed
      // `inset-0`-style overlay, so scaling or shifting it revealed a sliver
      // of the real page at the edges mid-transition. All of the actual
      // motion lives in the staggered nav-link reveal below instead.
      menu.style.opacity = '0'
      for (const el of menuStaggerItems) {
        el.style.opacity = '0'
        el.style.transform = 'translateY(1.1rem)'
      }

      menu.style.display = 'flex'

      menuAnimation = animate(menu, { opacity: [0, 1] }, { duration: 0.3, ease: 'easeOut' })
      animate(
        menuStaggerItems,
        { opacity: [0, 1], y: ['1.1rem', '0rem'] },
        {
          duration: 0.55,
          delay: stagger(0.05, { startDelay: 0.12 }),
          ease: [0.16, 1, 0.3, 1],
        },
      )
    }

    // Focus moves into the sheet's own nav links (not the external toggle
    // button, which sits outside `menu` in the DOM) so the Tab-trap below,
    // which only cycles through `menu`'s focusables, works correctly from
    // the very first keypress.
    requestAnimationFrame(() => {
      menuNavLinks[0]?.focus({ preventScroll: true })
    })
  }

  function closeMenu() {
    if (!menu) return
    if (!menu.classList.contains('is-open')) return
    if (menu.contains(document.activeElement) && menuToggle) {
      menuToggle.focus({ preventScroll: true })
    }
    menuAnimation?.stop()

    menu.classList.remove('is-open')
    menu.setAttribute('aria-hidden', 'true')
    menu.setAttribute('inert', '')
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false')
      menuToggle.setAttribute('aria-label', 'Open menu')
    }
    unlockScroll()

    const finishClose = () => {
      menu.style.display = 'none'
      menu.style.removeProperty('opacity')
      menu.style.removeProperty('transform')
      resetMenuStaggerItems()
    }

    if (prefersReducedMotion()) {
      finishClose()
      return
    }

    menuAnimation = animate(menu, { opacity: [1, 0] }, { duration: 0.22, ease: 'easeIn' })
    menuAnimation.finished.then(finishClose).catch(finishClose)
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      // Cheap, one-shot, transform-only press feedback (the bars-to-X morph
      // itself is CSS, driven by the `aria-expanded` attribute this click
      // toggles via open/closeMenu below).
      if (!prefersReducedMotion()) {
        animate(menuToggle, { scale: [1, 0.85, 1] }, { duration: 0.35, ease: [0.16, 1, 0.3, 1] })
      }
      if (menu?.classList.contains('is-open')) {
        closeMenu()
      } else {
        openMenu()
      }
    })
  }
  if (menu) {
    const closeLinks = menu.querySelectorAll('[data-close-menu]')
    for (const el of closeLinks) {
      el.addEventListener('click', closeMenu)
    }
  }

  // ─── Click event delegator for links & smooth anchors ───
  document.addEventListener('click', (e) => {
    const targetEl = e.target as HTMLElement | null
    if (!targetEl) return
    const link = targetEl.closest('a[href]') as HTMLAnchorElement | null
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return

    const target = getAnchorTarget(link)
    if (!target) return

    e.preventDefault()
    if (menu?.classList.contains('is-open')) {
      closeMenu()
    }
    requestAnimationFrame(() => scrollToAnchorTarget(target))
  })

  // ─── Keyboard interactions ───
  document.addEventListener('keydown', (e) => {
    if (
      e.key === '/' &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !menu?.classList.contains('is-open')
    ) {
      const active = document.activeElement
      const isTyping =
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          (active as HTMLElement).isContentEditable)
      if (!isTyping) {
        const work = document.getElementById('work')
        if (work) {
          e.preventDefault()
          scrollToAnchorTarget(work)
        }
      }
    }

    if (e.key === 'Escape' && menu?.classList.contains('is-open')) {
      closeMenu()
    }

    if (menu?.classList.contains('is-open') && e.key === 'Tab') {
      trapFocus(menu, e)
    }
  })

  // ─── Scroll-to-top button ───
  const stt = document.getElementById('scroll-top')
  if (stt) {
    const onScrollStt = () => stt.classList.toggle('is-visible', window.scrollY > 400)
    window.addEventListener('scroll', onScrollStt, { passive: true })
    stt.addEventListener('click', () => smoothScrollTo(0, 800))
    onScrollStt()
  }

  // ─── Theme toggle mechanics ───
  const themeBtn = document.getElementById('theme-toggle')
  if (themeBtn) {
    const setLabel = () => {
      const t = document.documentElement.getAttribute('data-theme') || 'light'
      themeBtn.setAttribute(
        'aria-label',
        t === 'light' ? 'Switch to dark theme' : 'Switch to light theme',
      )
      themeBtn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false')
    }

    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light'
      const next = current === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', next)
      try {
        localStorage.setItem('theme', next)
      } catch {}
      setLabel()

      // The sun/moon crossfade morph itself is pure CSS (transform/opacity
      // transitions keyed off `data-theme`, see global.css), so it costs
      // nothing here. This adds a single, cheap, one-shot spring "squish"
      // on top for tactile click feedback; transform-only, GPU-composited,
      // and only ever runs in response to a real click.
      if (!prefersReducedMotion()) {
        animate(
          themeBtn,
          { scale: [1, 0.82, 1.08, 1] },
          { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
        )
      }
    })
    setLabel()
  }
}
