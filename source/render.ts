import { buildOccupancyGrid } from '~/grid.ts'
import type { Problem, SAResult } from '~/types.ts'

export const renderGrid = (result: SAResult, problem: Problem): string => {
  const { gridWidth, gridHeight, buildings } = problem
  const { placements } = result.layout

  const grid = buildOccupancyGrid(gridWidth, gridHeight, placements, buildings)

  // Build character map
  const chars = Array.from<string>({ length: gridWidth * gridHeight }).fill('.')

  // Fill building cells with uppercase letters based on placement index
  for (let i = 0; i < placements.length; i++) {
    const letter = String.fromCharCode(65 + (i % 26))
    const placement = placements[i]
    const building = buildings[placement.templateIndex]
    for (let dy = 0; dy < building.size.height; dy++) {
      for (let dx = 0; dx < building.size.width; dx++) {
        chars[(placement.position.y + dy) * gridWidth + (placement.position.x + dx)] = letter
      }
    }
  }

  // Mark road cells
  const roadSet = new Set<number>()
  for (const road of result.roads) {
    const idx = road.y * gridWidth + road.x
    roadSet.add(idx)
    chars[idx] = '*'
  }

  // Mark connection points (overrides roads if overlapping)
  for (const placement of placements) {
    const building = buildings[placement.templateIndex]
    for (const conn of building.connections) {
      const cx = placement.position.x + conn.x
      const cy = placement.position.y + conn.y
      if (cx >= 0 && cx < gridWidth && cy >= 0 && cy < gridHeight) {
        const idx = cy * gridWidth + cx
        // Only mark if it's not a building interior cell (connection points are on the perimeter)
        if (grid[idx] === 0 || roadSet.has(idx)) {
          chars[idx] = '+'
        }
      }
    }
  }

  // Build axis header
  const yLabelWidth = String(gridHeight - 1).length
  const padding = ' '.repeat(yLabelWidth + 2)
  const lines: string[] = []

  // Top axis labels (every 5 columns)
  let header = padding
  for (let x = 0; x < gridWidth; x++) {
    if (x % 5 === 0) {
      const label = String(x)
      header += label
      header += ' '.repeat(Math.max(1, 5 - label.length))
    }
  }
  lines.push(header.trimEnd())

  // Grid rows
  for (let y = 0; y < gridHeight; y++) {
    const label = String(y).padStart(yLabelWidth)
    let row = `${label}  `
    for (let x = 0; x < gridWidth; x++) {
      row += chars[y * gridWidth + x]
    }
    lines.push(row.trimEnd())
  }

  // Legend
  lines.push('')
  lines.push('Legend:')
  for (let i = 0; i < placements.length; i++) {
    const letter = String.fromCharCode(65 + (i % 26))
    const building = buildings[placements[i].templateIndex]
    lines.push(`  ${letter}  ${building.name} (${building.size.width}x${building.size.height})`)
  }

  return lines.join('\n')
}
