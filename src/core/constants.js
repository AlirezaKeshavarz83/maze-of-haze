export const DIRECTIONS = {
  up: { dr: -1, dc: 0, wall: "top", opposite: "bottom" },
  right: { dr: 0, dc: 1, wall: "right", opposite: "left" },
  down: { dr: 1, dc: 0, wall: "bottom", opposite: "top" },
  left: { dr: 0, dc: -1, wall: "left", opposite: "right" }
};

export const DIRECTION_ORDER = ["up", "right", "down", "left"];

export const SCREEN = {
  MENU: "menu",
  PLAYING: "playing",
  LEVEL_COMPLETE: "level-complete",
  GAME_COMPLETE: "game-complete"
};

export const HARD_REVEAL_MS = 1400;
