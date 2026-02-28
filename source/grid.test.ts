import { describe, expect, it } from 'vitest'
import {
  buildOccupancyGrid,
  clearBuilding,
  createOccupancyGrid,
  isAreaFree,
  isAreaFreeExcluding,
  isWithinBounds,
  markBuilding,
  validateLayout
} from '~/grid.ts'

describe('createOccupancyGrid', () => {
  it('should create a grid of the correct size filled with zeros', () => {
    const grid = createOccupancyGrid(5, 3)
    expect(grid.length).toBe(15)
    expect(grid.every((v) => v === 0)).toBe(true)
  })
})

describe('isWithinBounds', () => {
  it('should return true when building fits within grid', () => {
    expect(isWithinBounds({ x: 0, y: 0 }, { width: 3, height: 3 }, 10, 10)).toBe(true)
  })

  it('should return true when building fits at grid edge', () => {
    expect(isWithinBounds({ x: 7, y: 7 }, { width: 3, height: 3 }, 10, 10)).toBe(true)
  })

  it('should return false when building extends beyond right edge', () => {
    expect(isWithinBounds({ x: 8, y: 0 }, { width: 3, height: 3 }, 10, 10)).toBe(false)
  })

  it('should return false when building extends beyond bottom edge', () => {
    expect(isWithinBounds({ x: 0, y: 8 }, { width: 3, height: 3 }, 10, 10)).toBe(false)
  })

  it('should return false for negative positions', () => {
    expect(isWithinBounds({ x: -1, y: 0 }, { width: 3, height: 3 }, 10, 10)).toBe(false)
  })
})

describe('markBuilding and clearBuilding', () => {
  it('should mark and then clear cells', () => {
    const grid = createOccupancyGrid(5, 5)
    markBuilding(grid, 5, { x: 1, y: 1 }, { width: 2, height: 2 }, 1)

    expect(grid[6]).toBe(1)
    expect(grid[7]).toBe(1)
    expect(grid[11]).toBe(1)
    expect(grid[12]).toBe(1)
    expect(grid[0]).toBe(0)

    clearBuilding(grid, 5, { x: 1, y: 1 }, { width: 2, height: 2 })
    expect(grid[6]).toBe(0)
    expect(grid[7]).toBe(0)
  })
})

describe('isAreaFree', () => {
  it('should return true for empty area', () => {
    const grid = createOccupancyGrid(5, 5)
    expect(isAreaFree(grid, 5, { x: 0, y: 0 }, { width: 3, height: 3 })).toBe(true)
  })

  it('should return false when area is occupied', () => {
    const grid = createOccupancyGrid(5, 5)
    markBuilding(grid, 5, { x: 1, y: 1 }, { width: 2, height: 2 }, 1)
    expect(isAreaFree(grid, 5, { x: 0, y: 0 }, { width: 3, height: 3 })).toBe(false)
  })
})

describe('isAreaFreeExcluding', () => {
  it('should ignore cells with the excluded marker', () => {
    const grid = createOccupancyGrid(5, 5)
    markBuilding(grid, 5, { x: 1, y: 1 }, { width: 2, height: 2 }, 1)
    expect(isAreaFreeExcluding(grid, 5, { x: 0, y: 0 }, { width: 3, height: 3 }, 1)).toBe(true)
  })

  it('should detect other markers as occupied', () => {
    const grid = createOccupancyGrid(5, 5)
    markBuilding(grid, 5, { x: 1, y: 1 }, { width: 2, height: 2 }, 1)
    markBuilding(grid, 5, { x: 3, y: 0 }, { width: 1, height: 1 }, 2)
    expect(isAreaFreeExcluding(grid, 5, { x: 0, y: 0 }, { width: 5, height: 1 }, 1)).toBe(false)
  })
})

describe('buildOccupancyGrid', () => {
  it('should mark all placements on the grid', () => {
    const buildings = [
      { name: 'A', size: { width: 2, height: 2 }, inputs: [], outputs: [], connections: [{ x: 0, y: 0 }] },
      { name: 'B', size: { width: 1, height: 1 }, inputs: [], outputs: [], connections: [{ x: 0, y: 0 }] }
    ]
    const placements = [
      { templateIndex: 0, position: { x: 0, y: 0 } },
      { templateIndex: 1, position: { x: 3, y: 3 } }
    ]
    const grid = buildOccupancyGrid(5, 5, placements, buildings)

    expect(grid[0]).toBe(1)
    expect(grid[1]).toBe(1)
    expect(grid[5]).toBe(1)
    expect(grid[6]).toBe(1)
    expect(grid[18]).toBe(2)
    expect(grid[2]).toBe(0)
  })
})

describe('validateLayout', () => {
  it('should return true for a valid non-overlapping layout', () => {
    const buildings = [
      { name: 'A', size: { width: 2, height: 2 }, inputs: [], outputs: [], connections: [{ x: 0, y: 0 }] },
      { name: 'B', size: { width: 2, height: 2 }, inputs: [], outputs: [], connections: [{ x: 0, y: 0 }] }
    ]
    const placements = [
      { templateIndex: 0, position: { x: 0, y: 0 } },
      { templateIndex: 1, position: { x: 3, y: 0 } }
    ]
    expect(validateLayout(5, 5, placements, buildings)).toBe(true)
  })

  it('should return false for overlapping buildings', () => {
    const buildings = [
      { name: 'A', size: { width: 2, height: 2 }, inputs: [], outputs: [], connections: [{ x: 0, y: 0 }] },
      { name: 'B', size: { width: 2, height: 2 }, inputs: [], outputs: [], connections: [{ x: 0, y: 0 }] }
    ]
    const placements = [
      { templateIndex: 0, position: { x: 0, y: 0 } },
      { templateIndex: 1, position: { x: 1, y: 1 } }
    ]
    expect(validateLayout(5, 5, placements, buildings)).toBe(false)
  })

  it('should return false for out-of-bounds placement', () => {
    const buildings = [
      { name: 'A', size: { width: 3, height: 3 }, inputs: [], outputs: [], connections: [{ x: 0, y: 0 }] }
    ]
    const placements = [{ templateIndex: 0, position: { x: 8, y: 8 } }]
    expect(validateLayout(10, 10, placements, buildings)).toBe(false)
  })
})
