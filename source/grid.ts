import type { BuildingTemplate, Layout, Position, Size } from '~/types.ts'

export const createOccupancyGrid = (width: number, height: number): Uint8Array => {
  return new Uint8Array(width * height)
}

export const isWithinBounds = (position: Position, size: Size, gridWidth: number, gridHeight: number): boolean => {
  return (
    position.x >= 0 && position.y >= 0 && position.x + size.width <= gridWidth && position.y + size.height <= gridHeight
  )
}

export const markBuilding = (
  grid: Uint8Array,
  gridWidth: number,
  position: Position,
  size: Size,
  marker: number
): void => {
  for (let dy = 0; dy < size.height; dy++) {
    for (let dx = 0; dx < size.width; dx++) {
      grid[(position.y + dy) * gridWidth + (position.x + dx)] = marker
    }
  }
}

export const clearBuilding = (grid: Uint8Array, gridWidth: number, position: Position, size: Size): void => {
  for (let dy = 0; dy < size.height; dy++) {
    for (let dx = 0; dx < size.width; dx++) {
      grid[(position.y + dy) * gridWidth + (position.x + dx)] = 0
    }
  }
}

export const isAreaFree = (grid: Uint8Array, gridWidth: number, position: Position, size: Size): boolean => {
  for (let dy = 0; dy < size.height; dy++) {
    for (let dx = 0; dx < size.width; dx++) {
      if (grid[(position.y + dy) * gridWidth + (position.x + dx)] !== 0) {
        return false
      }
    }
  }
  return true
}

export const isAreaFreeExcluding = (
  grid: Uint8Array,
  gridWidth: number,
  position: Position,
  size: Size,
  excludeMarker: number
): boolean => {
  for (let dy = 0; dy < size.height; dy++) {
    for (let dx = 0; dx < size.width; dx++) {
      const cell = grid[(position.y + dy) * gridWidth + (position.x + dx)]
      if (cell !== 0 && cell !== excludeMarker) {
        return false
      }
    }
  }
  return true
}

export const buildOccupancyGrid = (
  gridWidth: number,
  gridHeight: number,
  placements: Layout['placements'],
  buildings: BuildingTemplate[]
): Uint8Array => {
  const grid = createOccupancyGrid(gridWidth, gridHeight)
  for (let i = 0; i < placements.length; i++) {
    const placement = placements[i]
    const building = buildings[placement.templateIndex]
    markBuilding(grid, gridWidth, placement.position, building.size, i + 1)
  }
  return grid
}

export const validateLayout = (
  gridWidth: number,
  gridHeight: number,
  placements: Layout['placements'],
  buildings: BuildingTemplate[]
): boolean => {
  const grid = createOccupancyGrid(gridWidth, gridHeight)

  for (let i = 0; i < placements.length; i++) {
    const placement = placements[i]
    const building = buildings[placement.templateIndex]

    if (!isWithinBounds(placement.position, building.size, gridWidth, gridHeight)) {
      return false
    }

    if (!isAreaFree(grid, gridWidth, placement.position, building.size)) {
      return false
    }

    markBuilding(grid, gridWidth, placement.position, building.size, i + 1)
  }

  return true
}
