export const MODES = {
  easy: {
    label: "Easy",
    visibleWalls: "all",
    resetOnCollision: false,
    revealOnCollision: false,
    temporaryRevealOnCollision: false
  },
  medium: {
    label: "Medium",
    visibleWalls: "discovered",
    resetOnCollision: true,
    revealOnCollision: true,
    temporaryRevealOnCollision: false
  },
  hard: {
    label: "Hard",
    visibleWalls: "temporary",
    resetOnCollision: true,
    revealOnCollision: false,
    temporaryRevealOnCollision: true
  }
};
