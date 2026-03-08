import { LEVELS } from "../config/levels.js";
import { SCREEN } from "./constants.js";

export function createInitialState() {
  const first = LEVELS[0];
  return {
    screen: SCREEN.MENU,
    levelIndex: 0,
    mode: "easy",
    rows: first.rows,
    cols: first.cols,
    maze: null,
    player: { row: 0, col: 0 },
    start: { row: 0, col: 0 },
    finish: { row: 0, col: 0 },
    discoveredWalls: new Set(),
    bloodEffects: new Map(),
    collapseBursts: [],
    activeWall: null,
    disappearingWall: null,
    animation: null,
    inputLockedUntil: 0,
    shake: null
  };
}
