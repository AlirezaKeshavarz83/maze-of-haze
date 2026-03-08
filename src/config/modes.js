export const MODES = {
  easy: {
    label: "Before",
    visibleWalls: "all",
    resetOnCollision: false,
    revealOnCollision: false,
    temporaryRevealOnCollision: false
  },
  medium: {
    label: "Collapse",
    visibleWalls: "discovered",
    resetOnCollision: true,
    revealOnCollision: true,
    temporaryRevealOnCollision: false
  },
  hard: {
    label: "After",
    visibleWalls: "temporary",
    resetOnCollision: true,
    revealOnCollision: false,
    temporaryRevealOnCollision: true
  }
};
