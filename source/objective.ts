import type { BuildingTemplate, Flow, Layout, Position, Size } from '~/types.ts'

export const centroid = (position: Position, size: Size): Position => {
  return {
    x: position.x + size.width / 2,
    y: position.y + size.height / 2
  }
}

export const manhattanDistance = (a: Position, b: Position): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

export const deriveFlows = (buildings: BuildingTemplate[]): Flow[] => {
  const flows: Flow[] = []

  for (let si = 0; si < buildings.length; si++) {
    const source = buildings[si]
    for (const output of source.outputs) {
      for (let ti = 0; ti < buildings.length; ti++) {
        if (si === ti) {
          continue
        }
        const target = buildings[ti]
        for (const input of target.inputs) {
          if (input.resource === output.resource) {
            flows.push({
              sourceIndex: si,
              targetIndex: ti,
              resource: input.resource,
              volume: Math.min(output.volume, input.volume)
            })
          }
        }
      }
    }
  }

  return flows
}

export const computeCost = (layout: Layout, buildings: BuildingTemplate[], flows: Flow[]): number => {
  let cost = 0

  for (const flow of flows) {
    const sourcePlacement = layout.placements[flow.sourceIndex]
    const targetPlacement = layout.placements[flow.targetIndex]
    const sourceCenter = centroid(sourcePlacement.position, buildings[sourcePlacement.templateIndex].size)
    const targetCenter = centroid(targetPlacement.position, buildings[targetPlacement.templateIndex].size)
    cost += flow.volume * manhattanDistance(sourceCenter, targetCenter)
  }

  return cost
}
