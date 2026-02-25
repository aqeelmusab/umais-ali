"use client"

import { useState } from "react"
import { ProjectCard } from "@/components/project-card"
import { ProjectModal, type Project } from "@/components/project-modal"
import { useInView } from "@/components/use-in-view"

const projects: Project[] = [
  {
    id: 1,
    title: "GreenLeaf Organics",
    category: "E-Commerce SEO",
    description: "Full SEO overhaul for a sustainable food brand. Organic traffic up 210% in six months.",
    longDescription:
      "GreenLeaf had solid products but almost no search visibility. They were buried on page three for most of their target keywords. I started with a technical audit that flagged crawl issues, thin product descriptions, and a messy URL structure. From there, I rebuilt their site architecture, rewrote and optimized over 200 product pages, and mapped out a content calendar targeting purchase-ready search terms. Six months in, organic traffic was up 210% and organic revenue had grown 175%. The biggest win was getting their top product category ranking on page one for the first time.",
    tags: ["Technical SEO", "Content Strategy", "E-Commerce"],
    image: "/images/project-1.jpg",
    year: "2025",
    client: "GreenLeaf Organics",
    role: "SEO Lead",
    result: "+210% Traffic",
  },
  {
    id: 2,
    title: "CloudStack SaaS",
    category: "B2B SEO",
    description: "Built an organic acquisition engine for a cloud startup. 340% more signups from search.",
    longDescription:
      "CloudStack was pouring money into paid ads and wanted a sustainable organic channel that could lower their customer acquisition cost. I built a keyword strategy around bottom-of-funnel terms their ideal customers were searching, then created a programmatic SEO system for their documentation and comparison pages. On the link building side, I ran campaigns through technical guest posts and digital PR that landed coverage in industry publications. The result: a 340% jump in organic signups and first-page rankings for 45 high-value keywords. Their cost per lead from organic dropped by more than half.",
    tags: ["B2B SEO", "Link Building", "Programmatic SEO"],
    image: "/images/project-2.jpg",
    year: "2024",
    client: "CloudStack Inc.",
    role: "SEO Strategist",
    result: "+340% Signups",
  },
  {
    id: 3,
    title: "Metro Dental Group",
    category: "Local SEO",
    description: "Took a multi-location dental practice to the top of local search in every target area.",
    longDescription:
      "Metro Dental had 8 locations but almost none of them showed up in the Google map pack. Patients were finding competitors first. I optimized all their Google Business Profiles, built dedicated landing pages for each location with unique content, added local schema markup across the site, and ran a review generation campaign. Within four months, every location was ranking in the top 3 of the map pack for its area. Appointment bookings from organic search went up 65%. The review campaign also pushed their average rating from 3.8 to 4.6 stars.",
    tags: ["Local SEO", "Google Business", "Schema Markup"],
    image: "/images/project-3.jpg",
    year: "2024",
    client: "Metro Dental Group",
    role: "SEO Consultant",
    result: "+65% Bookings",
  },
  {
    id: 4,
    title: "StyleVault Magazine",
    category: "Content SEO",
    description: "Turned a fashion blog with great writing into a search traffic machine. 280% growth.",
    longDescription:
      "StyleVault had talented writers producing quality articles, but almost none of them ranked. The problem was not the writing. It was the structure. Articles lacked keyword focus, internal linking was random, and there were dozens of pages cannibalizing each other. I ran a content gap analysis, built topic clusters around their strongest categories, consolidated competing pages, and set up a quarterly refresh cycle for older posts. Organic traffic grew 280% and they now hold the top spot for over 30 competitive fashion search terms. Their ad revenue from organic pages nearly tripled.",
    tags: ["Content Strategy", "On-Page SEO", "Analytics"],
    image: "/images/project-4.jpg",
    year: "2024",
    client: "StyleVault Magazine",
    role: "SEO and Content Strategist",
    result: "+280% Traffic",
  },
  {
    id: 5,
    title: "FitPro Equipment",
    category: "Technical SEO",
    description: "Recovered and exceeded pre-migration traffic after a botched site relaunch.",
    longDescription:
      "FitPro migrated to a new platform and lost nearly 40% of their organic traffic overnight. Nobody had set up proper redirects or checked for indexing issues. When I came in, I found over 500 broken redirect chains, hundreds of duplicate pages, and Core Web Vitals scores in the red. I rebuilt the redirect map, cleaned up canonicals, fixed the sitemap, and worked with their dev team to get page speed back on track. Three months later, traffic had not only recovered but exceeded pre-migration levels by 150%. They went from losing $30k a month in organic revenue to gaining it back and then some.",
    tags: ["Technical SEO", "Site Migration", "Core Web Vitals"],
    image: "/images/project-5.jpg",
    year: "2025",
    client: "FitPro Equipment",
    role: "Technical SEO Lead",
    result: "+150% Recovery",
  },
]

export function SelectedWork() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { ref: sectionRef, isInView } = useInView()

  const currentIndex = selectedProject
    ? projects.findIndex((p) => p.id === selectedProject.id)
    : -1

  const openProject = (project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const closeProject = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedProject(null), 300)
  }

  const goToPrev = () => {
    if (currentIndex > 0) setSelectedProject(projects[currentIndex - 1])
  }

  const goToNext = () => {
    if (currentIndex < projects.length - 1) setSelectedProject(projects[currentIndex + 1])
  }

  return (
    <section id="work" className="px-6 py-24 md:px-12 md:py-32 lg:px-20">
      <div ref={sectionRef}>
        {/* Section header */}
        <div
          className={`mb-16 transition-all duration-700 ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-primary" />
            <p className="text-xs font-semibold tracking-widest uppercase text-primary">
              Selected Work
            </p>
          </div>
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl font-normal tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Case Studies
            </h2>
            <p className="hidden text-sm text-muted-foreground md:block">
              {projects.length} projects
            </p>
          </div>
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-8 md:gap-y-16">
          {projects.map((project, index) => {
            const isLastOdd = index === projects.length - 1 && projects.length % 2 !== 0
            return (
              <div
                key={project.id}
                className={isLastOdd ? "md:col-span-2" : ""}
              >
                <ProjectCard
                  title={project.title}
                  category={project.category}
                  description={project.description}
                  tags={project.tags}
                  image={project.image}
                  result={project.result}
                  index={index}
                  onClick={() => openProject(project)}
                  horizontal={isLastOdd}
                />
              </div>
            )
          })}
        </div>
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeProject}
        onPrev={goToPrev}
        onNext={goToNext}
        hasPrev={currentIndex > 0}
        hasNext={currentIndex < projects.length - 1}
      />
    </section>
  )
}
