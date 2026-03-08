import { findFarthestCell } from "./graphTraversal.js";

export function findMazeEndpoints(maze) {
  const arbitrary = {
    row: (Math.random() * maze.length) | 0,
    col: (Math.random() * maze[0].length) | 0
  };
  const a = findFarthestCell(maze, arbitrary);
  const b = findFarthestCell(maze, { row: a.row, col: a.col });
  return {
    start: { row: a.row, col: a.col },
    finish: { row: b.row, col: b.col }
  };
}
