import type { Grid, Position, Size } from '~/grid.ts'
import { STOCKPILE_LARGE, STOCKPILE_MEDIUM, STOCKPILE_SMALL } from './templates/maintenance.ts'

export enum ResourceType {
  Power = 'POWER',
  Steel = 'STEEL',
  Alloy = 'ALLOY',
  Electronics = 'ELECTRONICS',
  Polymer = 'POLYMER',
  Food = 'FOOD',
  Water = 'WATER',
  Workers = 'WORKERS'
}

export enum BuildingCategory {
  Infrastructure = 'INFRASTRUCTURE',
  Maintenance = 'MAINTENANCE',
  Space = 'SPACE',
  Factories = 'FACTORIES',
  Population = 'POPULATION',
  Food = 'FOOD',
  Stability = 'STABILITY'
}

export type ResourceFlow = {
  resource: ResourceType
  amount: number
  interval: number // Time in seconds
}

export type Building = {
  id: string
  name: string
  category: BuildingCategory
  size: Size
  connections: number[] // [top, right, bottom, left] - number of cells that can connect to road
  inputs: ResourceFlow[]
  outputs: ResourceFlow[]
  powerConsumption: number
  workerRequired: number
  buildCost: ResourceFlow[]
  capacity: number
}

export type PlacedBuilding = Building & {
  position: Position
  rotation: number // 0, 90, 180, 270 degrees
  efficiency: number // 0-1 based on conditions
  isEnabled: boolean
}

export class BuildingManager {
  private buildings: Map<string, PlacedBuilding>
  private grid: Grid

  constructor(grid: Grid) {
    this.buildings = new Map()
    this.grid = grid
  }

  public placeBuilding(building: Building, position: Position, rotation = 0): boolean {
    const size = this.getRotatedSize(building.size, rotation)

    if (!this.grid.isAreaFree(position, size)) {
      return false
    }

    const placedBuilding: PlacedBuilding = {
      ...building,
      position,
      rotation,
      efficiency: 1.0,
      isEnabled: true
    }

    this.buildings.set(building.id, placedBuilding)
    this.grid.placeBuilding(position, size, building.id)

    return true
  }

  public removeBuilding(buildingId: string): boolean {
    const building = this.buildings.get(buildingId)
    if (!building) {
      return false
    }

    this.grid.removeBuilding(buildingId)
    this.buildings.delete(buildingId)
    return true
  }

  public calculateBuildingEfficiency(buildingId: string): number {
    const building = this.buildings.get(buildingId)
    if (!building) {
      return 0
    }

    let efficiency = 1.0

    const resourceRatio = this.getResourceInputRatio(building)
    efficiency *= resourceRatio

    building.efficiency = efficiency
    return efficiency
  }

  private getRotatedSize(size: Size, rotation: number): Size {
    if (rotation === 90 || rotation === 270) {
      return { width: size.height, height: size.width }
    }
    return { ...size }
  }

  private getResourceInputRatio(building: PlacedBuilding): number {
    // TODO: Implement resource availability check
    return 1.0
  }

  public static readonly BUILDING_TEMPLATES: { [key: string]: Building } = {
    STOCKPILE_SMALL,
    STOCKPILE_MEDIUM,
    STOCKPILE_LARGE
  }

  public getBuildingAt(position: Position): PlacedBuilding | null {
    const cell = this.grid.getCell(position)
    if (!cell || !cell.buildingId) {
      return null
    }
    return this.buildings.get(cell.buildingId) || null
  }

  public getAllBuildings(): PlacedBuilding[] {
    return Array.from(this.buildings.values())
  }

  public getBuildingsByCategory(category: BuildingCategory): PlacedBuilding[] {
    return this.getAllBuildings().filter((b) => b.category === category)
  }
}
