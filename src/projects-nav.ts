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
  const project = projects[index]
  const hasPrev = index > 0
  const hasNext = index < projects.length - 1
  return {
    project,
    hasPrev,
    hasNext,
    prevId: hasPrev ? projects[index - 1].id : null,
    nextId: hasNext ? projects[index + 1].id : null,
  }
}
