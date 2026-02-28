import type { Flow, Position, Size } from '~/types.ts'

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

export const UNROUTABLE_PENALTY = 10000

export const computeCost = (flows: Flow[], pathLengths: number[], roadCount: number, roadWeight: number): number => {
  let cost = roadCount * roadWeight

  for (let i = 0; i < flows.length; i++) {
    if (pathLengths[i] < 0) {
      cost += UNROUTABLE_PENALTY * flows[i].volume
    } else {
      cost += flows[i].volume * pathLengths[i]
    }
  }

  return cost
}
