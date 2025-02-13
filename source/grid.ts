export type Position = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export type Cell = {
  type: CellType
  position: Position
  occupied: boolean
  buildingId?: string | undefined
}

export enum CellType {
  // biome-ignore lint/style/useNamingConvention:
  NORMAL = 'NORMAL',
  // biome-ignore lint/style/useNamingConvention:
  LIMITED = 'LIMITED'
}

export class Grid {
  private cells: Cell[][]
  private readonly width: number
  private readonly height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.cells = this.initializeGrid()
  }

  private initializeGrid(): Cell[][] {
    return Array(this.height)
      .fill(null)
      .map((_, y) =>
        Array(this.width)
          .fill(null)
          .map((_, x) => ({
            position: { x, y },
            occupied: false,
            type: CellType.NORMAL
          }))
      )
  }

  public isWithinBounds(position: Position): boolean {
    return position.x >= 0 && position.x < this.width && position.y >= 0 && position.y < this.height
  }

  public isAreaFree(position: Position, size: Size): boolean {
    for (let y = position.y; y < position.y + size.height; y++) {
      for (let x = position.x; x < position.x + size.width; x++) {
        if (
          !this.isWithinBounds({ x, y }) ||
          this.cells[y]![x]!.occupied ||
          // TODO: Handle limited hight cells
          this.cells[y]![x]!.type === CellType.LIMITED
        ) {
          return false
        }
      }
    }
    return true
  }

  public placeBuilding(position: Position, size: Size, buildingId: string): boolean {
    if (!this.isAreaFree(position, size)) {
      return false
    }

    for (let y = position.y; y < position.y + size.height; y++) {
      for (let x = position.x; x < position.x + size.width; x++) {
        this.cells[y]![x]!.occupied = true
        this.cells[y]![x]!.buildingId = buildingId
      }
    }
    return true
  }

  public removeBuilding(buildingId: string): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.cells[y]![x]!.buildingId === buildingId) {
          this.cells[y]![x]!.occupied = false
          this.cells[y]![x]!.buildingId = undefined
        }
      }
    }
  }

  public getNeighbors(position: Position): Cell[] {
    const neighbors: Cell[] = []
    const directions = [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 }
    ]

    for (const dir of directions) {
      const neighborPosition = {
        x: position.x + dir.x,
        y: position.y + dir.y
      }

      if (this.isWithinBounds(neighborPosition)) {
        neighbors.push(this.cells[neighborPosition.y]![neighborPosition.x]!)
      }
    }

    return neighbors
  }

  public getCell(position: Position): Cell | null {
    if (!this.isWithinBounds(position)) {
      return null
    }
    return this.cells[position.y]![position.x]!
  }

  public setCellType(position: Position, type: CellType): boolean {
    if (!this.isWithinBounds(position)) {
      return false
    }
    this.cells[position.y]![position.x]!.type = type
    return true
  }

  public getDimensions(): Size {
    return {
      width: this.width,
      height: this.height
    }
  }

  public serialize(): string {
    return JSON.stringify({
      width: this.width,
      height: this.height,
      cells: this.cells
    })
  }

  public static deserialize(data: string): Grid {
    const parsed = JSON.parse(data)
    const grid = new Grid(parsed.width, parsed.height)
    grid.cells = parsed.cells
    return grid
  }
}
