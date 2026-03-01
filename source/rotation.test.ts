import { describe, expect, it } from 'vitest'
import { rotateConnection, rotateConnections, rotateSize } from '~/rotation.ts'
import type { Orientation, Position, Size } from '~/types.ts'

describe('rotateSize', () => {
  it('should return original size at orientation 0', () => {
    expect(rotateSize({ width: 4, height: 3 }, 0)).toEqual({ width: 4, height: 3 })
  })

  it('should swap width and height at orientation 1 (90 CW)', () => {
    expect(rotateSize({ width: 4, height: 3 }, 1)).toEqual({ width: 3, height: 4 })
  })

  it('should return original size at orientation 2 (180)', () => {
    expect(rotateSize({ width: 4, height: 3 }, 2)).toEqual({ width: 4, height: 3 })
  })

  it('should swap width and height at orientation 3 (270 CW)', () => {
    expect(rotateSize({ width: 4, height: 3 }, 3)).toEqual({ width: 3, height: 4 })
  })

  it('should be identity for square buildings at all orientations', () => {
    const square: Size = { width: 3, height: 3 }
    for (const o of [0, 1, 2, 3] as Orientation[]) {
      expect(rotateSize(square, o)).toEqual({ width: 3, height: 3 })
    }
  })
})

describe('rotateConnection', () => {
  // Non-square building: 4w x 3h
  // Connection at top-left corner (0,0)
  const size: Size = { width: 4, height: 3 }

  it('should return original position at orientation 0', () => {
    expect(rotateConnection({ x: 0, y: 0 }, size, 0)).toEqual({ x: 0, y: 0 })
  })

  it('should rotate 90 CW correctly', () => {
    // (0,0) -> (H-1-0, 0) = (2, 0)
    expect(rotateConnection({ x: 0, y: 0 }, size, 1)).toEqual({ x: 2, y: 0 })
  })

  it('should rotate 180 correctly', () => {
    // (0,0) -> (W-1-0, H-1-0) = (3, 2)
    expect(rotateConnection({ x: 0, y: 0 }, size, 2)).toEqual({ x: 3, y: 2 })
  })

  it('should rotate 270 CW correctly', () => {
    // (0,0) -> (0, W-1-0) = (0, 3)
    expect(rotateConnection({ x: 0, y: 0 }, size, 3)).toEqual({ x: 0, y: 3 })
  })

  it('should rotate a mid-edge connection through all orientations', () => {
    // Connection at bottom-center of a 4x3 building: (1, 2)
    const conn: Position = { x: 1, y: 2 }

    // 0: (1, 2)
    expect(rotateConnection(conn, size, 0)).toEqual({ x: 1, y: 2 })

    // 90 CW: (H-1-2, 1) = (0, 1)
    expect(rotateConnection(conn, size, 1)).toEqual({ x: 0, y: 1 })

    // 180: (W-1-1, H-1-2) = (2, 0)
    expect(rotateConnection(conn, size, 2)).toEqual({ x: 2, y: 0 })

    // 270 CW: (2, W-1-1) = (2, 2)
    expect(rotateConnection(conn, size, 3)).toEqual({ x: 2, y: 2 })
  })

  it('should maintain consistency: 4 rotations return to original', () => {
    const conn: Position = { x: 1, y: 2 }
    let current = conn
    for (let i = 0; i < 4; i++) {
      // Rotate by applying orientation 1 repeatedly
      // After orientation i, the effective size alternates
      const currentSize: Size = i % 2 === 0 ? size : { width: size.height, height: size.width }
      current = rotateConnection(current, currentSize, 1)
    }
    expect(current).toEqual(conn)
  })
})

describe('rotateConnections', () => {
  it('should return original array at orientation 0', () => {
    const conns: Position[] = [
      { x: 0, y: 1 },
      { x: 3, y: 1 }
    ]
    const result = rotateConnections(conns, { width: 4, height: 3 }, 0)
    expect(result).toBe(conns) // same reference
  })

  it('should rotate all connections', () => {
    const conns: Position[] = [
      { x: 0, y: 1 },
      { x: 3, y: 1 }
    ]
    const result = rotateConnections(conns, { width: 4, height: 3 }, 1)
    expect(result).toEqual([
      { x: 1, y: 0 },
      { x: 1, y: 3 }
    ])
  })
})
