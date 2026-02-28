import { describe, expect, it } from 'vitest'
import { compose } from '~/compose.ts'
import { ALLOY_FOUNDRY, ELECTRONICS_FACTORY, POWER_PLANT, STEEL_MILL } from '~/data.ts'
import type { BuildingTemplate } from '~/types.ts'
import { Resource } from '~/types.ts'

const catalog: BuildingTemplate[] = [POWER_PLANT, STEEL_MILL, ALLOY_FOUNDRY, ELECTRONICS_FACTORY]

const countByName = (buildings: BuildingTemplate[], name: string): number =>
  buildings.filter((b) => b.name === name).length

describe('compose', () => {
  it('should compose a linear chain for 3 Electronics', () => {
    const result = compose(catalog, [{ resource: Resource.Electronics, volume: 3 }])

    expect(result).toHaveLength(5)
    expect(countByName(result, 'Electronics Factory')).toBe(1)
    expect(countByName(result, 'Alloy Foundry')).toBe(1)
    expect(countByName(result, 'Steel Mill')).toBe(1)
    expect(countByName(result, 'Power Plant')).toBe(2)
  })

  it('should scale up for higher demand (6 Electronics)', () => {
    const result = compose(catalog, [{ resource: Resource.Electronics, volume: 6 }])

    expect(result).toHaveLength(9)
    expect(countByName(result, 'Electronics Factory')).toBe(2)
    expect(countByName(result, 'Alloy Foundry')).toBe(2)
    expect(countByName(result, 'Steel Mill')).toBe(2)
    expect(countByName(result, 'Power Plant')).toBe(3)
  })

  it('should handle single-step production (10 Power)', () => {
    const result = compose(catalog, [{ resource: Resource.Power, volume: 10 }])

    expect(result).toHaveLength(1)
    expect(countByName(result, 'Power Plant')).toBe(1)
  })

  it('should round up building count (11 Power)', () => {
    const result = compose(catalog, [{ resource: Resource.Power, volume: 11 }])

    expect(result).toHaveLength(2)
    expect(countByName(result, 'Power Plant')).toBe(2)
  })

  it('should throw for missing producer', () => {
    expect(() => compose(catalog, [{ resource: Resource.Food, volume: 1 }])).toThrow(
      'No producer found for resource: Food'
    )
  })

  it('should handle multiple targets (8 Iron + 5 Alloy)', () => {
    const result = compose(catalog, [
      { resource: Resource.Iron, volume: 8 },
      { resource: Resource.Alloy, volume: 5 }
    ])

    expect(result).toHaveLength(5)
    expect(countByName(result, 'Alloy Foundry')).toBe(1)
    expect(countByName(result, 'Steel Mill')).toBe(2)
    expect(countByName(result, 'Power Plant')).toBe(2)
  })

  it('should return empty for empty targets', () => {
    const result = compose(catalog, [])
    expect(result).toHaveLength(0)
  })
})
