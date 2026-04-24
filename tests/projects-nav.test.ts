import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getProjectNavigation } from '../src/projects-nav'
import { projects as realProjects, type Project } from '../src/data/projects'

const fixture: Project[] = [
  { id: 10, title: 'A' } as Project,
  { id: 20, title: 'B' } as Project,
  { id: 30, title: 'C' } as Project,
]

test('getProjectNavigation: first item has no prev', () => {
  const nav = getProjectNavigation(fixture, 10)
  assert.ok(nav)
  assert.equal(nav!.project.id, 10)
  assert.equal(nav!.hasPrev, false)
  assert.equal(nav!.prevId, null)
  assert.equal(nav!.hasNext, true)
  assert.equal(nav!.nextId, 20)
})

test('getProjectNavigation: middle item exposes both neighbours', () => {
  const nav = getProjectNavigation(fixture, 20)
  assert.ok(nav)
  assert.equal(nav!.hasPrev, true)
  assert.equal(nav!.prevId, 10)
  assert.equal(nav!.hasNext, true)
  assert.equal(nav!.nextId, 30)
})

test('getProjectNavigation: last item has no next', () => {
  const nav = getProjectNavigation(fixture, 30)
  assert.ok(nav)
  assert.equal(nav!.hasNext, false)
  assert.equal(nav!.nextId, null)
  assert.equal(nav!.prevId, 20)
})

test('getProjectNavigation: unknown id returns null', () => {
  assert.equal(getProjectNavigation(fixture, 999), null)
})

test('getProjectNavigation: NaN id returns null (e.g. /projects/abc)', () => {
  assert.equal(getProjectNavigation(fixture, Number('abc')), null)
})

test('getProjectNavigation: empty list returns null', () => {
  assert.equal(getProjectNavigation([], 1), null)
})

test('getProjectNavigation: works against the real projects data', () => {
  assert.ok(realProjects.length > 0, 'projects data is non-empty')

  // All real ids resolve.
  for (const p of realProjects) {
    const nav = getProjectNavigation(realProjects, p.id)
    assert.ok(nav, `expected nav for id ${p.id}`)
    assert.equal(nav!.project.id, p.id)
  }

  // Project ids must be unique (otherwise findIndex semantics break navigation).
  const ids = realProjects.map((p) => p.id)
  assert.equal(new Set(ids).size, ids.length, 'project ids must be unique')
})
