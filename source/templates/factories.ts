import { type Building, BuildingCategory, ResourceType } from '~/buildings.ts'

export const STEEL_MILL: Building = {
  id: 'STEEL_MILL',
  name: 'Steel Mill',
  category: BuildingCategory.Factories,
  size: { width: 9, height: 12 },
  connections: [0, 0, 9, 0],
  inputs: [{ resource: ResourceType.Workers, amount: 5, interval: 60 }],
  outputs: [{ resource: ResourceType.Steel, amount: 10, interval: 60 }],
  powerConsumption: 15,
  workerRequired: 30,
  buildCost: [
    { resource: ResourceType.Alloy, amount: 50, interval: 0 },
    { resource: ResourceType.Electronics, amount: 2, interval: 0 }
  ],
  capacity: 100
}
