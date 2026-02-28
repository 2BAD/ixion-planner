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
  const resources = new Set<Resource>()
  for (const b of buildings) {
    for (const o of b.outputs) {
      resources.add(o.resource)
    }
    for (const i of b.inputs) {
      resources.add(i.resource)
    }
  }

  const flows: Flow[] = []

  for (const resource of resources) {
    const suppliers: { index: number; volume: number }[] = []
    const consumers: { index: number; volume: number }[] = []

    for (let i = 0; i < buildings.length; i++) {
      for (const o of buildings[i].outputs) {
        if (o.resource === resource) {
          suppliers.push({ index: i, volume: o.volume })
        }
      }
      for (const inp of buildings[i].inputs) {
        if (inp.resource === resource) {
          consumers.push({ index: i, volume: inp.volume })
        }
      }
    }

    if (suppliers.length === 0 || consumers.length === 0) {
      continue
    }

    const totalSupply = suppliers.reduce((sum, s) => sum + s.volume, 0)
    const totalDemand = consumers.reduce((sum, c) => sum + c.volume, 0)
    const actualFlow = Math.min(totalSupply, totalDemand)

    for (const s of suppliers) {
      for (const c of consumers) {
        const volume = actualFlow * (s.volume / totalSupply) * (c.volume / totalDemand)
        if (volume > 0) {
          flows.push({ sourceIndex: s.index, targetIndex: c.index, resource, volume })
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
