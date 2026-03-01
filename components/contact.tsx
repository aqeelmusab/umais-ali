"use client"

import { useInView } from "@/components/use-in-view"
import { ArrowUpRight, Mail } from "lucide-react"

const socialLinks = [
  { label: "LinkedIn", href: "https://linkedin.com/in/umaisali" },
  { label: "X / Twitter", href: "https://x.com/umaisali" },
  { label: "GitHub", href: "https://github.com/umaisali" },
]

export function Contact() {
  const { ref, isInView } = useInView()

  return (
    <section id="contact" className="relative px-6 py-24 md:px-12 md:py-32 lg:px-20 overflow-hidden">
      {/* Background gradient accent */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-125 w-200 rounded-full bg-primary/8 blur-[120px]" />
      </div>

      <div ref={ref} className="relative z-10">
        {/* Section header */}
        <div
          className={`mb-12 transition-all duration-700 ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-primary" />
            <p className="text-xs font-semibold tracking-widest uppercase text-primary">
              Contact
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
          {/* Left - CTA */}
          <div className="md:col-span-7">
            <h2
              className={`font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl text-balance transition-all duration-700 ${
                isInView ? "animate-fade-up stagger-1" : "opacity-0"
              }`}
            >
              Need more traffic from Google?{" "}
              <span className="gradient-text">{"Let's talk."}</span>
            </h2>
            <p
              className={`mt-6 text-lg leading-relaxed text-muted-foreground max-w-lg transition-all duration-700 ${
                isInView ? "animate-fade-up stagger-2" : "opacity-0"
              }`}
            >
              Whether you need a full SEO strategy, a technical audit, or just a second opinion on your search performance, I am happy to chat.
            </p>
            <div
              className={`mt-10 flex flex-wrap items-center gap-5 transition-all duration-700 ${
                isInView ? "animate-fade-up stagger-3" : "opacity-0"
              }`}
            >
              <a
                href="mailto:hello@umaisali.com"
                className="hover-glow group inline-flex items-center gap-3 h-14 px-8 text-sm font-medium tracking-wide text-primary-foreground bg-primary rounded-full transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
              >
                <Mail className="h-4 w-4" />
                Send an Email
              </a>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-pulse-soft absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Available now
              </div>
            </div>
          </div>

          {/* Right - Details */}
          <div className="md:col-span-5 flex flex-col gap-10 justify-center">
            <div
              className={`transition-all duration-700 ${
                isInView ? "animate-fade-up stagger-4" : "opacity-0"
              }`}
            >
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                Email
              </p>
              <a
                href="mailto:hello@umaisali.com"
                className="group inline-flex items-center gap-2 text-lg text-foreground transition-colors hover:text-primary"
              >
                hello@umaisali.com
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>

            <div
              className={`transition-all duration-700 ${
                isInView ? "animate-fade-up stagger-5" : "opacity-0"
              }`}
            >
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                Social
              </p>
              <div className="flex flex-col gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-base text-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
