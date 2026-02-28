import type { Position } from '~/types.ts'

const DIRECTIONS: Position[] = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 }
]

const reconstructPath = (parent: Int32Array, endIdx: number, gridWidth: number): Position[] => {
  const path: Position[] = []
  let current = endIdx

  while (current >= 0 && parent[current] !== -2) {
    path.push({ x: current % gridWidth, y: Math.floor(current / gridWidth) })
    current = parent[current]
  }

  // Add the seed cell (parent === -2)
  if (current >= 0) {
    path.push({ x: current % gridWidth, y: Math.floor(current / gridWidth) })
  }

  path.reverse()
  return path
}

export const bfs = (
  grid: Uint8Array,
  gridWidth: number,
  gridHeight: number,
  start: Position,
  end: Position
): Position[] | null => {
  const startIdx = start.y * gridWidth + start.x
  const endIdx = end.y * gridWidth + end.x

  if (startIdx === endIdx) {
    return []
  }

  // Seed BFS from non-building cells adjacent to start
  const visited = new Uint8Array(gridWidth * gridHeight)
  const parent = new Int32Array(gridWidth * gridHeight).fill(-1)
  const queue: number[] = []

  for (const d of DIRECTIONS) {
    const nx = start.x + d.x
    const ny = start.y + d.y
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      const idx = ny * gridWidth + nx
      if (grid[idx] === 0 && !visited[idx]) {
        visited[idx] = 1
        parent[idx] = -2 // sentinel: seeded from start
        queue.push(idx)
      }
    }
  }

  // BFS target: non-building cells adjacent to end
  const targetSet = new Set<number>()
  for (const d of DIRECTIONS) {
    const nx = end.x + d.x
    const ny = end.y + d.y
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      const idx = ny * gridWidth + nx
      if (grid[idx] === 0) {
        targetSet.add(idx)
      }
    }
  }

  if (targetSet.size === 0 || queue.length === 0) {
    return null
  }

  // Check if any seed is already a target (buildings adjacent to each other)
  for (const idx of queue) {
    if (targetSet.has(idx)) {
      const x = idx % gridWidth
      const y = Math.floor(idx / gridWidth)
      return [{ x, y }]
    }
  }

  let head = 0
  while (head < queue.length) {
    const current = queue[head++]

    const cx = current % gridWidth
    const cy = Math.floor(current / gridWidth)

    for (const d of DIRECTIONS) {
      const nx = cx + d.x
      const ny = cy + d.y
      if (nx < 0 || nx >= gridWidth || ny < 0 || ny >= gridHeight) {
        continue
      }

      const nIdx = ny * gridWidth + nx
      if (visited[nIdx] || grid[nIdx] !== 0) {
        continue
      }

      visited[nIdx] = 1
      parent[nIdx] = current

      if (targetSet.has(nIdx)) {
        return reconstructPath(parent, nIdx, gridWidth)
      }

      queue.push(nIdx)
    }
  }

  return null
}
