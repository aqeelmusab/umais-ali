"use client"

import Image from "next/image"
import { useInView } from "@/components/use-in-view"

const skills = [
  "On-Page SEO",
  "Technical SEO",
  "Keyword Research",
  "Link Building",
  "Content Strategy",
  "Google Analytics",
  "Search Console",
  "SEO Audits",
  "Site Migration",
  "Schema Markup",
  "Core Web Vitals",
  "Programmatic SEO",
]

const experience = [
  {
    period: "2023 — Present",
    role: "SEO Executive",
    company: "Freelance",
  },
  {
    period: "2021 — 2023",
    role: "SEO Specialist",
    company: "Digital Starter",
  },
  {
    period: "2019 — 2021",
    role: "Junior SEO Analyst",
    company: "RankEdge Agency",
  },
]

const highlights = [
  { value: "40+", label: "Projects" },
  { value: "3M+", label: "Organic Visits" },
  { value: "200%", label: "Avg. Traffic Growth" },
  { value: "50+", label: "Page 1 Keywords" },
]

export function About() {
  const { ref: sectionRef, isInView: sectionInView } = useInView()
  const { ref: highlightsRef, isInView: highlightsInView } = useInView()
  const { ref: expRef, isInView: expInView } = useInView()

  return (
    <section id="about" className="px-6 py-24 md:px-12 md:py-32 lg:px-20">
      <div ref={sectionRef}>
        {/* Section header */}
        <div
          className={`mb-16 transition-all duration-700 ${
            sectionInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-primary" />
            <p className="text-xs font-semibold tracking-widest uppercase text-primary">
              About
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
          {/* Portrait */}
          <div
            className={`md:col-span-5 transition-all duration-700 ${
              sectionInView ? "animate-fade-up stagger-2" : "opacity-0"
            }`}
          >
            <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-secondary">
              <Image
                src="/images/portrait.png"
                alt="Portrait of Umais Ali"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-background/30 to-transparent" />
            </div>
          </div>

          {/* Bio */}
          <div
            className={`md:col-span-7 flex flex-col justify-center transition-all duration-700 ${
              sectionInView ? "animate-fade-up stagger-3" : "opacity-0"
            }`}
          >
            <h2 className="font-serif text-2xl font-normal leading-[1.2] tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl text-balance">
              Good SEO does not feel like marketing.
              <span className="gradient-text"> It feels like the right answer </span>
              showing up at the right time.
            </h2>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>
                {"I spend most of my time digging into search data, figuring out what people are actually looking for, and making sure the right pages show up when it matters. That means technical fixes, content planning, keyword mapping, and a lot of spreadsheets."}
              </p>
              <p>
                {"Before going independent, I worked at agencies where I handled SEO for clients across e-commerce, SaaS, healthcare, and local services. Each one taught me something different about how search works in practice, not just in theory."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights strip */}
      <div ref={highlightsRef} className="mt-24">
        <div className="divider-gradient" />
        <div className="grid grid-cols-2 gap-8 pt-10 md:grid-cols-4 md:gap-12">
          {highlights.map((item, index) => (
            <div
              key={item.label}
              className={`flex flex-col gap-2 transition-all duration-700 ${
                highlightsInView ? "animate-fade-up" : "opacity-0"
              } stagger-${index + 1}`}
            >
              <p className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {item.value}
              </p>
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee skills strip */}
      <div className="mt-20 -mx-6 md:-mx-12 lg:-mx-20 overflow-x-hidden">
        <div className="divider-gradient" />
        <div className="relative py-8" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
          <div className="flex">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 animate-marquee">
                {skills.map((skill) => (
                  <span
                    key={`${skill}-${copy}`}
                    className="shrink-0 mx-3 inline-flex items-center rounded-full border border-border/60 bg-secondary/30 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="divider-gradient" />
      </div>

      {/* Experience */}
      <div ref={expRef} className="mt-20">
        <div
          className={`flex items-center gap-3 mb-10 transition-all duration-700 ${
            expInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <div className="h-px w-8 bg-primary" />
          <p className="text-xs font-semibold tracking-widest uppercase text-primary">
            Experience
          </p>
        </div>
        <div className="flex flex-col">
          {experience.map((exp, index) => (
            <div
              key={exp.period}
              className={`group flex flex-col gap-2 border-b border-border/50 py-6 px-4 -mx-4 first:border-t first:border-border/50 md:flex-row md:items-center md:gap-8 transition-all duration-500 hover:bg-foreground/[0.03] rounded-lg ${
                expInView ? "animate-fade-up" : "opacity-0"
              } stagger-${index + 1}`}
            >
              <p className="text-sm text-muted-foreground md:w-44 shrink-0 font-mono">
                {exp.period}
              </p>
              <div className="flex-1">
                <p className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                  {exp.role}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">{exp.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
