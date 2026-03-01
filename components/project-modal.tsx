"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { X, ArrowLeft, ArrowRight } from "lucide-react"

export interface Project {
  id: number
  title: string
  category: string
  description: string
  longDescription: string
  tags: string[]
  image: string
  year: string
  client: string
  role: string
  result?: string
}

interface ProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}

export function ProjectModal({
  project,
  isOpen,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: ProjectModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const prevProjectId = useRef(project?.id)

  // Reset image loaded state when project changes (derived, no effect setState)
  if (project?.id !== prevProjectId.current) {
    prevProjectId.current = project?.id
    if (imageLoaded) setImageLoaded(false)
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft" && hasPrev) onPrev()
      if (e.key === "ArrowRight" && hasNext) onNext()
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, handleKeyDown])

  if (!project) return null

  return (
    <div
      className={`fixed inset-0 z-70 flex items-end justify-center transition-all duration-300 md:items-center ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal={isOpen}
      aria-label={`Project: ${project.title}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-3xl max-h-[90svh] bg-card border border-border rounded-t-2xl md:rounded-2xl overflow-hidden transition-all duration-500 ease-out shadow-2xl shadow-background/60 ${
          isOpen ? "translate-y-0 scale-100" : "translate-y-8 scale-[0.97]"
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-background/90 backdrop-blur-md border border-border text-foreground shadow-lg transition-all duration-300 hover:bg-background hover:border-primary hover:text-primary cursor-pointer"
          aria-label="Close project details"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="overflow-y-auto max-h-[90svh] overscroll-contain">
          {/* Image */}
          <div className="relative aspect-video bg-secondary">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className={`object-cover transition-opacity duration-500 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              sizes="(max-width: 768px) 100vw, 768px"
              onLoad={() => setImageLoaded(true)}
              priority
            />
            {/* Gradient overlay at bottom of image */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-card to-transparent" />

            {/* Result badge */}
            {project.result && (
              <div className="absolute bottom-4 left-6 md:left-8 inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                {project.result}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium tracking-wide text-primary">
                {project.category}
              </span>
              <span className="text-xs text-muted-foreground">
                {project.year}
              </span>
            </div>

            <h2 className="font-serif text-2xl font-normal tracking-tight text-foreground md:text-3xl text-balance">
              {project.title}
            </h2>

            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              {project.longDescription}
            </p>

            {/* Details grid */}
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="rounded-xl bg-secondary/50 border border-border/50 p-4">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1.5">Client</p>
                <p className="text-sm font-medium text-foreground">{project.client}</p>
              </div>
              <div className="rounded-xl bg-secondary/50 border border-border/50 p-4">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1.5">Role</p>
                <p className="text-sm font-medium text-foreground">{project.role}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Navigation */}
            <div className="divider-gradient mt-8" />
            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={onPrev}
                disabled={!hasPrev}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground transition-all duration-300 hover:text-foreground hover:bg-foreground/5 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                aria-label="Previous project"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!hasNext}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground transition-all duration-300 hover:text-foreground hover:bg-foreground/5 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                aria-label="Next project"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
