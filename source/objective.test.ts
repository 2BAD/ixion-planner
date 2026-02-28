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
  it('should proportionally allocate flows with multiple suppliers and consumers', () => {
    const buildings: BuildingTemplate[] = [
      { name: 'S1', size: { width: 1, height: 1 }, inputs: [], outputs: [{ resource: Resource.Power, volume: 6 }] },
      { name: 'S2', size: { width: 1, height: 1 }, inputs: [], outputs: [{ resource: Resource.Power, volume: 4 }] },
      { name: 'C1', size: { width: 1, height: 1 }, inputs: [{ resource: Resource.Power, volume: 3 }], outputs: [] },
      { name: 'C2', size: { width: 1, height: 1 }, inputs: [{ resource: Resource.Power, volume: 5 }], outputs: [] },
      { name: 'C3', size: { width: 1, height: 1 }, inputs: [{ resource: Resource.Power, volume: 2 }], outputs: [] }
    ]

    const flows = deriveFlows(buildings)
    expect(flows).toHaveLength(6) // 2 suppliers x 3 consumers

    // totalSupply = 10, totalDemand = 10, actualFlow = 10
    // Each flow = 10 * (supplier.volume / 10) * (consumer.volume / 10)
    const totalVolume = flows.reduce((sum, f) => sum + f.volume, 0)
    expect(totalVolume).toBe(10)

    // S1 (volume 6) -> C2 (volume 5): 10 * (6/10) * (5/10) = 3
    const s1c2 = flows.find((f) => f.sourceIndex === 0 && f.targetIndex === 3)
    expect(s1c2?.volume).toBe(3)
  })

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
        outputs: [{ resource: Resource.Iron, volume: 8 }]
      },
      {
        name: 'Alloy Foundry',
        size: { width: 4, height: 4 },
        inputs: [
          { resource: Resource.Power, volume: 4 },
          { resource: Resource.Iron, volume: 6 }
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

    const ironFlow = flows.find((f) => f.resource === Resource.Iron)
    expect(ironFlow).toEqual({
      sourceIndex: 1,
      targetIndex: 2,
      resource: Resource.Iron,
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
