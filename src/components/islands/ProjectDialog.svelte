<script lang="ts">
import { animate, stagger } from 'motion'
import { onMount, tick } from 'svelte'
import type { Project } from '../../data/projects'
import { lockScroll, unlockScroll } from '../../scripts/page'

export let projects: Project[] = []

let activeIndex: number | null = null
let prevActiveIndex: number | null = null
let isOpen = false
let returnUrl = '/'
let triggerElement: HTMLElement | null = null
let modalContainer: HTMLElement
let animatePromise: Promise<void> | null = null

$: activeProject = activeIndex !== null ? projects[activeIndex] : null

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function openProject(index: number, trigger: HTMLElement | null = null) {
  if (index < 0 || index >= projects.length) return
  prevActiveIndex = activeIndex
  activeIndex = index
  triggerElement = trigger || triggerElement

  if (!isOpen) {
    isOpen = true
    lockScroll()
    returnUrl = window.location.pathname + window.location.search
  }

  const project = projects[index]
  if (project) {
    const targetUrl = `/projects/${project.slug}`
    history.pushState({ projectIndex: index }, '', targetUrl)
  }

  tick().then(() => {
    focusCloseButton()
    triggerStaggerAnimation()
  })
}

export function closeProject() {
  if (!isOpen) return
  isOpen = false
  activeIndex = null
  prevActiveIndex = null
  unlockScroll()

  history.pushState(null, '', returnUrl)

  if (triggerElement && document.contains(triggerElement)) {
    triggerElement.focus({ preventScroll: true })
  }
  triggerElement = null
}

function goPrev() {
  if (activeIndex !== null && activeIndex > 0) {
    openProject(activeIndex - 1)
  }
}

function goNext() {
  if (activeIndex !== null && activeIndex < projects.length - 1) {
    openProject(activeIndex + 1)
  }
}

