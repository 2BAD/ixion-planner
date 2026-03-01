import { describe, expect, it } from 'vitest'
import { renderGrid } from '~/render.ts'
import type { BuildingTemplate, Problem, SAResult } from '~/types.ts'

const makeBuilding = (
  name: string,
  width: number,
  height: number,
  connections: { x: number; y: number }[] = []
): BuildingTemplate => ({
  name,
  size: { width, height },
  inputs: [],
  outputs: [],
  connections
})

describe('renderGrid', () => {
  it('should render a small layout with two buildings', () => {
    const buildings = [
      makeBuilding('Power Plant', 3, 2, [{ x: 3, y: 1 }]),
      makeBuilding('Mine', 2, 2, [{ x: -1, y: 0 }])
    ]
    const problem: Problem = { gridWidth: 10, gridHeight: 6, buildings }
    const result: SAResult = {
      layout: {
        placements: [
          { templateIndex: 0, position: { x: 1, y: 1 } },
          { templateIndex: 1, position: { x: 6, y: 1 } }
        ]
      },
      cost: 100,
      iterations: 50,
      roads: [{ x: 5, y: 2 }]
    }

    const output = renderGrid(result, problem)

    // Building A at (1,1) 3x2, Building B at (6,1) 2x2
    expect(output).toContain('AAA')
    expect(output).toContain('BB')
    // Road cell
    expect(output).toContain('*')
    // Connection points
    expect(output).toContain('+')
    // Legend entries
    expect(output).toContain('A  Power Plant (3x2)')
    expect(output).toContain('B  Mine (2x2)')
  })

  it('should include all building names in the legend', () => {
    const buildings = [makeBuilding('Alpha', 2, 2), makeBuilding('Beta', 2, 2), makeBuilding('Gamma', 2, 2)]
    const problem: Problem = { gridWidth: 10, gridHeight: 10, buildings }
    const result: SAResult = {
      layout: {
        placements: [
          { templateIndex: 0, position: { x: 0, y: 0 } },
          { templateIndex: 1, position: { x: 4, y: 0 } },
          { templateIndex: 2, position: { x: 0, y: 4 } }
        ]
      },
      cost: 50,
      iterations: 10,
      roads: []
    }

    const output = renderGrid(result, problem)
    expect(output).toContain('A  Alpha (2x2)')
    expect(output).toContain('B  Beta (2x2)')
    expect(output).toContain('C  Gamma (2x2)')
  })

  it('should place road and connection cells at correct positions', () => {
    const buildings = [makeBuilding('Factory', 3, 3, [{ x: 3, y: 1 }])]
    const problem: Problem = { gridWidth: 8, gridHeight: 5, buildings }
    const result: SAResult = {
      layout: {
        placements: [{ templateIndex: 0, position: { x: 0, y: 1 } }]
      },
      cost: 10,
      iterations: 5,
      roads: [
        { x: 4, y: 2 },
        { x: 5, y: 2 }
      ]
    }

    const output = renderGrid(result, problem)
    const lines = output.split('\n')

    // Find the row at y=2 (connection point at x=3, roads at x=4,5)
    const row2 = lines.find((l) => /^\s*2\s/.test(l))
    expect(row2).toBeDefined()
    // Connection at x=3 (just outside the 3-wide building starting at x=0)
    expect(row2).toContain('+')
    // Roads at x=4 and x=5
    expect(row2).toContain('**')
  })

  it('should snapshot a known layout', () => {
    const buildings = [makeBuilding('A', 2, 2), makeBuilding('B', 3, 1)]
    const problem: Problem = { gridWidth: 8, gridHeight: 5, buildings }
    const result: SAResult = {
      layout: {
        placements: [
          { templateIndex: 0, position: { x: 0, y: 0 } },
          { templateIndex: 1, position: { x: 4, y: 3 } }
        ]
      },
      cost: 10,
      iterations: 5,
      roads: []
    }

    const output = renderGrid(result, problem)
    expect(output).toMatchInlineSnapshot(`
      "   0    5
      0  AA......
      1  AA......
      2  ........
      3  ....BBB.
      4  ........

      Legend:
        A  A (2x2)
        B  B (3x1)"
    `)
  })
})
