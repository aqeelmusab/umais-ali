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
let lockedScrollY = 0

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
    lockedScrollY = window.scrollY
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`
    }
    document.body.style.top = `-${lockedScrollY}px`
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
    document.body.style.removeProperty('top')
    window.scrollTo(0, lockedScrollY)
    lockedScrollY = 0
  }
}

function syncThemeMeta(theme: 'light' | 'dark'): void {
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#000000' : '#fbf8f1')
}

function syncVisualViewportVars(): void {
  const viewport = window.visualViewport
  const rootStyle = document.documentElement.style
  rootStyle.setProperty('--visual-viewport-height', `${viewport?.height ?? window.innerHeight}px`)
  rootStyle.setProperty('--visual-viewport-offset-top', `${viewport?.offsetTop ?? 0}px`)
}

function initVisualViewportVars(): void {
  syncVisualViewportVars()

  const viewport = window.visualViewport
  if (!viewport) {
    window.addEventListener('resize', syncVisualViewportVars, { passive: true })
    return
  }

  viewport.addEventListener('resize', syncVisualViewportVars, { passive: true })
  viewport.addEventListener('scroll', syncVisualViewportVars, { passive: true })
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

// ─── Image skeleton loaders ──────────────────────────────────────────
// Fade each project image in once it finishes downloading and dismiss the
// shimmer placeholder (see `.media-frame`/`.media-img` in global.css). Images
// already cached by the browser resolve immediately.
function initImageSkeletons(): void {
  const images = document.querySelectorAll<HTMLImageElement>('img.media-img')
  images.forEach((img) => {
    const frame = img.closest<HTMLElement>('.media-frame')
    if (!frame) return
    const markLoaded = () => frame.classList.add('is-loaded')
    if (img.complete && img.naturalWidth > 0) {
      markLoaded()
      return
    }
    // `error` also clears the shimmer so a broken image never spins forever.
    img.addEventListener('load', markLoaded, { once: true })
    img.addEventListener('error', markLoaded, { once: true })
  })
}

// Initialize lightweight page controls when DOM is ready
export function initPageInteractions(): void {
  initVisualViewportVars()
  initImageSkeletons()

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
      el.style.removeProperty('filter')
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
      // itself only ever fades (no scale/translate/blur): it's a full-bleed
      // `inset-0` overlay, so scaling or shifting it revealed a sliver of
      // the real page at the edges mid-transition, and a `filter: blur()`
      // spanning the entire viewport turned out to be expensive enough on
      // real mobile GPUs to visibly jank (even though it looked smooth in
      // desktop devtools emulation). The staggered nav-link/footer reveal
      // below keeps the full opacity + y + blur recipe from the project
      // card entrance animation (src/scripts/animations.ts) though, since
      // blurring these small text rows one at a time is cheap regardless
      // of device - it's only blurring the entire viewport at once that
      // was expensive.
      menu.style.opacity = '0'
      for (const el of menuStaggerItems) {
        el.style.opacity = '0'
        el.style.transform = 'translateY(1.75rem)'
        el.style.filter = 'blur(8px)'
      }

      menu.style.display = 'flex'

      menuAnimation = animate(menu, { opacity: [0, 1] }, { duration: 0.35, ease: 'easeOut' })
      animate(
        menuStaggerItems,
        { opacity: [0, 1], y: ['1.75rem', '0rem'], filter: ['blur(8px)', 'blur(0px)'] },
        {
          duration: 0.6,
          delay: stagger(0.06, { startDelay: 0.12 }),
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
      // The bars-to-X morph is pure CSS, driven by the `aria-expanded`
      // attribute toggled below. A Motion press-bounce used to run
      // alongside it here, but the two competing transform animations
      // (WAAPI on the button + CSS transition on its child bars) visibly
      // fought each other on real mobile devices, so the morph is left to
      // run on its own.
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
      themeBtn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false')
    }

    // A bright, multi-ring pulse at the click point - the NameDrop-style
    // "devices have found each other" flash - layered above the
    // view-transition circle-reveal below. A hot core flashes then two thin
    // rings ripple outward and fade, `mix-blend-mode: screen` so they read
    // as actual light rather than a flat gradient smear. The color pair
    // stays in the SAME gold hue family as the site's actual `--brand`
    // (~hue 70-80, see design-tokens memory) in both directions, rather
    // than introducing an unrelated blue for "night" - the site has no
    // blue anywhere in its identity, so a cool moonlight-blue ripple read
    // as off-brand. Direction is instead signaled by saturation/lightness:
    // switching TO light is vivid, saturated sunrise gold; switching TO
    // dark is the same hue desaturated down to a pale, silvery "moonlit
    // gold". Everything here only ever animates `transform`/`opacity` (the
    // blur is a static, never-animated filter), so it's cheap and
    // GPU-composited; the whole cluster is a handful of throwaway elements
    // removed once they finish.
    function spawnThemeGlow(x: number, y: number, next: 'light' | 'dark') {
      const [core1, core2, ringColor] =
        next === 'dark'
          ? ['oklch(0.96 0.015 85)', 'oklch(0.62 0.035 80)', 'oklch(0.68 0.03 82)']
          : ['oklch(0.97 0.04 85)', 'oklch(0.8 0.16 70)', 'oklch(0.82 0.15 72)']

      const container = document.createElement('div')
      container.setAttribute('aria-hidden', 'true')
      container.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:0;height:0;pointer-events:none;z-index:2147483647;`
      document.body.appendChild(container)

      const maxDim = Math.max(window.innerWidth, window.innerHeight)

      const core = document.createElement('div')
      core.style.cssText = `position:absolute;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:9999px;mix-blend-mode:screen;filter:blur(3px);background:radial-gradient(circle, ${core1} 0%, ${core2} 40%, transparent 72%);`
      container.appendChild(core)

      const makeRing = () => {
        const ring = document.createElement('div')
        ring.style.cssText = `position:absolute;left:0;top:0;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:9999px;mix-blend-mode:screen;filter:blur(1px);border:2px solid ${ringColor};box-shadow:0 0 14px 1px ${ringColor};`
        container.appendChild(ring)
        return ring
      }
      const ring1 = makeRing()
      const ring2 = makeRing()

      const ring1Scale = (maxDim * 0.5) / 56
      const ring2Scale = (maxDim * 0.72) / 56

      const coreAnim = animate(
        core,
        { transform: ['scale(0)', 'scale(1.7)', 'scale(1)'], opacity: [0, 1, 0] },
        { duration: 1, ease: [0.16, 1, 0.3, 1] },
      )
      const ring1Anim = animate(
        ring1,
        { transform: ['scale(0.2)', `scale(${ring1Scale})`], opacity: [1, 0] },
        { duration: 0.85, ease: 'easeOut' },
      )
      const ring2Anim = animate(
        ring2,
        { transform: ['scale(0.2)', `scale(${ring2Scale})`], opacity: [0.8, 0] },
        { duration: 1.05, delay: 0.12, ease: 'easeOut' },
      )

      const cleanup = () => container.remove()
      Promise.all([coreAnim.finished, ring1Anim.finished, ring2Anim.finished])
        .then(cleanup)
        .catch(cleanup)
    }

    function applyTheme(next: 'light' | 'dark') {
      document.documentElement.setAttribute('data-theme', next)
      try {
        localStorage.setItem('theme', next)
      } catch {}
      setLabel()

      // Keep the browser chrome (iOS status/toolbar tint, Android address
      // bar) matching the newly-active theme; see public/js/theme-init.js
      // for the equivalent on first load.
      syncThemeMeta(next)
    }

    themeBtn.addEventListener('click', (e) => {
      const current = document.documentElement.getAttribute('data-theme') || 'light'
      const next = current === 'light' ? 'dark' : 'light'
      const reduced = prefersReducedMotion()

      // NameDrop-style circular reveal: the new theme washes in as an
      // expanding circle from wherever the toggle was clicked (falls back
      // to the button's own center for keyboard activation, where
      // clientX/Y are 0). Uses the native View Transitions API rather than
      // manually snapshotting the page, so the "old vs. new screenshot"
      // work is done by the browser's compositor, not JS/canvas - the only
      // animation this script drives directly is the `clip-path` circle
      // radius on the transition's own pseudo-element. Feature-detected
      // and skipped under reduced motion, in which case it's an instant
      // swap exactly like before.
      if (!reduced && typeof document.startViewTransition === 'function') {
        const mouseEvent = e as MouseEvent
        const rect = themeBtn.getBoundingClientRect()
        const x = mouseEvent.clientX || rect.left + rect.width / 2
        const y = mouseEvent.clientY || rect.top + rect.height / 2
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        )

        spawnThemeGlow(x, y, next)

        // A short beat between the glow igniting and the theme actually
        // washing in - NameDrop's card doesn't slide up the instant the
        // devices touch either, the glow gets a moment to register first.
        window.setTimeout(() => {
          const transition = document.startViewTransition(() => applyTheme(next))
          transition.ready
            .then(() => {
              document.documentElement.animate(
                {
                  clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`,
                  ],
                },
                {
                  duration: 700,
                  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  pseudoElement: '::view-transition-new(root)',
                },
              )
            })
            .catch(() => {})
        }, 120)
      } else {
        applyTheme(next)
      }

      // The sun/moon crossfade morph itself is pure CSS (transform/opacity
      // transitions keyed off `data-theme`, see global.css), so it costs
      // nothing here. This adds a single, cheap, one-shot spring "squish"
      // on top for tactile click feedback; transform-only, GPU-composited,
      // and only ever runs in response to a real click.
      if (!reduced) {
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
