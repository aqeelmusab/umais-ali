"use client"

import Link from "next/link"
import { ArrowDown } from "lucide-react"

const stats = [
  { value: "5+", label: "Years in SEO" },
  { value: "40+", label: "Projects Delivered" },
  { value: "3M+", label: "Organic Visits Driven" },
]

export function Hero() {
  return (
    <section className="relative grid min-h-svh grid-rows-[1fr_auto] overflow-hidden px-6 pt-28 pb-10 sm:pt-24 sm:pb-12 md:px-12 lg:px-20 lg:pb-20">
      {/* Gradient orbs background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="animate-float animate-glow-pulse absolute -top-32 -right-32 h-125 w-125 rounded-full bg-primary/20 blur-[120px]" />
        <div className="animate-float-reverse animate-glow-pulse absolute top-1/2 -left-48 h-100 w-100 rounded-full bg-accent/15 blur-[100px]" style={{ animationDelay: "2s" }} />
        <div className="animate-float absolute bottom-0 right-1/4 h-75 w-75 rounded-full bg-primary/10 blur-[80px]" style={{ animationDelay: "4s" }} />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.94 0.005 80 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.94 0.005 80 / 0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Main content – vertically & left-aligned */}
      <div className="relative z-10 flex items-center">
        <div className="max-w-5xl">
          {/* Availability badge */}
          <div className="animate-fade-up stagger-1 mb-6 inline-flex items-center gap-3 rounded-full border border-border bg-secondary/50 px-4 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-soft absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
              Available for projects
            </p>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up stagger-2 font-serif text-4xl font-normal leading-[1.08] tracking-tight sm:text-5xl md:text-7xl lg:text-8xl text-balance">
            <span className="text-foreground">I help businesses </span>
            <span className="gradient-text">get found</span>
            <span className="text-foreground">, get clicked, and </span>
            <span className="gradient-text">get results</span>
            <span className="text-foreground"> through search.</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-up stagger-3 mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-8 sm:text-lg md:text-xl">
            SEO strategist and executor. I work with brands to build organic search channels
            that compound over time, turning rankings into real revenue.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up stagger-4 mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
            <Link
              href="#work"
              className="hover-glow group inline-flex items-center justify-center h-13 px-8 text-sm font-medium tracking-wide text-primary-foreground bg-primary rounded-full transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
            >
              See My Work
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center h-13 px-8 text-sm font-medium tracking-wide text-foreground border border-border rounded-full transition-all duration-300 hover:bg-foreground/5 hover:border-foreground/20 active:scale-[0.97]"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>

      {/* Stats strip – pinned to bottom */}
      <div className="relative z-10 pt-12 sm:pt-16">
        <div className="divider-gradient" />
        <div className="animate-fade-up stagger-5 flex flex-wrap items-end gap-8 pt-6 sm:gap-10 sm:pt-8 md:gap-16">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1.5">
              <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                {stat.value}
              </p>
              <p className="text-[0.65rem] font-medium tracking-widest uppercase text-muted-foreground sm:text-xs">
                {stat.label}
              </p>
            </div>
          ))}

          {/* Scroll indicator – inline at the end of stats */}
          <div className="ml-auto hidden md:block">
            <Link
              href="#work"
              className="flex items-center justify-center w-11 h-11 rounded-full border border-border text-muted-foreground transition-all duration-300 hover:text-foreground hover:border-primary hover:shadow-[0_0_20px] hover:shadow-primary/20"
              aria-label="Scroll to work section"
            >
              <ArrowDown className="h-4 w-4 animate-bounce" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
