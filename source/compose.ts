import type { BuildingTemplate, ProductionTarget } from '~/types.ts'
import { Resource } from '~/types.ts'

const areaEfficiency = (b: BuildingTemplate, resource: Resource): number => {
  const output = b.outputs.find((o) => o.resource === resource)
  if (!output) {
    return 0
  }
  return output.volume / (b.size.width * b.size.height)
}

const getOrThrow = <K, V>(map: Map<K, V>, key: K): V => {
  const value = map.get(key)
  if (value === undefined) {
    throw new Error(`Missing map key: ${String(key)}`)
  }
  return value
}

export const compose = (catalog: BuildingTemplate[], targets: ProductionTarget[]): BuildingTemplate[] => {
  if (targets.length === 0) {
    return []
  }

  const bestProducer = new Map<Resource, BuildingTemplate>()
  for (const b of catalog) {
    for (const o of b.outputs) {
      const existing = bestProducer.get(o.resource)
      if (!existing || areaEfficiency(b, o.resource) > areaEfficiency(existing, o.resource)) {
        bestProducer.set(o.resource, b)
      }
    }
  }

  // BFS to discover all needed resources
  const neededResources = new Set<Resource>()
  const queue: Resource[] = targets.map((t) => t.resource)
  let head = queue.shift()
  while (head !== undefined) {
    if (!neededResources.has(head)) {
      neededResources.add(head)

      const producer = bestProducer.get(head)
      if (!producer) {
        throw new Error(`No producer found for resource: ${head}`)
      }

      for (const input of producer.inputs) {
        if (!neededResources.has(input.resource)) {
          queue.push(input.resource)
        }
      }
    }
    head = queue.shift()
  }

  // Topological sort (Kahn's algorithm)
  // Edge: producer's input resource -> output resource (input must be computed before output)
  const inDegree = new Map<Resource, number>()
  const dependents = new Map<Resource, Resource[]>()

  for (const r of neededResources) {
    inDegree.set(r, 0)
    dependents.set(r, [])
  }

  for (const r of neededResources) {
    const producer = getOrThrow(bestProducer, r)
    for (const input of producer.inputs) {
      if (neededResources.has(input.resource)) {
        inDegree.set(r, getOrThrow(inDegree, r) + 1)
        getOrThrow(dependents, input.resource).push(r)
      }
    }
  }

  const sorted: Resource[] = []
  const zeroQueue: Resource[] = []
  for (const [r, deg] of inDegree) {
    if (deg === 0) {
      zeroQueue.push(r)
    }
  }

  let zHead = zeroQueue.shift()
  while (zHead !== undefined) {
    sorted.push(zHead)
    for (const dep of getOrThrow(dependents, zHead)) {
      const newDeg = getOrThrow(inDegree, dep) - 1
      inDegree.set(dep, newDeg)
      if (newDeg === 0) {
        zeroQueue.push(dep)
      }
    }
    zHead = zeroQueue.shift()
  }

  if (sorted.length !== neededResources.size) {
    throw new Error('Cycle detected in production chain')
  }

  // Reverse so targets come first, raw inputs last
  sorted.reverse()

  // Compute building counts: walk from targets toward raw inputs
  const demand = new Map<Resource, number>()
  for (const t of targets) {
    demand.set(t.resource, (demand.get(t.resource) ?? 0) + t.volume)
  }

  const buildingCounts = new Map<Resource, number>()

  for (const resource of sorted) {
    const producer = getOrThrow(bestProducer, resource)
    const output = producer.outputs.find((o) => o.resource === resource)
    if (!output) {
      throw new Error(`Producer ${producer.name} has no output for ${resource}`)
    }
    const needed = demand.get(resource) ?? 0
    const count = Math.ceil(needed / output.volume)
    buildingCounts.set(resource, count)

    // Propagate input demands
    for (const input of producer.inputs) {
      const inputDemand = input.volume * count
      demand.set(input.resource, (demand.get(input.resource) ?? 0) + inputDemand)
    }
  }

  // Flatten into building list
  const result: BuildingTemplate[] = []
  for (const [resource, count] of buildingCounts) {
    const producer = getOrThrow(bestProducer, resource)
    for (let i = 0; i < count; i++) {
      result.push(producer)
    }
  }

  return result
}
