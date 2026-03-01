import { describe, expect, it } from 'vitest'
import { validateLayout } from '~/grid.ts'
import { moveBuilding, perturb, randomLayout, rotateBuilding, swapBuildings } from '~/perturbation.ts'
import type { Layout, Problem } from '~/types.ts'
import { Resource } from '~/types.ts'

const assertLayout = (value: Layout | null): Layout => {
  expect(value).not.toBeNull()
  return value as Layout
}

const problem: Problem = {
  gridWidth: 20,
  gridHeight: 20,
  buildings: [
    {
      name: 'Power Plant',
      size: { width: 3, height: 3 },
      inputs: [],
      outputs: [{ resource: Resource.Power, volume: 10 }],
      connections: [{ x: 1, y: 2 }]
    },
    {
      name: 'Steel Mill',
      size: { width: 4, height: 3 },
      inputs: [{ resource: Resource.Power, volume: 5 }],
      outputs: [{ resource: Resource.Iron, volume: 8 }],
      connections: [
        { x: 0, y: 1 },
        { x: 3, y: 1 }
      ]
    },
    {
      name: 'Alloy Foundry',
      size: { width: 4, height: 4 },
      inputs: [
        { resource: Resource.Power, volume: 4 },
        { resource: Resource.Iron, volume: 6 }
      ],
      outputs: [{ resource: Resource.Alloy, volume: 5 }],
      connections: [
        { x: 0, y: 2 },
        { x: 3, y: 2 }
      ]
    },
    {
      name: 'Electronics Factory',
      size: { width: 3, height: 4 },
      inputs: [
        { resource: Resource.Power, volume: 3 },
        { resource: Resource.Alloy, volume: 4 }
      ],
      outputs: [{ resource: Resource.Electronics, volume: 3 }],
      connections: [
        { x: 1, y: 0 },
        { x: 1, y: 3 }
      ]
    }
  ]
}

const seededRng = (seed: number): (() => number) => {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    return s / 0x7fffffff
  }
}

describe('randomLayout', () => {
  it('should produce a valid layout with all buildings placed', () => {
    const rng = seededRng(42)
    const layout = randomLayout(problem, rng)

    expect(layout.placements).toHaveLength(4)
    expect(validateLayout(problem.gridWidth, problem.gridHeight, layout.placements, problem.buildings)).toBe(true)
  })

  it('should produce deterministic results with same seed', () => {
    const layout1 = randomLayout(problem, seededRng(123))
    const layout2 = randomLayout(problem, seededRng(123))

    expect(layout1).toEqual(layout2)
  })
})

describe('moveBuilding', () => {
  it('should produce a valid layout different from the original', () => {
    const rng = seededRng(42)
    const layout = randomLayout(problem, rng)
    const moved = moveBuilding(layout, problem, rng)

    const result = assertLayout(moved)
    expect(validateLayout(problem.gridWidth, problem.gridHeight, result.placements, problem.buildings)).toBe(true)
    expect(result).not.toEqual(layout)
  })
})

describe('swapBuildings', () => {
  it('should produce a valid layout when swap is possible', () => {
    const rng = seededRng(99)
    const layout = randomLayout(problem, rng)

    let swapped: ReturnType<typeof swapBuildings> = null
    for (let i = 0; i < 20; i++) {
      swapped = swapBuildings(layout, problem, seededRng(i))
      if (swapped !== null) {
        break
      }
    }

    const result = assertLayout(swapped)
    expect(validateLayout(problem.gridWidth, problem.gridHeight, result.placements, problem.buildings)).toBe(true)
  })
})

describe('rotateBuilding', () => {
  it('should produce a valid layout with a different orientation', () => {
    const rng = seededRng(42)
    const layout = randomLayout(problem, rng)

    let rotated: ReturnType<typeof rotateBuilding> = null
    for (let i = 0; i < 20; i++) {
      rotated = rotateBuilding(layout, problem, seededRng(i))
      if (rotated !== null) {
        break
      }
    }

    const result = assertLayout(rotated)
    expect(validateLayout(problem.gridWidth, problem.gridHeight, result.placements, problem.buildings)).toBe(true)

    // At least one placement should have a different orientation
    const changed = result.placements.some((p, i) => p.orientation !== layout.placements[i].orientation)
    expect(changed).toBe(true)
  })
})

describe('perturb', () => {
  it('should produce a valid neighbor layout', () => {
    const rng = seededRng(77)
    const layout = randomLayout(problem, rng)

    let neighbor: ReturnType<typeof perturb> = null
    for (let i = 0; i < 20; i++) {
      neighbor = perturb(layout, problem, seededRng(i))
      if (neighbor !== null) {
        break
      }
    }

    const result = assertLayout(neighbor)
    expect(validateLayout(problem.gridWidth, problem.gridHeight, result.placements, problem.buildings)).toBe(true)
  })
})
