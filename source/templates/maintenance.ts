import { type Building, BuildingCategory, ResourceType } from '~/buildings.ts'

export const STOCKPILE_SMALL: Building = {
  id: 'STOCKPILE_SMALL',
  name: 'Stockpile - Small',
  category: BuildingCategory.Space,
  size: { width: 4, height: 4 },
  connections: [0, 0, 4, 0],
  inputs: [{ resource: ResourceType.Workers, amount: 5, interval: 60 }],
  outputs: [],
  powerConsumption: 3,
  workerRequired: 5,
  buildCost: [{ resource: ResourceType.Alloy, amount: 10, interval: 0 }],
  capacity: 100 // 120 with upgrades
  // techTier: 0,
  // researchPointsRequired: 0,
  // hasExternalWalls: false
}

export const STOCKPILE_MEDIUM: Building = {
  id: 'STOCKPILE_MEDIUM',
  name: 'Stockpile - Medium',
  category: BuildingCategory.Space,
  size: { width: 8, height: 4 },
  connections: [0, 0, 4, 0],
  inputs: [{ resource: ResourceType.Workers, amount: 8, interval: 60 }],
  outputs: [],
  powerConsumption: 4,
  workerRequired: 8,
  buildCost: [
    { resource: ResourceType.Alloy, amount: 15, interval: 0 },
    { resource: ResourceType.Electronics, amount: 1, interval: 0 }
  ],
  capacity: 300 // 360 with upgrades
  // techTier: 0,
  // researchPointsRequired: 30,
  // hasExternalWalls: false,
  // requiredUpgrade: 'STOCKPILE_SMALL'
}

export const STOCKPILE_LARGE: Building = {
  id: 'STOCKPILE_LARGE',
  name: 'Stockpile - Large',
  category: BuildingCategory.Space,
  size: { width: 8, height: 8 },
  connections: [0, 0, 8, 0],
  inputs: [{ resource: ResourceType.Workers, amount: 12, interval: 60 }],
  outputs: [],
  powerConsumption: 5,
  workerRequired: 12,
  buildCost: [
    { resource: ResourceType.Alloy, amount: 25, interval: 0 },
    { resource: ResourceType.Electronics, amount: 2, interval: 0 }
  ],
  capacity: 600 // 720 with upgrades
  // techTier: 0,
  // researchPointsRequired: 40,
  // hasExternalWalls: false,
  // requiredUpgrade: 'STOCKPILE_SMALL'
}
