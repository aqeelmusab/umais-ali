"use client"

import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { useInView } from "@/components/use-in-view"

interface ProjectCardProps {
  title: string
  category: string
  description: string
  tags: string[]
  image: string
  result?: string
  index: number
  onClick: () => void
  horizontal?: boolean
}

export function ProjectCard({
  title,
  category,
  description,
  tags,
  image,
  result,
  index,
  onClick,
  horizontal = false,
}: ProjectCardProps) {
  const { ref, isInView } = useInView()

  return (
    <div
      ref={ref}
      className={`group cursor-pointer transition-all duration-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl ${
        horizontal ? "md:grid md:grid-cols-2 md:gap-8 md:items-center" : ""
      } ${
        isInView ? "animate-fade-up" : "opacity-0"
      } stagger-${(index % 4) + 1}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View project: ${title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Image container */}
      <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-secondary">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Result badge */}
        {result && (
          <div className="absolute top-4 left-4 inline-flex items-center rounded-full glass px-3.5 py-1.5 text-xs font-semibold tracking-wide text-primary">
            {result}
          </div>
        )}

        {/* Hover overlay content */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
          <p className="text-sm font-medium text-foreground">{description}</p>
          <div className="shrink-0 ml-3 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className={`flex flex-col gap-1.5 ${horizontal ? "mt-5 md:mt-0" : "mt-5"}`}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium tracking-widest uppercase text-primary/80">
            {category}
          </p>
        </div>
        <h3 className="text-xl font-medium tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary md:text-2xl">
          {title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-xs text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:text-foreground/80"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
