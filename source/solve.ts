/* eslint-disable no-undef */
import { DEFAULT_SA_CONFIG, SAMPLE_PROBLEM } from '~/data.ts'
import { validateLayout } from '~/grid.ts'
import { computeCost, deriveFlows } from '~/objective.ts'
import { randomLayout } from '~/perturbation.ts'
import { solve } from '~/sa.ts'

export const run = (): void => {
  const problem = SAMPLE_PROBLEM
  const flows = deriveFlows(problem.buildings)

  const baseline = randomLayout(problem, Math.random)
  const baselineCost = computeCost(baseline, problem.buildings, flows)
  console.log(`random baseline cost: ${baselineCost.toFixed(1)}`)

  const result = solve(problem, DEFAULT_SA_CONFIG)
  const valid = validateLayout(problem.gridWidth, problem.gridHeight, result.layout.placements, problem.buildings)

  const improvement = ((baselineCost - result.cost) / baselineCost) * 100

  console.log(`SA cost: ${result.cost.toFixed(1)}`)
  console.log(`iterations: ${result.iterations}`)
  console.log(`valid: ${valid}`)
  console.log(`improvement over random: ${improvement.toFixed(1)}%`)
  console.log()

  for (const placement of result.layout.placements) {
    const building = problem.buildings[placement.templateIndex]
    console.log(`${building.name}: (${placement.position.x}, ${placement.position.y})`)
  }
}

run()
