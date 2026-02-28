import { describe, expect, it } from 'vitest'
import { deriveFlows } from '~/objective.ts'
import { routeFlows } from '~/routing.ts'
import type { BuildingTemplate, Flow, Layout, Problem } from '~/types.ts'
import { Resource } from '~/types.ts'

describe('routeFlows', () => {
  it('should route a simple two-building flow', () => {
    // 6x1 grid: [A][A][.][.][B][B]
    const buildings: BuildingTemplate[] = [
      {
        name: 'A',
        size: { width: 2, height: 1 },
        inputs: [],
        outputs: [{ resource: Resource.Power, volume: 10 }],
        connections: [{ x: 1, y: 0 }]
      },
      {
        name: 'B',
        size: { width: 2, height: 1 },
        inputs: [{ resource: Resource.Power, volume: 5 }],
        outputs: [],
        connections: [{ x: 0, y: 0 }]
      }
    ]
    const problem: Problem = { gridWidth: 6, gridHeight: 1, buildings }
    const layout: Layout = {
      placements: [
        { templateIndex: 0, position: { x: 0, y: 0 } },
        { templateIndex: 1, position: { x: 4, y: 0 } }
      ]
    }
    const flows = deriveFlows(buildings)
    const result = routeFlows(layout, problem, flows)

    expect(result.pathLengths).toHaveLength(1)
    expect(result.pathLengths[0]).toBe(2) // cells (2,0) and (3,0)
    expect(result.roads).toHaveLength(2)
    expect(result.roads).toContainEqual({ x: 2, y: 0 })
    expect(result.roads).toContainEqual({ x: 3, y: 0 })
  })

  it('should pick the shortest connection point pair', () => {
    // 8x1 grid: [A][A][.][.][.][.][B][B]
    // A has connections at left(0,0) and right(1,0)
    // B has connections at left(0,0) and right(1,0)
    // Best pair: A's right (abs x=1) to B's left (abs x=6) = 4 road cells
    const buildings: BuildingTemplate[] = [
      {
        name: 'A',
        size: { width: 2, height: 1 },
        inputs: [],
        outputs: [{ resource: Resource.Power, volume: 10 }],
        connections: [
          { x: 0, y: 0 },
          { x: 1, y: 0 }
        ]
      },
      {
        name: 'B',
        size: { width: 2, height: 1 },
        inputs: [{ resource: Resource.Power, volume: 5 }],
        outputs: [],
        connections: [
          { x: 0, y: 0 },
          { x: 1, y: 0 }
        ]
      }
    ]
    const problem: Problem = { gridWidth: 8, gridHeight: 1, buildings }
    const layout: Layout = {
      placements: [
        { templateIndex: 0, position: { x: 0, y: 0 } },
        { templateIndex: 1, position: { x: 6, y: 0 } }
      ]
    }
    const flows = deriveFlows(buildings)
    const result = routeFlows(layout, problem, flows)

    expect(result.pathLengths[0]).toBe(4) // cells 2,3,4,5
  })

  it('should deduplicate road cells shared by multiple flows', () => {
    // A produces Power and Iron, B consumes both
    // Same path used for both flows
    const buildings: BuildingTemplate[] = [
      {
        name: 'A',
        size: { width: 1, height: 1 },
        inputs: [],
        outputs: [
          { resource: Resource.Power, volume: 5 },
          { resource: Resource.Iron, volume: 3 }
        ],
        connections: [{ x: 0, y: 0 }]
      },
      {
        name: 'B',
        size: { width: 1, height: 1 },
        inputs: [
          { resource: Resource.Power, volume: 5 },
          { resource: Resource.Iron, volume: 3 }
        ],
        outputs: [],
        connections: [{ x: 0, y: 0 }]
      }
    ]
    const problem: Problem = { gridWidth: 4, gridHeight: 1, buildings }
    const layout: Layout = {
      placements: [
        { templateIndex: 0, position: { x: 0, y: 0 } },
        { templateIndex: 1, position: { x: 3, y: 0 } }
      ]
    }
    const flows = deriveFlows(buildings)
    expect(flows).toHaveLength(2) // Power flow + Iron flow

    const result = routeFlows(layout, problem, flows)

    // Both flows use same 2 road cells (1,0) and (2,0)
    expect(result.roads).toHaveLength(2)
    expect(result.pathLengths[0]).toBe(2)
    expect(result.pathLengths[1]).toBe(2)
  })

  it('should return -1 for unroutable flows', () => {
    // 3x1 grid: [A][##][B] - wall blocks all paths
    const buildings: BuildingTemplate[] = [
      {
        name: 'A',
        size: { width: 1, height: 1 },
        inputs: [],
        outputs: [{ resource: Resource.Power, volume: 5 }],
        connections: [{ x: 0, y: 0 }]
      },
      {
        name: 'Wall',
        size: { width: 1, height: 1 },
        inputs: [],
        outputs: [],
        connections: [{ x: 0, y: 0 }]
      },
      {
        name: 'B',
        size: { width: 1, height: 1 },
        inputs: [{ resource: Resource.Power, volume: 5 }],
        outputs: [],
        connections: [{ x: 0, y: 0 }]
      }
    ]
    const problem: Problem = { gridWidth: 3, gridHeight: 1, buildings }
    const layout: Layout = {
      placements: [
        { templateIndex: 0, position: { x: 0, y: 0 } },
        { templateIndex: 1, position: { x: 1, y: 0 } },
        { templateIndex: 2, position: { x: 2, y: 0 } }
      ]
    }
    const flows: Flow[] = [{ sourceIndex: 0, targetIndex: 2, resource: Resource.Power, volume: 5 }]
    const result = routeFlows(layout, problem, flows)

    expect(result.pathLengths[0]).toBe(-1)
    expect(result.roads).toHaveLength(0)
  })

  it('should handle empty flows array', () => {
    const buildings: BuildingTemplate[] = [
      {
        name: 'A',
        size: { width: 1, height: 1 },
        inputs: [],
        outputs: [],
        connections: [{ x: 0, y: 0 }]
      }
    ]
    const problem: Problem = { gridWidth: 5, gridHeight: 5, buildings }
    const layout: Layout = {
      placements: [{ templateIndex: 0, position: { x: 0, y: 0 } }]
    }
    const result = routeFlows(layout, problem, [])

    expect(result.roads).toHaveLength(0)
    expect(result.pathLengths).toHaveLength(0)
  })
})
