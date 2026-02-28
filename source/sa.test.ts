import { describe, expect, it } from 'vitest'
import { validateLayout } from '~/grid.ts'
import { computeCost, deriveFlows } from '~/objective.ts'
import { randomLayout } from '~/perturbation.ts'
import { routeFlows } from '~/routing.ts'
import { solve } from '~/sa.ts'
import type { Problem, SAConfig } from '~/types.ts'
import { Resource } from '~/types.ts'

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

const config: SAConfig = {
  initialTemperature: 500,
  coolingRate: 0.95,
  iterationsPerTemp: 20,
  minTemperature: 1,
  roadWeight: 1
}

const seededRng = (seed: number): (() => number) => {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    return s / 0x7fffffff
  }
}

describe('solve', () => {
  it('should return a valid layout', () => {
    const result = solve(problem, config, seededRng(42))
    expect(validateLayout(problem.gridWidth, problem.gridHeight, result.layout.placements, problem.buildings)).toBe(
      true
    )
  })

  it('should place all buildings', () => {
    const result = solve(problem, config, seededRng(42))
    expect(result.layout.placements).toHaveLength(problem.buildings.length)
  })

  it('should include roads in the result', () => {
    const result = solve(problem, config, seededRng(42))
    expect(result.roads).toBeDefined()
    expect(Array.isArray(result.roads)).toBe(true)
  })

  it('should improve over average random layout cost', () => {
    const rng = seededRng(42)
    const flows = deriveFlows(problem.buildings)

    const randomCosts: number[] = []
    for (let i = 0; i < 10; i++) {
      const layout = randomLayout(problem, seededRng(i * 1000))
      const routing = routeFlows(layout, problem, flows)
      randomCosts.push(computeCost(flows, routing.pathLengths, routing.roads.length, config.roadWeight))
    }
    const avgRandomCost = randomCosts.reduce((a, b) => a + b, 0) / randomCosts.length

    const result = solve(problem, config, rng)
    expect(result.cost).toBeLessThan(avgRandomCost)
  })

  it('should track iteration count', () => {
    const result = solve(problem, config, seededRng(42))
    expect(result.iterations).toBeGreaterThan(0)
  })
})
