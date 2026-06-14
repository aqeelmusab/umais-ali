import type { Project } from './data/projects'

export interface ProjectNavigation {
  project: Project
  hasPrev: boolean
  hasNext: boolean
  prevId: number | null
  nextId: number | null
}

export function getProjectNavigation(
  projects: readonly Project[],
  id: number,
): ProjectNavigation | null {
  if (!Number.isFinite(id)) return null
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) return null
  const project = projects.at(index)
  if (project === undefined) return null
  const hasPrev = index > 0
  const hasNext = index < projects.length - 1
  const prevProject = hasPrev ? projects.at(index - 1) : null
  const nextProject = hasNext ? projects.at(index + 1) : null
  return {
    project,
    hasPrev,
    hasNext,
    prevId: prevProject ? prevProject.id : null,
    nextId: nextProject ? nextProject.id : null,
  }
}
