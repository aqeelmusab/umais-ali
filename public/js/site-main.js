/**
 * umais-ali, small client glue.
 * Replaces the React hooks (useScrollLock, useFocusTrap, useInView, useScroll).
 * Stays vanilla so it composes with HTMX.
 */
;(() => {
  // ─── Scroll lock (single source of truth) ──────────────────────────────
  let scrollLockCount = 0
  let smoothScrollFrame = 0
  let wheelScrollFrame = 0
  let wheelTarget = 0
  let wheelCurrent = 0
  let isWheelScrolling = false

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  function easeOutQuart(t) {
    return 1 - (1 - t) ** 4
  }

  function clampScroll(value) {
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    return Math.min(max, Math.max(0, value))
  }

  function canScrollInside(target, deltaY) {
    let node = target instanceof Element ? target : null
    while (node && node !== document.body) {
      const style = window.getComputedStyle(node)
      const canScroll =
        /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight
      if (canScroll) {
        const canScrollDown =
          deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1
        const canScrollUp = deltaY < 0 && node.scrollTop > 1
        if (canScrollDown || canScrollUp) return true
      }
      node = node.parentElement
    }
    return false
  }

  function runWheelScroll() {
    wheelCurrent += (wheelTarget - wheelCurrent) * 0.16
    if (Math.abs(wheelTarget - wheelCurrent) < 0.5) {
      wheelCurrent = wheelTarget
      window.scrollTo(0, wheelCurrent)
      wheelScrollFrame = 0
      isWheelScrolling = false
      return
    }
    window.scrollTo(0, wheelCurrent)
    wheelScrollFrame = requestAnimationFrame(runWheelScroll)
  }

  function smoothScrollTo(top, duration = 900) {
    if (prefersReducedMotion()) {
      window.scrollTo(0, top)
      return
    }

    cancelAnimationFrame(smoothScrollFrame)
    cancelAnimationFrame(wheelScrollFrame)
    wheelScrollFrame = 0
    isWheelScrolling = false
    const start = window.scrollY
    const target = clampScroll(top)
    const distance = target - start
    const startTime = performance.now()

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      window.scrollTo(0, Math.round(start + distance * easeOutQuart(progress)))
      if (progress < 1) smoothScrollFrame = requestAnimationFrame(tick)
    }

    smoothScrollFrame = requestAnimationFrame(tick)
  }

  function onWheelSmooth(event) {
    if (
      prefersReducedMotion() ||
      document.documentElement.classList.contains('is-scroll-locked') ||
      event.ctrlKey ||
      event.metaKey ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
      canScrollInside(event.target, event.deltaY)
    )
      return

    event.preventDefault()
    cancelAnimationFrame(smoothScrollFrame)
    const deltaFactor = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? window.innerHeight : 1
    if (!isWheelScrolling) {
      wheelCurrent = window.scrollY
      wheelTarget = wheelCurrent
      isWheelScrolling = true
    }
    wheelTarget = clampScroll(wheelTarget + event.deltaY * deltaFactor)
    if (!wheelScrollFrame) wheelScrollFrame = requestAnimationFrame(runWheelScroll)
  }

  window.addEventListener('wheel', onWheelSmooth, { passive: false })
  window.addEventListener(
    'scroll',
    () => {
      if (!isWheelScrolling) wheelTarget = window.scrollY
    },
    { passive: true },
  )

  function lockScroll() {
    if (scrollLockCount === 0) {
      const scrollbarGap = window.innerWidth - document.documentElement.clientWidth
      if (scrollbarGap > 0) document.body.style.paddingRight = `${scrollbarGap}px`
      document.documentElement.classList.add('is-scroll-locked')
      document.body.classList.add('is-scroll-locked')
    }
    scrollLockCount++
  }
  function unlockScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1)
    if (scrollLockCount === 0) {
      document.body.classList.remove('is-scroll-locked')
      document.documentElement.classList.remove('is-scroll-locked')
      document.body.style.removeProperty('padding-right')
    }
  }

  // ─── Smooth in-page anchor scrolling ──────────────────────────────────
  function getAnchorTarget(link) {
    const rawHref = link.getAttribute('href')
    if (!rawHref || rawHref === '#') return null

    let url
    try {
      url = new URL(rawHref, window.location.href)
    } catch (_) {
      return null
    }

    if (
      url.origin !== window.location.origin ||
      url.pathname !== window.location.pathname ||
      !url.hash
    )
      return null
    return document.getElementById(decodeURIComponent(url.hash.slice(1)))
  }

  function scrollToAnchorTarget(target) {
    const navOffset = nav
      ? Math.ceil(nav.getBoundingClientRect().height + nav.getBoundingClientRect().top + 16)
      : 0
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - navOffset)
    smoothScrollTo(top)
    if (target.id) history.pushState(null, '', `#${target.id}`)
  }

  // ─── Focus trap helper ────────────────────────────────────────────────
  const FOCUSABLE =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

  function trapFocus(container, e) {
    const focusables = container.querySelectorAll(FOCUSABLE)
    if (focusables.length === 0) return
    if (focusables.length === 1) {
      e.preventDefault()
      focusables[0].focus()
      return
    }
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  // ─── Header: glass on scroll ──────────────────────────────────────────
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

  // ─── Mobile menu ──────────────────────────────────────────────────────
  const menu = document.getElementById('mobile-menu')
  const menuOpen = document.getElementById('mobile-menu-open')
  const menuClose = document.getElementById('mobile-menu-close')

  function openMenu() {
    if (!menu) return
    if (menu.classList.contains('is-open')) return
    menu.removeAttribute('inert')
    menu.classList.add('is-open')
    menu.setAttribute('aria-hidden', 'false')
    if (menuOpen) menuOpen.setAttribute('aria-expanded', 'true')
    lockScroll()
    requestAnimationFrame(() => {
      if (menuClose) menuClose.focus({ preventScroll: true })
    })
  }
  function closeMenu() {
    if (!menu) return
    if (!menu.classList.contains('is-open')) return
    if (menu.contains(document.activeElement) && menuOpen) {
      menuOpen.focus({ preventScroll: true })
    }
    menu.classList.remove('is-open')
    menu.setAttribute('aria-hidden', 'true')
    menu.setAttribute('inert', '')
    if (menuOpen) menuOpen.setAttribute('aria-expanded', 'false')
    unlockScroll()
  }
  if (menuOpen) menuOpen.addEventListener('click', openMenu)
  if (menuClose) menuClose.addEventListener('click', closeMenu)
  if (menu) {
    for (const el of menu.querySelectorAll('[data-close-menu]')) {
      el.addEventListener('click', closeMenu)
    }
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]')
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return

    const target = getAnchorTarget(link)
    if (!target) return

    e.preventDefault()
    if (menu?.classList.contains('is-open')) closeMenu()
    if (modal?.classList.contains('is-open')) closeModal()
    requestAnimationFrame(() => scrollToAnchorTarget(target))
  })

  // ─── Project modal ────────────────────────────────────────────────────
  const modal = document.getElementById('project-modal')
  const modalContent = document.getElementById('project-modal-content')
  let lastProjectTrigger = null

  function openModal() {
    if (!modal) return
    if (modal.classList.contains('is-open')) return
    modal.removeAttribute('inert')
    modal.classList.add('is-open')
    modal.setAttribute('aria-hidden', 'false')
    lockScroll()
    // Focus the close button after content settles
    requestAnimationFrame(() => {
      const closeBtn = modal.querySelector('[data-modal-close]')
      if (closeBtn) closeBtn.focus({ preventScroll: true })
    })
  }
  function closeModal() {
    if (!modal) return
    if (!modal.classList.contains('is-open')) return
    if (modal.contains(document.activeElement)) {
      if (lastProjectTrigger && document.contains(lastProjectTrigger)) {
        lastProjectTrigger.focus({ preventScroll: true })
      } else {
        document.body.focus()
      }
    }
    modal.classList.remove('is-open')
    modal.setAttribute('aria-hidden', 'true')
    modal.setAttribute('inert', '')
    unlockScroll()
    // Clear after the fade-out transition (300ms, see CSS)
    setTimeout(() => {
      if (modalContent && !modal.classList.contains('is-open')) modalContent.innerHTML = ''
    }, 300)
  }

  // Open modal triggers (project cards), delegated.
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-project-trigger]')
    if (trigger) {
      lastProjectTrigger = trigger
      openModal()
    }
  })
  // HTMX delivers prev/next markup into the same container; keep modal open.
  document.body.addEventListener('htmx:afterSwap', (e) => {
    if (e.detail?.target && e.detail.target.id === 'project-modal-content') {
      openModal()
    }
  })

  // Modal close buttons (delegated, content is HTMX-swapped)
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-modal-close]')) closeModal()
  })

  // ─── Global keyboard handlers ─────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    // "/" jumps to work (only when nothing is focused/typed in)
    if (
      e.key === '/' &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !modal?.classList.contains('is-open') &&
      !menu?.classList.contains('is-open')
    ) {
      const target = document.activeElement
      const isTyping =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      if (!isTyping) {
        const work = document.getElementById('work')
        if (work) {
          e.preventDefault()
          scrollToAnchorTarget(work)
        }
      }
    }

    if (e.key === 'Escape') {
      if (modal?.classList.contains('is-open')) {
        closeModal()
        return
      }
      if (menu?.classList.contains('is-open')) {
        closeMenu()
        return
      }
    }
    // Modal arrow nav
    if (modal?.classList.contains('is-open')) {
      if (e.key === 'ArrowLeft') {
        const prev = modal.querySelector('[data-modal-prev]')
        if (prev && !prev.disabled) prev.click()
      } else if (e.key === 'ArrowRight') {
        const next = modal.querySelector('[data-modal-next]')
        if (next && !next.disabled) next.click()
      } else if (e.key === 'Tab') {
        trapFocus(modal, e)
      }
    } else if (menu?.classList.contains('is-open') && e.key === 'Tab') {
      trapFocus(menu, e)
    }
  })

  // ─── Reveal-on-scroll (replaces useInView) ────────────────────────────
  const reveals = document.querySelectorAll('.reveal')
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    )
    for (const el of reveals) {
      io.observe(el)
    }
  } else {
    for (const el of reveals) {
      el.classList.add('in-view')
    }
  }

  // Reveal only nodes inside the swap target so existing in-viewport reveals keep their animation.
  document.body.addEventListener('htmx:afterSettle', (e) => {
    const detail = e.detail
    const swapTarget = detail && (detail.target || detail.elt)
    if (!(swapTarget instanceof HTMLElement) || swapTarget === document.body) return
    for (const el of swapTarget.querySelectorAll('.reveal:not(.in-view)')) {
      el.classList.add('in-view')
    }
  })

  // Allow HTMX to swap validation / rate-limit / CSRF-reject responses, by default
  // it only swaps 2xx. Without this, the user sees nothing happen when the server
  // returns a form fragment.
  const SWAPPABLE_ERROR_STATUSES = new Set([403, 422, 429])
  document.body.addEventListener('htmx:beforeSwap', (e) => {
    if (e.detail.xhr && SWAPPABLE_ERROR_STATUSES.has(e.detail.xhr.status)) {
      e.detail.shouldSwap = true
      e.detail.isError = false
    }
  })

  // ─── Scroll-to-top button ─────────────────────────────────────────────
  const stt = document.getElementById('scroll-top')
  if (stt) {
    const onScrollStt = () => stt.classList.toggle('is-visible', window.scrollY > 400)
    window.addEventListener('scroll', onScrollStt, { passive: true })
    stt.addEventListener('click', () => smoothScrollTo(0, 800))
    onScrollStt()
  }

  // ─── Theme toggle ─────────────────────────────────────────────────────
  const themeBtn = document.getElementById('theme-toggle')
  if (themeBtn) {
    const prefersLightMq = window.matchMedia('(prefers-color-scheme: light)')
    const resolveSystemTheme = () => (prefersLightMq.matches ? 'light' : 'dark')

    const setLabel = () => {
      const t = document.documentElement.getAttribute('data-theme') || 'light'
      themeBtn.setAttribute(
        'aria-label',
        t === 'light' ? 'Switch to dark theme' : 'Switch to light theme',
      )
      themeBtn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false')
    }

    function readStoredTheme() {
      try {
        return localStorage.getItem('theme')
      } catch (_) {
        return null
      }
    }

    function isExplicitStored(value) {
      return value === 'light' || value === 'dark'
    }

    prefersLightMq.addEventListener('change', () => {
      if (isExplicitStored(readStoredTheme())) return
      document.documentElement.setAttribute('data-theme', resolveSystemTheme())
      setLabel()
    })

    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light'
      const next = current === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', next)
      try {
        localStorage.setItem('theme', next)
      } catch (_) {}
      setLabel()
    })
    setLabel()
  }
})()
