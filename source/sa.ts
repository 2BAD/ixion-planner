import { deriveFlows, computeCost } from '~/objective.ts'
import { perturb, randomLayout } from '~/perturbation.ts'
import type { Problem, SAConfig, SAResult } from '~/types.ts'

export const solve = (problem: Problem, config: SAConfig, rng: () => number = Math.random): SAResult => {
  const flows = deriveFlows(problem.buildings)
  let current = randomLayout(problem, rng)
  let currentCost = computeCost(current, problem.buildings, flows)

  let best = current
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

      const neighborCost = computeCost(neighbor, problem.buildings, flows)
      const delta = neighborCost - currentCost

      if (delta < 0 || rng() < Math.exp(-delta / temperature)) {
        current = neighbor
        currentCost = neighborCost

        if (currentCost < bestCost) {
          best = current
          bestCost = currentCost
        }
      }

      iterations++
    }

    temperature *= config.coolingRate
  }

  return { layout: best, cost: bestCost, iterations }
}
