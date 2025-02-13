import { BuildingCategory, type Building } from '~/buildings.ts'

export const ROAD: Building = {
  id: 'ROAD',
  name: 'Road',
  category: BuildingCategory.Infrastructure,
  size: { width: 1, height: 1 },
  connections: [1, 1, 1, 1],
  inputs: [],
  outputs: [],
  powerConsumption: 0,
  workerRequired: 0,
  buildCost: [],
  capacity: 0
}
