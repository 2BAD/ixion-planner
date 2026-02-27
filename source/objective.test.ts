import { describe, expect, it } from 'vitest'
import { centroid, computeCost, deriveFlows, manhattanDistance } from '~/objective.ts'
import { Resource } from '~/types.ts'
import type { BuildingTemplate, Layout } from '~/types.ts'

describe('centroid', () => {
  it('should compute the center of a building', () => {
    const c = centroid({ x: 0, y: 0 }, { width: 4, height: 2 })
    expect(c).toEqual({ x: 2, y: 1 })
  })

  it('should handle offset positions', () => {
    const c = centroid({ x: 3, y: 5 }, { width: 2, height: 4 })
    expect(c).toEqual({ x: 4, y: 7 })
  })
})

describe('manhattanDistance', () => {
  it('should compute distance between two points', () => {
    expect(manhattanDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7)
  })

  it('should return 0 for same point', () => {
    expect(manhattanDistance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0)
  })
})

describe('deriveFlows', () => {
  it('should derive 5 flows from the 4-building chain', () => {
    const buildings: BuildingTemplate[] = [
      {
        name: 'Power Plant',
        size: { width: 3, height: 3 },
        inputs: [],
        outputs: [{ resource: Resource.Power, volume: 10 }]
      },
      {
        name: 'Steel Mill',
        size: { width: 4, height: 3 },
        inputs: [{ resource: Resource.Power, volume: 5 }],
        outputs: [{ resource: Resource.Steel, volume: 8 }]
      },
      {
        name: 'Alloy Foundry',
        size: { width: 4, height: 4 },
        inputs: [
          { resource: Resource.Power, volume: 4 },
          { resource: Resource.Steel, volume: 6 }
        ],
        outputs: [{ resource: Resource.Alloy, volume: 5 }]
      },
      {
        name: 'Electronics Factory',
        size: { width: 3, height: 4 },
        inputs: [
          { resource: Resource.Power, volume: 3 },
          { resource: Resource.Alloy, volume: 4 }
        ],
        outputs: [{ resource: Resource.Electronics, volume: 3 }]
      }
    ]

    const flows = deriveFlows(buildings)
    expect(flows).toHaveLength(5)

    const powerFlows = flows.filter((f) => f.resource === Resource.Power)
    expect(powerFlows).toHaveLength(3)
    expect(powerFlows.every((f) => f.sourceIndex === 0)).toBe(true)

    const steelFlow = flows.find((f) => f.resource === Resource.Steel)
    expect(steelFlow).toEqual({
      sourceIndex: 1,
      targetIndex: 2,
      resource: Resource.Steel,
      volume: 6
    })

    const alloyFlow = flows.find((f) => f.resource === Resource.Alloy)
    expect(alloyFlow).toEqual({
      sourceIndex: 2,
      targetIndex: 3,
      resource: Resource.Alloy,
      volume: 4
    })
  })
})

describe('computeCost', () => {
  it('should compute weighted manhattan distance cost', () => {
    const buildings: BuildingTemplate[] = [
      { name: 'A', size: { width: 2, height: 2 }, inputs: [], outputs: [{ resource: Resource.Power, volume: 10 }] },
      { name: 'B', size: { width: 2, height: 2 }, inputs: [{ resource: Resource.Power, volume: 5 }], outputs: [] }
    ]
    const flows = deriveFlows(buildings)
    const layout: Layout = {
      placements: [
        { templateIndex: 0, position: { x: 0, y: 0 } },
        { templateIndex: 1, position: { x: 4, y: 0 } }
      ]
    }

    // centroid A = (1, 1), centroid B = (5, 1), distance = 4, volume = 5
    const cost = computeCost(layout, buildings, flows)
    expect(cost).toBe(20)
  })
})
