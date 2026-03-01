import type { Orientation, Position, Size } from '~/types.ts'

export const rotateSize = (size: Size, orientation: Orientation): Size => {
  if (orientation === 1 || orientation === 3) {
    return { width: size.height, height: size.width }
  }
  return size
}

export const rotateConnection = (connection: Position, size: Size, orientation: Orientation): Position => {
  switch (orientation) {
    case 0:
      return connection
    case 1:
      return { x: size.height - 1 - connection.y, y: connection.x }
    case 2:
      return { x: size.width - 1 - connection.x, y: size.height - 1 - connection.y }
    case 3:
      return { x: connection.y, y: size.width - 1 - connection.x }
  }
}

export const rotateConnections = (connections: Position[], size: Size, orientation: Orientation): Position[] => {
  if (orientation === 0) {
    return connections
  }
  return connections.map((c) => rotateConnection(c, size, orientation))
}