function focusCloseButton() {
  if (!modalContainer) return
  const closeBtn = modalContainer.querySelector('[data-modal-close]') as HTMLElement | null
  if (closeBtn) {
    closeBtn.focus({ preventScroll: true })
  }
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function trapFocus(e: KeyboardEvent) {
  if (!modalContainer) return
  const focusables = modalContainer.querySelectorAll(FOCUSABLE_SELECTOR) as NodeListOf<HTMLElement>
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

function triggerStaggerAnimation() {
  if (prefersReducedMotion() || !modalContainer) {
    const reveals = modalContainer.querySelectorAll('.modal-reveal') as NodeListOf<HTMLElement>
    for (const el of reveals) {
      el.style.opacity = '1'
      el.style.transform = 'none'
    }
    return
  }

  const blocks = modalContainer.querySelectorAll('.modal-reveal') as NodeListOf<HTMLElement>
  if (!blocks.length) return

  // Reset styles
  for (const el of blocks) {
    el.style.opacity = '0'
    el.style.transform = 'translateY(18px)'
  }

  animate(
    Array.from(blocks),
    {
      opacity: [0, 1],
      y: [18, 0],
    },
    {
      duration: 0.55,
      delay: stagger(0.07, { startDelay: 0.05 }),
      ease: [0.34, 1.56, 0.64, 1],
    },
  )
}

function handleKeydown(e: KeyboardEvent) {
  if (!isOpen) return

  if (e.key === 'Escape') {
    e.preventDefault()
    closeProject()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    goPrev()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    goNext()
  } else if (e.key === 'Tab') {
    trapFocus(e)
  }
}

onMount(() => {
  // Progressive enhancement click interception of project cards
  const handleTriggerClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const trigger = target.closest('[data-project-trigger]') as HTMLAnchorElement | null
    if (trigger) {
      const rawId = trigger.getAttribute('data-project-id')
      if (rawId) {
        e.preventDefault()
        const id = Number(rawId)
        const index = projects.findIndex((p) => p.id === id)
        if (index !== -1) {
          openProject(index, trigger)
        }
      }
    }
  }

  // Popstate history support (e.g. Back/Forward)
  const handlePopState = (e: PopStateEvent) => {
    if (e.state && typeof e.state.projectIndex === 'number') {
      const index = e.state.projectIndex
      if (index >= 0 && index < projects.length) {
        activeIndex = index
        isOpen = true
        tick().then(() => {
          triggerStaggerAnimation()
        })
      }
    } else {
      // Closed / returned to base page
      if (isOpen) {
        isOpen = false
        activeIndex = null
        prevActiveIndex = null
        unlockScroll()
      }
    }
  }

  // Check if initial URL matches a project slug
  const path = window.location.pathname
  const match = path.match(/^\/projects\/([a-zA-Z0-9-]+)\/?$/)
  if (match && match[1]) {
    const slug = match[1]
    const index = projects.findIndex((p) => p.slug === slug)
    if (index !== -1) {
      // Find matching trigger card for focus return if present
      const trigger = document.querySelector(
        `[data-project-id="${projects[index]?.id}"]`,
      ) as HTMLElement | null
      openProject(index, trigger)
    }
  }

  window.addEventListener('click', handleTriggerClick)
  window.addEventListener('popstate', handlePopState)
  window.addEventListener('keydown', handleKeydown)

  return () => {
    window.removeEventListener('click', handleTriggerClick)
    window.removeEventListener('popstate', handlePopState)
    window.removeEventListener('keydown', handleKeydown)
    if (isOpen) {
      unlockScroll()
    }
  }
})
</script>

<div
  bind:this={modalContainer}
  id="project-modal"
  class="fixed inset-0 z-50 flex items-end justify-center p-0 md:items-center md:p-6"
  class:is-open={isOpen}
  aria-hidden={!isOpen}
  inert={!isOpen ? "" : undefined}
  role="dialog"
  aria-modal="true"
  aria-labelledby="project-modal-title"
>
  <!-- Backdrop -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    class="modal-backdrop absolute inset-0 bg-background/40 backdrop-blur-sm"
    aria-hidden="true"
    on:click={closeProject}
    data-modal-close
  ></div>

  <!-- Dialog Card -->
  {#if isOpen && activeProject}
    <div class="modal-card relative flex w-full flex-col overflow-hidden bg-card shadow-2xl h-[92dvh] max-h-208 max-w-6xl rounded-t-lg md:h-[88dvh] md:rounded-lg">
      <div id="project-modal-content" class="flex-1 overflow-y-auto">
        <article class="flex flex-col gap-0">

          <!-- Sticky Header -->
          <div class="sticky top-0 z-10 flex items-center justify-between border-b border-border gap-4 px-6 py-4 md:px-10 bg-card/85 backdrop-blur">
            <div class="flex items-center gap-3 min-w-0">
              <span class="font-mono text-muted-foreground shrink-0 text-[0.7rem] tracking-[0.18em]">
                0{activeProject.id}
              </span>
              <span class="h-px flex-1 bg-border max-w-8"></span>
              <span class="font-mono uppercase text-foreground truncate text-[0.7rem] tracking-[0.22em]">
                {activeProject.category}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <!-- Previous project control -->
              <button
                type="button"
                on:click={goPrev}
                disabled={activeIndex === 0}
                class="hover:text-foreground hover:border-foreground/40 inline-flex items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 h-9 w-9 disabled:opacity-35 disabled:cursor-not-allowed"
                aria-label="Previous Project"
              >
                <!-- Arrow left icon inline -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>

              <!-- Next project control -->
              <button
                type="button"
                on:click={goNext}
                disabled={activeIndex === projects.length - 1}
                class="hover:text-foreground hover:border-foreground/40 inline-flex items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 h-9 w-9 disabled:opacity-35 disabled:cursor-not-allowed"
                aria-label="Next Project"
              >
                <!-- Arrow right icon inline -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <!-- Close button -->
              <button
                type="button"
                on:click={closeProject}
                data-modal-close
                class="group inline-flex items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 h-9 w-9 hover:text-foreground hover:border-foreground/40 hover:rotate-90"
                aria-label="Close Case Study"
              >
                <!-- X icon inline -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Main Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-0">

            <!-- LEFT Content: visual + title details -->
            <div class="relative flex flex-col bg-card lg:col-span-7 border-b border-border lg:border-b-0 lg:border-r">
              <div class="modal-reveal relative aspect-video w-full overflow-hidden bg-muted">
                <img class="h-full w-full object-cover" src={activeProject.image} alt={activeProject.title} />
                <div class="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent animate-fade" aria-hidden="true"></div>
              </div>
              <div class="modal-reveal flex flex-col gap-4 p-6 md:p-10">
                <h2 id="project-modal-title" class="font-serif text-foreground text-3xl md:text-5xl tracking-tight leading-[1.05]">
                  {activeProject.title}.
                  <span class="serif-italic text-muted-foreground">{activeProject.description}</span>
                </h2>
                {#if activeProject.result}
                  <div class="inline-flex items-center self-start rounded-full border border-primary font-mono uppercase text-primary gap-2 bg-primary/8 px-3 py-1.5 text-[0.7rem] tracking-[0.22em]">
                    <span class="relative inline-flex h-1.5 w-1.5">
                      <span class="absolute inline-flex animate-pulse-soft rounded-full bg-primary h-full w-full"></span>
                      <span class="relative inline-flex rounded-full bg-primary h-1.5 w-1.5"></span>
                    </span>
                    <span>{activeProject.result}</span>
                  </div>
                {/if}
              </div>
            </div>

            <!-- RIGHT Content: narrative + specifications sidebar -->
            <div class="flex flex-col lg:col-span-5">
              <!-- Narrative -->
              <div class="modal-reveal flex flex-col border-b border-border gap-4 p-6 md:p-10">
                <span class="eyebrow">The story</span>
                <p class="text-muted-foreground text-base leading-relaxed">{activeProject.longDescription}</p>
              </div>

              <!-- Meta specs sheet -->
              <dl class="modal-reveal grid grid-cols-2 bg-border gap-px">
                <div class="flex flex-col bg-background gap-1 p-6 md:p-8">
                  <dt class="font-mono uppercase text-muted-foreground text-[0.65rem] tracking-[0.22em]">Client</dt>
                  <dd class="font-serif text-foreground mt-1 text-lg tracking-[-0.01em]">{activeProject.client}</dd>
                </div>
                <div class="flex flex-col bg-background gap-1 p-6 md:p-8">
                  <dt class="font-mono uppercase text-muted-foreground text-[0.65rem] tracking-[0.22em]">Year</dt>
                  <dd class="font-serif text-foreground mt-1 text-lg tracking-[-0.01em]">{activeProject.year}</dd>
                </div>
                <div class="flex flex-col bg-background gap-1 p-6 md:p-8">
                  <dt class="font-mono uppercase text-muted-foreground text-[0.65rem] tracking-[0.22em]">My role</dt>
                  <dd class="font-serif text-foreground mt-1 text-lg tracking-[-0.01em]">{activeProject.role}</dd>
                </div>
                <div class="flex flex-col bg-background gap-1 p-6 md:p-8">
                  <dt class="font-mono uppercase text-muted-foreground text-[0.65rem] tracking-[0.22em]">Focus</dt>
                  <dd class="font-serif text-foreground mt-1 text-lg tracking-[-0.01em]">{activeProject.category}</dd>
                </div>
              </dl>

              <!-- Tags list -->
              <div class="modal-reveal flex flex-col border-t border-border gap-3 p-6 md:p-10">
                <span class="eyebrow">What it took</span>
                <ul class="flex flex-wrap gap-2">
                  {#each activeProject.tags as tag}
                    <li class="inline-flex items-center rounded-full border border-border font-mono text-muted-foreground bg-card/40 px-3 py-1 text-[0.7rem]">{tag}</li>
                  {/each}
                </ul>
              </div>

              <!-- CTA -->
              <div class="modal-reveal mt-auto border-t border-border p-6 md:p-10">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <a
                  class="group inline-flex items-center rounded-full bg-foreground font-medium text-background transition-all duration-300 gap-3 h-12 px-6 text-sm hover:bg-foreground/90 active:scale-[0.98]"
                  href="/#contact"
                  on:click={closeProject}
                >
                  <span>Start something like this</span>
                  <!-- Arrow up right icon inline -->
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 inline-flex transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </article>
      </div>
    </div>
  {/if}
</div>
