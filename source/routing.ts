import { buildOccupancyGrid } from '~/grid.ts'
import { bfsMulti, createBfsBuffers } from '~/pathfinding.ts'
import type { BfsBuffers } from '~/pathfinding.ts'
import type { Flow, Layout, Position, Problem } from '~/types.ts'

export type RoutingResult = {
  roads: Position[]
  pathLengths: number[]
}

export const routeFlows = (layout: Layout, problem: Problem, flows: Flow[], buffers?: BfsBuffers): RoutingResult => {
  const grid = buildOccupancyGrid(problem.gridWidth, problem.gridHeight, layout.placements, problem.buildings)
  const buf = buffers ?? createBfsBuffers(problem.gridWidth, problem.gridHeight)
  const roadSet = new Set<number>()
  const pathLengths: number[] = []

  for (const flow of flows) {
    const sourcePlacement = layout.placements[flow.sourceIndex]
    const targetPlacement = layout.placements[flow.targetIndex]
    const sourceBuilding = problem.buildings[sourcePlacement.templateIndex]
    const targetBuilding = problem.buildings[targetPlacement.templateIndex]

    const sourceConnections = sourceBuilding.connections.map((c) => ({
      x: sourcePlacement.position.x + c.x,
      y: sourcePlacement.position.y + c.y
    }))
    const targetConnections = targetBuilding.connections.map((c) => ({
      x: targetPlacement.position.x + c.x,
      y: targetPlacement.position.y + c.y
    }))

    const path = bfsMulti(grid, problem.gridWidth, problem.gridHeight, sourceConnections, targetConnections, buf)

    if (path === null) {
      pathLengths.push(-1)
    } else {
      pathLengths.push(path.length)
      for (const cell of path) {
        roadSet.add(cell.y * problem.gridWidth + cell.x)
      }
    }
  }

  const roads: Position[] = []
  for (const idx of roadSet) {
    roads.push({ x: idx % problem.gridWidth, y: Math.floor(idx / problem.gridWidth) })
  }

  return { roads, pathLengths }
}
