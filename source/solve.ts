/* eslint-disable no-undef */
import { compose } from '~/compose.ts'
import { BUILDING_CATALOG, DEFAULT_SA_CONFIG, SAMPLE_PROBLEM, SAMPLE_TARGETS } from '~/data.ts'
import { validateLayout } from '~/grid.ts'
import { computeCost, deriveFlows } from '~/objective.ts'
import { randomLayout } from '~/perturbation.ts'
import { routeFlows } from '~/routing.ts'
import { solve } from '~/sa.ts'
import type { Problem } from '~/types.ts'

export const run = (): void => {
  // Phase 1: Compose
  const buildings = compose(BUILDING_CATALOG, SAMPLE_TARGETS)
  const totalArea = buildings.reduce((sum, b) => sum + b.size.width * b.size.height, 0)

  console.log('=== Composition Phase ===')
  console.log(`targets: ${SAMPLE_TARGETS.map((t) => `${t.volume} ${t.resource}`).join(', ')}`)
  console.log(`buildings (${buildings.length}):`)
  for (const b of buildings) {
    console.log(`  ${b.name} (${b.size.width}x${b.size.height})`)
  }
  console.log(`total area: ${totalArea}`)
  console.log()

  // Phase 2: Place
  const problem: Problem = {
    gridWidth: SAMPLE_PROBLEM.gridWidth,
    gridHeight: SAMPLE_PROBLEM.gridHeight,
    buildings
  }

  const flows = deriveFlows(problem.buildings)

  const baseline = randomLayout(problem, Math.random)
  const baselineRouting = routeFlows(baseline, problem, flows)
  const baselineCost = computeCost(
    flows,
    baselineRouting.pathLengths,
    baselineRouting.roads.length,
    DEFAULT_SA_CONFIG.roadWeight
  )

  console.log('=== Placement Phase ===')
  console.log(`random baseline cost: ${baselineCost.toFixed(1)}`)

  const result = solve(problem, DEFAULT_SA_CONFIG)
  const valid = validateLayout(problem.gridWidth, problem.gridHeight, result.layout.placements, problem.buildings)

  const improvement = ((baselineCost - result.cost) / baselineCost) * 100

  console.log(`SA cost: ${result.cost.toFixed(1)}`)
  console.log(`iterations: ${result.iterations}`)
  console.log(`valid: ${valid}`)
  console.log(`improvement over random: ${improvement.toFixed(1)}%`)
  console.log(`road cells: ${result.roads.length}`)
  console.log()

  for (const placement of result.layout.placements) {
    const building = problem.buildings[placement.templateIndex]
    console.log(`${building.name}: (${placement.position.x}, ${placement.position.y})`)
  }

  if (result.roads.length > 0) {
    console.log()
    console.log(`roads: ${result.roads.map((r) => `(${r.x},${r.y})`).join(' ')}`)
  }
}

run()
