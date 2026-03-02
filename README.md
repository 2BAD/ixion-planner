# ixion-planner

A TypeScript library that solves a Facility Location Problem using Simulated Annealing. It optimizes spatial placement of game buildings on a 2D grid and routes roads between building connection points to minimize transport costs.

## How it works

The solver runs in two phases:

1. **Compose** - backward-chains from production targets to determine the minimum set of buildings needed
2. **Place** - uses simulated annealing to find optimal building positions on the grid, with BFS-routed roads between connection points

The cost function minimizes `BFS path length x resource flow volume + road cell count`.

## Usage

```ts
import { compose } from 'ixion-planner/compose'
import { solve } from 'ixion-planner/sa'

const buildings = compose(catalog, targets)
const result = solve({ gridWidth: 30, gridHeight: 30, buildings }, config)
```

## Development

```bash
pnpm start              # run demo solver
pnpm build              # compile to build/
pnpm test               # run all tests
pnpm test:unit          # unit tests with coverage
pnpm check              # lint + format check
pnpm fix                # auto-fix lint + format issues
```

Requires Node >= 24 and pnpm.

## License

MIT
