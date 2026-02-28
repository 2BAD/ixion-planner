import { deriveFlows, computeCost } from '~/objective.ts'
import { createBfsBuffers } from '~/pathfinding.ts'
import { perturb, randomLayout } from '~/perturbation.ts'
import { routeFlows } from '~/routing.ts'
import type { Problem, SAConfig, SAResult } from '~/types.ts'

export const solve = (problem: Problem, config: SAConfig, rng: () => number = Math.random): SAResult => {
  const flows = deriveFlows(problem.buildings)
  const buffers = createBfsBuffers(problem.gridWidth, problem.gridHeight)
  let current = randomLayout(problem, rng)
  let currentRouting = routeFlows(current, problem, flows, buffers)
  let currentCost = computeCost(flows, currentRouting.pathLengths, currentRouting.roads.length, config.roadWeight)

  let best = current
  let bestRouting = currentRouting
  let bestCost = currentCost

  let temperature = config.initialTemperature
  let iterations = 0

  while (temperature > config.minTemperature) {
    for (let i = 0; i < config.iterationsPerTemp; i++) {
      const neighbor = perturb(current, problem, rng)
      if (neighbor === null) {
        iterations++
        continue
      }

      const neighborRouting = routeFlows(neighbor, problem, flows, buffers)
      const neighborCost = computeCost(
        flows,
        neighborRouting.pathLengths,
        neighborRouting.roads.length,
        config.roadWeight
      )
      const delta = neighborCost - currentCost

      if (delta < 0 || rng() < Math.exp(-delta / temperature)) {
        current = neighbor
        currentRouting = neighborRouting
        currentCost = neighborCost

        if (currentCost < bestCost) {
          best = current
          bestRouting = currentRouting
          bestCost = currentCost
        }
      }

      iterations++
    }

    temperature *= config.coolingRate
  }

  return { layout: best, cost: bestCost, iterations, roads: bestRouting.roads }
}
