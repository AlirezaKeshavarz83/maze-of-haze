import { DIRECTIONS } from "../core/constants.js";

export function attemptMove(state, direction) {
  if (!state.maze) return { moved: false, blocked: false };
  const step = DIRECTIONS[direction];
  if (!step) return { moved: false, blocked: false };

  const { row, col } = state.player;
  const cell = state.maze[row][col];
  if (cell.walls[step.wall]) return { moved: false, blocked: true, direction };

  state.player = { row: row + step.dr, col: col + step.dc };
  return { moved: true, blocked: false, direction };
}
