export enum Resource {
  Power = 'Power',
  Steel = 'Steel',
  Alloy = 'Alloy',
  Electronics = 'Electronics'
}

export type Position = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export type ResourceFlow = {
  resource: Resource
  volume: number
}

export type BuildingTemplate = {
  name: string
  size: Size
  inputs: ResourceFlow[]
  outputs: ResourceFlow[]
}

export type Placement = {
  templateIndex: number
  position: Position
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
}

export type SAResult = {
  layout: Layout
  cost: number
  iterations: number
}
