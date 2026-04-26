/**
 * umais-ali — small client glue.
 * Replaces the React hooks (useScrollLock, useFocusTrap, useInView, useScroll).
 * Stays vanilla so it composes with HTMX.
 */
(function () {
  'use strict'

  // ─── Scroll lock (single source of truth) ──────────────────────────────
  let scrollLockCount = 0
  function lockScroll() {
    if (scrollLockCount === 0) {
      const sbw = window.innerWidth - document.documentElement.clientWidth
      document.body.dataset.scrollY = String(window.scrollY)
      document.body.style.position = 'fixed'
      document.body.style.top = '-' + window.scrollY + 'px'
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      if (sbw > 0) document.body.style.paddingRight = sbw + 'px'
    }
    scrollLockCount++
  }
  function unlockScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1)
    if (scrollLockCount === 0) {
      const y = parseInt(document.body.dataset.scrollY || '0', 10)
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      document.body.style.paddingRight = ''
      delete document.body.dataset.scrollY
      window.scrollTo(0, y)
    }
  }

  // ─── Focus trap helper ────────────────────────────────────────────────
  const FOCUSABLE =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

  function trapFocus(container, e) {
    const focusables = container.querySelectorAll(FOCUSABLE)
    if (focusables.length === 0) return
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
    const onScrollNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 20)
    window.addEventListener('scroll', onScrollNav, { passive: true })
    onScrollNav()
  }

  // ─── Mobile menu ──────────────────────────────────────────────────────
  const menu = document.getElementById('mobile-menu')
  const menuOpen = document.getElementById('mobile-menu-open')
  const menuClose = document.getElementById('mobile-menu-close')

  function openMenu() {
    if (!menu) return
    if (menu.classList.contains('is-open')) return
    menu.classList.add('is-open')
    menu.setAttribute('aria-hidden', 'false')
    lockScroll()
  }
  function closeMenu() {
    if (!menu) return
    if (!menu.classList.contains('is-open')) return
    menu.classList.remove('is-open')
    menu.setAttribute('aria-hidden', 'true')
    unlockScroll()
  }
  if (menuOpen) menuOpen.addEventListener('click', openMenu)
  if (menuClose) menuClose.addEventListener('click', closeMenu)
  if (menu) {
    menu.querySelectorAll('[data-close-menu]').forEach((el) =>
      el.addEventListener('click', closeMenu)
    )
  }

  // ─── Project modal ────────────────────────────────────────────────────
  const modal = document.getElementById('project-modal')
  const modalBackdrop = modal ? modal.querySelector('[data-modal-backdrop]') : null
  const modalContent = document.getElementById('project-modal-content')

  function openModal() {
    if (!modal) return
    if (modal.classList.contains('is-open')) return
    modal.classList.add('is-open')
    modal.setAttribute('aria-hidden', 'false')
    lockScroll()
    // Focus the close button after content settles
    requestAnimationFrame(() => {
      const closeBtn = modal.querySelector('[data-modal-close]')
      if (closeBtn) closeBtn.focus()
    })
  }
  function closeModal() {
    if (!modal) return
    if (!modal.classList.contains('is-open')) return
    modal.classList.remove('is-open')
    modal.setAttribute('aria-hidden', 'true')
    unlockScroll()
    // Clear after the fade-out transition (300ms — see CSS)
    setTimeout(() => {
      if (modalContent && !modal.classList.contains('is-open')) modalContent.innerHTML = ''
    }, 300)
  }

  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal)

  // Open modal triggers (project cards) — delegated.
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-project-id]')
    if (trigger) openModal()
  })
  // HTMX delivers prev/next markup into the same container; keep modal open.
  document.body.addEventListener('htmx:afterSwap', (e) => {
    if (e.detail && e.detail.target && e.detail.target.id === 'project-modal-content') {
      openModal()
    }
  })

  // Modal close buttons (delegated — content is HTMX-swapped)
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-modal-close]')) closeModal()
  })

  // ─── Global keyboard handlers ─────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    // "/" — jump to work (only when nothing is focused/typed in)
    if (
      e.key === '/' &&
      !e.metaKey && !e.ctrlKey && !e.altKey &&
      !(modal && modal.classList.contains('is-open')) &&
      !(menu && menu.classList.contains('is-open'))
    ) {
      const target = document.activeElement
      const isTyping = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      )
      if (!isTyping) {
        const work = document.getElementById('work')
        if (work) {
          e.preventDefault()
          work.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }

    if (e.key === 'Escape') {
      if (modal && modal.classList.contains('is-open')) {
        closeModal()
        return
      }
      if (menu && menu.classList.contains('is-open')) {
        closeMenu()
        return
      }
    }
    // Modal arrow nav
    if (modal && modal.classList.contains('is-open')) {
      if (e.key === 'ArrowLeft') {
        const prev = modal.querySelector('[data-modal-prev]')
        if (prev && !prev.disabled) prev.click()
      } else if (e.key === 'ArrowRight') {
        const next = modal.querySelector('[data-modal-next]')
        if (next && !next.disabled) next.click()
      } else if (e.key === 'Tab') {
        trapFocus(modal, e)
      }
    } else if (menu && menu.classList.contains('is-open') && e.key === 'Tab') {
      trapFocus(menu, e)
    }
  })

  // ─── Reveal-on-scroll (replaces useInView) ────────────────────────────
  const reveals = document.querySelectorAll('.reveal')
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    )
    reveals.forEach((el) => io.observe(el))
  } else {
    reveals.forEach((el) => el.classList.add('in-view'))
  }

  // Re-scan after HTMX swaps inject new content.
  document.body.addEventListener('htmx:afterSettle', () => {
    document.querySelectorAll('.reveal:not(.in-view)').forEach((el) => el.classList.add('in-view'))
  })

  // Allow HTMX to swap validation/rate-limit responses — by default it only swaps 2xx.
  // Without this, the user sees nothing happen when the server returns a form fragment.
  document.body.addEventListener('htmx:beforeSwap', (e) => {
    if (e.detail.xhr && (e.detail.xhr.status === 422 || e.detail.xhr.status === 429)) {
      e.detail.shouldSwap = true
      e.detail.isError = false
    }
  })

  // ─── Scroll-to-top button ─────────────────────────────────────────────
  const stt = document.getElementById('scroll-top')
  if (stt) {
    const onScrollStt = () => stt.classList.toggle('is-visible', window.scrollY > 400)
    window.addEventListener('scroll', onScrollStt, { passive: true })
    stt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
    onScrollStt()
  }

  // ─── Theme toggle ─────────────────────────────────────────────────────
  const themeBtn = document.getElementById('theme-toggle')
  if (themeBtn) {
    const setLabel = () => {
      const t = document.documentElement.getAttribute('data-theme') || 'dark'
      themeBtn.setAttribute('aria-label', t === 'light' ? 'Switch to dark theme' : 'Switch to light theme')
      themeBtn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false')
    }
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark'
      const next = current === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', next)
      try { localStorage.setItem('theme', next) } catch (_) {}
      setLabel()
    })
    setLabel()
  }
})()
