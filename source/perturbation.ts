import {
  buildOccupancyGrid,
  clearBuilding,
  isAreaFree,
  isAreaFreeExcluding,
  isWithinBounds,
  markBuilding
} from '~/grid.ts'
import type { Layout, Problem } from '~/types.ts'

const MAX_ATTEMPTS = 100

export const randomLayout = (problem: Problem, rng: () => number, maxAttempts: number = MAX_ATTEMPTS): Layout => {
  const placements: Layout['placements'] = []
  const grid = new Uint8Array(problem.gridWidth * problem.gridHeight)

  for (let i = 0; i < problem.buildings.length; i++) {
    const building = problem.buildings[i]
    let placed = false

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = Math.floor(rng() * (problem.gridWidth - building.size.width + 1))
      const y = Math.floor(rng() * (problem.gridHeight - building.size.height + 1))
      const position = { x, y }

      if (isAreaFree(grid, problem.gridWidth, position, building.size)) {
        markBuilding(grid, problem.gridWidth, position, building.size, i + 1)
        placements.push({ templateIndex: i, position })
        placed = true
        break
      }
    }

    if (!placed) {
      throw new Error(`failed to place building ${building.name} after ${maxAttempts} attempts`)
    }
  }

  return { placements }
}

export const moveBuilding = (layout: Layout, problem: Problem, rng: () => number): Layout | null => {
  const idx = Math.floor(rng() * layout.placements.length)
  const placement = layout.placements[idx]
  const building = problem.buildings[placement.templateIndex]
  const grid = buildOccupancyGrid(problem.gridWidth, problem.gridHeight, layout.placements, problem.buildings)

  clearBuilding(grid, problem.gridWidth, placement.position, building.size)

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const x = Math.floor(rng() * (problem.gridWidth - building.size.width + 1))
    const y = Math.floor(rng() * (problem.gridHeight - building.size.height + 1))
    const position = { x, y }

    if (isAreaFree(grid, problem.gridWidth, position, building.size)) {
      const newPlacements = layout.placements.map((p, i) =>
        i === idx ? { templateIndex: p.templateIndex, position } : p
      )
      return { placements: newPlacements }
    }
  }

  return null
}

export const swapBuildings = (layout: Layout, problem: Problem, rng: () => number): Layout | null => {
  if (layout.placements.length < 2) {
    return null
  }

  const idxA = Math.floor(rng() * layout.placements.length)
  let idxB = Math.floor(rng() * (layout.placements.length - 1))
  if (idxB >= idxA) {
    idxB++
  }

  const placementA = layout.placements[idxA]
  const placementB = layout.placements[idxB]
  const buildingA = problem.buildings[placementA.templateIndex]
  const buildingB = problem.buildings[placementB.templateIndex]

  const grid = buildOccupancyGrid(problem.gridWidth, problem.gridHeight, layout.placements, problem.buildings)

  const markerA = idxA + 1
  const markerB = idxB + 1

  if (
    !isWithinBounds(placementB.position, buildingA.size, problem.gridWidth, problem.gridHeight) ||
    !isWithinBounds(placementA.position, buildingB.size, problem.gridWidth, problem.gridHeight)
  ) {
    return null
  }

  if (
    !isAreaFreeExcluding(grid, problem.gridWidth, placementB.position, buildingA.size, markerB) ||
    !isAreaFreeExcluding(grid, problem.gridWidth, placementA.position, buildingB.size, markerA)
  ) {
    return null
  }

  const newPlacements = layout.placements.map((p, i) => {
    if (i === idxA) {
      return { templateIndex: p.templateIndex, position: placementB.position }
    }
    if (i === idxB) {
      return { templateIndex: p.templateIndex, position: placementA.position }
    }
    return p
  })

  return { placements: newPlacements }
}

export const perturb = (layout: Layout, problem: Problem, rng: () => number): Layout | null => {
  if (rng() < 0.5) {
    return moveBuilding(layout, problem, rng)
  }
  return swapBuildings(layout, problem, rng)
}
