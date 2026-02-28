import { describe, expect, it } from 'vitest'
import { bfs } from '~/pathfinding.ts'

const makeGrid = (width: number, height: number, blocked: { x: number; y: number }[] = []): Uint8Array => {
  const grid = new Uint8Array(width * height)
  for (const b of blocked) {
    grid[b.y * width + b.x] = 1
  }
  return grid
}

describe('bfs', () => {
  it('should find a path between adjacent connection points', () => {
    // 5x1 grid: [B1][.][.][.][B2]
    // B1 connection at (0,0), B2 connection at (4,0)
    const grid = makeGrid(5, 1)
    grid[0] = 1 // building 1
    grid[4] = 2 // building 2

    const path = bfs(grid, 5, 1, { x: 0, y: 0 }, { x: 4, y: 0 })
    expect(path).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 }
    ])
  })

  it('should find a single-cell path when buildings are one cell apart', () => {
    // [B1][.][B2]
    const grid = makeGrid(3, 1)
    grid[0] = 1
    grid[2] = 2

    const path = bfs(grid, 3, 1, { x: 0, y: 0 }, { x: 2, y: 0 })
    expect(path).toEqual([{ x: 1, y: 0 }])
  })

  it('should return empty array when connection points are the same', () => {
    const grid = makeGrid(3, 3)
    grid[4] = 1

    const path = bfs(grid, 3, 3, { x: 1, y: 1 }, { x: 1, y: 1 })
    expect(path).toEqual([])
  })

  it('should navigate around obstacles', () => {
    // 5x3 grid:
    // [.][B1][.][.][.]
    // [.][##][##][##][.]
    // [.][.][.][B2][.]
    const grid = makeGrid(5, 3)
    grid[1] = 1 // B1 at (1,0)
    grid[6] = 3 // wall
    grid[7] = 3 // wall
    grid[8] = 3 // wall
    grid[13] = 2 // B2 at (3,2)

    const path = bfs(grid, 5, 3, { x: 1, y: 0 }, { x: 3, y: 2 })
    expect(path).not.toBeNull()
    expect(path?.length).toBeGreaterThan(2)
    for (const p of path ?? []) {
      expect(grid[p.y * 5 + p.x]).toBe(0)
    }
  })

  it('should return null when no path exists', () => {
    // 3x3 grid, B2 completely surrounded by walls:
    // [B1][##][.]
    // [##][B2][##]
    // [.][##][.]
    const grid = makeGrid(3, 3)
    grid[0] = 1 // B1
    grid[1] = 3 // wall
    grid[3] = 3 // wall
    grid[4] = 2 // B2
    grid[5] = 3 // wall
    grid[7] = 3 // wall

    const path = bfs(grid, 3, 3, { x: 0, y: 0 }, { x: 1, y: 1 })
    expect(path).toBeNull()
  })

  it('should return null when connection point has no adjacent free cells', () => {
    // 3x3 grid, B2 completely surrounded:
    // [##][##][##]
    // [##][B2][##]
    // [##][##][##]
    const grid = makeGrid(3, 3)
    for (let i = 0; i < 9; i++) {
      grid[i] = i === 4 ? 2 : 3
    }

    // B1 at edge with no adjacent free cells either
    const path = bfs(grid, 3, 3, { x: 0, y: 0 }, { x: 1, y: 1 })
    expect(path).toBeNull()
  })

  it('should find shortest path on a larger grid', () => {
    // 5x5 open grid with buildings at corners
    const grid = makeGrid(5, 5)
    grid[0] = 1 // B1 at (0,0)
    grid[24] = 2 // B2 at (4,4)

    const path = bfs(grid, 5, 5, { x: 0, y: 0 }, { x: 4, y: 4 })
    expect(path).not.toBeNull()
    // Shortest Manhattan path from (0,0) adj to (4,4) adj = 7 cells
    // Adjacent to (0,0): (1,0) or (0,1)
    // Adjacent to (4,4): (3,4) or (4,3)
    // Shortest: e.g. (1,0)->(2,0)->(3,0)->(4,0)->(4,1)->(4,2)->(4,3) = 7
    expect(path?.length).toBe(7)
  })

  it('should handle buildings that are directly adjacent', () => {
    // [B1][B2]
    // [.][.]
    const grid = makeGrid(2, 2)
    grid[0] = 1 // B1 at (0,0)
    grid[1] = 2 // B2 at (1,0)

    // B1's connection at (0,0), B2's connection at (1,0)
    // Adjacent free cells of B1: (0,1)
    // Adjacent free cells of B2: (1,1)
    const path = bfs(grid, 2, 2, { x: 0, y: 0 }, { x: 1, y: 0 })
    expect(path).not.toBeNull()
    expect(path?.length).toBe(2) // (0,1) -> (1,1)
  })
})
