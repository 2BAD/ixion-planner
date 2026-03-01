export enum Resource {
  // Utility
  Power = 'Power',

  // Raw materials
  Iron = 'Iron',
  Carbon = 'Carbon',
  Silicon = 'Silicon',
  Hydrogen = 'Hydrogen',
  Ice = 'Ice',

  // Processed materials
  Alloy = 'Alloy',
  Polymer = 'Polymer',
  Electronics = 'Electronics',

  // Consumables
  Food = 'Food',
  Water = 'Water',
  Waste = 'Waste'
}

export type Position = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export type Orientation = 0 | 1 | 2 | 3

export type ResourceFlow = {
  resource: Resource
  volume: number
}

export type BuildingTemplate = {
  name: string
  size: Size
  inputs: ResourceFlow[]
  outputs: ResourceFlow[]
  connections: Position[]
}

export type Placement = {
  templateIndex: number
  position: Position
  orientation: Orientation
}

export type Layout = {
  placements: Placement[]
}

export type Flow = {
  sourceIndex: number
  targetIndex: number
  resource: Resource
  volume: number
}

export type Problem = {
  gridWidth: number
  gridHeight: number
  buildings: BuildingTemplate[]
}

export type SAConfig = {
  initialTemperature: number
  coolingRate: number
  iterationsPerTemp: number
  minTemperature: number
  roadWeight: number
}

export type SAResult = {
  layout: Layout
  cost: number
  iterations: number
  roads: Position[]
}

export type ProductionTarget = {
  resource: Resource
  volume: number
}
