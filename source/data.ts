import type { BuildingTemplate, Problem, SAConfig } from '~/types.ts'
import { Resource } from '~/types.ts'

export const POWER_PLANT: BuildingTemplate = {
  name: 'Power Plant',
  size: { width: 3, height: 3 },
  inputs: [],
  outputs: [{ resource: Resource.Power, volume: 10 }]
}

export const STEEL_MILL: BuildingTemplate = {
  name: 'Steel Mill',
  size: { width: 4, height: 3 },
  inputs: [{ resource: Resource.Power, volume: 5 }],
  outputs: [{ resource: Resource.Iron, volume: 8 }]
}

export const ALLOY_FOUNDRY: BuildingTemplate = {
  name: 'Alloy Foundry',
  size: { width: 4, height: 4 },
  inputs: [
    { resource: Resource.Power, volume: 4 },
    { resource: Resource.Iron, volume: 6 }
  ],
  outputs: [{ resource: Resource.Alloy, volume: 5 }]
}

export const ELECTRONICS_FACTORY: BuildingTemplate = {
  name: 'Electronics Factory',
  size: { width: 3, height: 4 },
  inputs: [
    { resource: Resource.Power, volume: 3 },
    { resource: Resource.Alloy, volume: 4 }
  ],
  outputs: [{ resource: Resource.Electronics, volume: 3 }]
}

export const SAMPLE_PROBLEM: Problem = {
  gridWidth: 20,
  gridHeight: 20,
  buildings: [POWER_PLANT, STEEL_MILL, ALLOY_FOUNDRY, ELECTRONICS_FACTORY]
}

export const DEFAULT_SA_CONFIG: SAConfig = {
  initialTemperature: 1000,
  coolingRate: 0.995,
  iterationsPerTemp: 50,
  minTemperature: 0.01
}
