import {
  buildOccupancyGrid,
  clearBuilding,
  isAreaFree,
  isAreaFreeExcluding,
  isWithinBounds,
  markBuilding
} from '~/grid.ts'
import { rotateSize } from '~/rotation.ts'
import type { Layout, Orientation, Problem } from '~/types.ts'

const MAX_ATTEMPTS = 100

export const randomLayout = (problem: Problem, rng: () => number, maxAttempts: number = MAX_ATTEMPTS): Layout => {
  const placements: Layout['placements'] = []
  const grid = new Uint8Array(problem.gridWidth * problem.gridHeight)

  for (let i = 0; i < problem.buildings.length; i++) {
    const building = problem.buildings[i]
    let placed = false

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const orientation = Math.floor(rng() * 4) as Orientation
      const effectiveSize = rotateSize(building.size, orientation)
      const x = Math.floor(rng() * (problem.gridWidth - effectiveSize.width + 1))
      const y = Math.floor(rng() * (problem.gridHeight - effectiveSize.height + 1))
      const position = { x, y }

      if (isAreaFree(grid, problem.gridWidth, position, effectiveSize)) {
        markBuilding(grid, problem.gridWidth, position, effectiveSize, i + 1)
        placements.push({ templateIndex: i, position, orientation })
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
  const effectiveSize = rotateSize(building.size, placement.orientation)
  const grid = buildOccupancyGrid(problem.gridWidth, problem.gridHeight, layout.placements, problem.buildings)

  clearBuilding(grid, problem.gridWidth, placement.position, effectiveSize)

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const x = Math.floor(rng() * (problem.gridWidth - effectiveSize.width + 1))
    const y = Math.floor(rng() * (problem.gridHeight - effectiveSize.height + 1))
    const position = { x, y }

    if (isAreaFree(grid, problem.gridWidth, position, effectiveSize)) {
      const newPlacements = layout.placements.map((p, i) =>
        i === idx ? { templateIndex: p.templateIndex, position, orientation: p.orientation } : p
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
  const sizeA = rotateSize(buildingA.size, placementA.orientation)
  const sizeB = rotateSize(buildingB.size, placementB.orientation)

  const grid = buildOccupancyGrid(problem.gridWidth, problem.gridHeight, layout.placements, problem.buildings)

  const markerA = idxA + 1
  const markerB = idxB + 1

  if (
    !isWithinBounds(placementB.position, sizeA, problem.gridWidth, problem.gridHeight) ||
    !isWithinBounds(placementA.position, sizeB, problem.gridWidth, problem.gridHeight)
  ) {
    return null
  }

  if (
    !isAreaFreeExcluding(grid, problem.gridWidth, placementB.position, sizeA, markerB) ||
    !isAreaFreeExcluding(grid, problem.gridWidth, placementA.position, sizeB, markerA)
  ) {
    return null
  }

  const newPlacements = layout.placements.map((p, i) => {
    if (i === idxA) {
      return { templateIndex: p.templateIndex, position: placementB.position, orientation: p.orientation }
    }
    if (i === idxB) {
      return { templateIndex: p.templateIndex, position: placementA.position, orientation: p.orientation }
    }
    return p
  })

  return { placements: newPlacements }
}

export const rotateBuilding = (layout: Layout, problem: Problem, rng: () => number): Layout | null => {
  const idx = Math.floor(rng() * layout.placements.length)
  const placement = layout.placements[idx]
  const building = problem.buildings[placement.templateIndex]

  // Pick a different orientation
  const offset = 1 + Math.floor(rng() * 3)
  const newOrientation = ((placement.orientation + offset) % 4) as Orientation
  const newSize = rotateSize(building.size, newOrientation)
  const oldSize = rotateSize(building.size, placement.orientation)

  // Check if the building still fits at its current position with the new orientation
  if (!isWithinBounds(placement.position, newSize, problem.gridWidth, problem.gridHeight)) {
    return null
  }

  const grid = buildOccupancyGrid(problem.gridWidth, problem.gridHeight, layout.placements, problem.buildings)
  clearBuilding(grid, problem.gridWidth, placement.position, oldSize)

  if (!isAreaFree(grid, problem.gridWidth, placement.position, newSize)) {
    return null
  }

  const newPlacements = layout.placements.map((p, i) =>
    i === idx ? { templateIndex: p.templateIndex, position: p.position, orientation: newOrientation } : p
  )
  return { placements: newPlacements }
}

export const perturb = (layout: Layout, problem: Problem, rng: () => number): Layout | null => {
  const r = rng()
  if (r < 0.4) {
    return moveBuilding(layout, problem, rng)
  }
  if (r < 0.7) {
    return rotateBuilding(layout, problem, rng)
  }
  return swapBuildings(layout, problem, rng)
}
