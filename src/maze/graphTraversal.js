import { DIRECTION_ORDER, DIRECTIONS } from "../core/constants.js";

export function findFarthestCell(maze, start) {
  const rows = maze.length;
  const cols = maze[0].length;
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue = [{ ...start, dist: 0 }];
  seen[start.row][start.col] = true;
  let maxDistance = 0;
  const farthest = [{ ...start, dist: 0 }];

  while (queue.length > 0) {
    const node = queue.shift();
    if (node.dist > maxDistance) {
      maxDistance = node.dist;
      farthest.length = 0;
      farthest.push(node);
    } else if (node.dist === maxDistance) {
      farthest.push(node);
    }

    for (const dir of DIRECTION_ORDER) {
      const step = DIRECTIONS[dir];
      const cell = maze[node.row][node.col];
      if (cell.walls[step.wall]) continue;
      const nr = node.row + step.dr;
      const nc = node.col + step.dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || seen[nr][nc]) continue;
      seen[nr][nc] = true;
      queue.push({ row: nr, col: nc, dist: node.dist + 1 });
    }
  }

  return farthest[(Math.random() * farthest.length) | 0];
}
