import type { Building } from '~/buildings.ts'
import type { Grid, Position, Size } from '~/grid.ts'
import { BuildingManager } from '~/buildings.ts'

export enum OptimizationGoal {
  StorageCapacity = 'STORAGE_CAPACITY',
  ProductionEfficiency = 'PRODUCTION_EFFICIENCY',
  SpaceEfficiency = 'SPACE_EFFICIENCY'
}

export type OptimizationParams = {
  goal: OptimizationGoal
  availableSpace: Size
  buildingTypes: Building[]
  constraints?: {
    maxBuildings?: number
    minEfficiency?: number
    requiredCapacity?: number
  }
}

export type OptimizedLayout = {
  buildings: Array<{
    building: Building
    position: Position
    rotation: number
  }>
  score: number
  spaceUsed: number
  totalCapacity: number
  efficiency: number
}

export class LayoutOptimizer {
  private grid: Grid
  private buildingManager: BuildingManager

  constructor(width: number, height: number) {
    this.grid = new Grid(width, height)
    this.buildingManager = new BuildingManager(this.grid)
  }

  public generateOptimalLayout(params: OptimizationParams): OptimizedLayout {
    switch (params.goal) {
      case OptimizationGoal.StorageCapacity:
        return this.optimizeForStorage(params)
      case OptimizationGoal.ProductionEfficiency:
        return this.optimizeForProduction(params)
      case OptimizationGoal.SpaceEfficiency:
        return this.optimizeForSpace(params)
      default:
        throw new Error('Unsupported optimization goal')
    }
  }

  private optimizeForStorage(params: OptimizationParams): OptimizedLayout {
    // TODO: Implement storage optimization algorithm
    // This will focus on maximizing total storage capacity
    // by efficiently placing storage buildings
    throw new Error('Not implemented')
  }

  private optimizeForProduction(params: OptimizationParams): OptimizedLayout {
    // TODO: Implement production optimization algorithm
    // This will focus on maximizing production efficiency
    // by considering resource flows and building connections
    throw new Error('Not implemented')
  }

  private optimizeForSpace(params: OptimizationParams): OptimizedLayout {
    const { availableSpace, buildingTypes, constraints } = params
    const layout: OptimizedLayout = {
      buildings: [],
      score: 0,
      spaceUsed: 0,
      totalCapacity: 0,
      efficiency: 0
    }

    // Sort buildings by area (largest first) to optimize space usage
    const sortedBuildings = [...buildingTypes].sort((a, b) => {
      const areaA = a.size.width * a.size.height
      const areaB = b.size.width * b.size.height
      return areaB - areaA
    })

    const tryPosition = (building: Building, pos: Position, rotation: number): boolean => {
      const size = rotation % 180 === 0 
        ? building.size 
        : { width: building.size.height, height: building.size.width }

      if (pos.x + size.width > availableSpace.width || 
          pos.y + size.height > availableSpace.height) {
        return false
      }

      // Check if the position is free
      return this.grid.isAreaFree(pos, size)
    }

    // Try to place each building
    for (const building of sortedBuildings) {
      if (constraints?.maxBuildings && layout.buildings.length >= constraints.maxBuildings) {
        break
      }

      // Try all possible positions and rotations
      let placed = false
      const rotations = [0, 90, 180, 270]

      for (let y = 0; y < availableSpace.height && !placed; y++) {
        for (let x = 0; x < availableSpace.width && !placed; x++) {
          for (const rotation of rotations) {
            if (tryPosition(building, { x, y }, rotation)) {
              layout.buildings.push({
                building,
                position: { x, y },
                rotation
              })
              
              const size = rotation % 180 === 0 ? building.size : 
                { width: building.size.height, height: building.size.width }
              
              layout.spaceUsed += size.width * size.height
              layout.totalCapacity += building.capacity
              placed = true
              
              // Actually place the building in the grid
              this.grid.placeBuilding({ x, y }, size, building.id)
              break
            }
          }
        }
      }
    }

    // Calculate efficiency metrics
    const totalArea = availableSpace.width * availableSpace.height
    layout.efficiency = layout.spaceUsed / totalArea
    layout.score = this.calculateSpaceScore(layout, totalArea)

    return layout
  }

  private calculateLayoutScore(layout: OptimizedLayout): number {
    const totalArea = this.grid.getDimensions().width * this.grid.getDimensions().height
    return this.calculateSpaceScore(layout, totalArea)
  }

  private calculateSpaceScore(layout: OptimizedLayout, totalArea: number): number {
    // Score based on:
    // 1. Space efficiency (50% of score)
    // 2. Capacity utilization (30% of score)
    // 3. Building count optimization (20% of score)
    
    const spaceScore = (layout.spaceUsed / totalArea) * 50
    const capacityScore = Math.min(layout.totalCapacity / 1000, 1) * 30
    const buildingScore = Math.min(layout.buildings.length / 10, 1) * 20

    return spaceScore + capacityScore + buildingScore
  }
}
