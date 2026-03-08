import { HARD_REVEAL_MS } from "../core/constants.js";
import { wallKeyFromMove } from "../maze/wallKeys.js";

const DEATH_INPUT_DELAY_MS = 320;

function createBloodEffect() {
  const droplets = Array.from({ length: 22 }, () => ({
    along: Math.random(),
    offset: (Math.random() - 0.5) * 0.45,
    distance: 0.02 + Math.pow(Math.random(), 1.8) * 0.72,
    radius: 0.04 + Math.random() * 0.11,
    smear: 0.08 + Math.random() * 0.2,
    shade: 0.4 + Math.random() * 0.6
  }));

  const drips = Array.from({ length: 7 }, () => ({
    along: Math.random(),
    distance: 0.02 + Math.random() * 0.26,
    length: 0.16 + Math.random() * 0.26,
    width: 0.02 + Math.random() * 0.03
  }));

  return { droplets, drips };
}

function impactSideFromDirection(direction) {
  if (direction === "up") return "bottom";
  if (direction === "down") return "top";
  if (direction === "left") return "right";
  return "left";
}

export function handleBlockedMove(state, direction, now) {
  const { row, col } = state.player;
  const wallKey = wallKeyFromMove(row, col, direction);

  if (state.mode === "easy") {
    state.animation = {
      type: "bounce",
      direction,
      startedAt: now,
      duration: 180,
      origin: { row, col }
    };
    return;
  }

  if (state.mode === "medium") {
    state.discoveredWalls.add(wallKey);
    const impactSide = impactSideFromDirection(direction);
    const effect = state.bloodEffects.get(wallKey) ?? {};
    const layers = effect[impactSide] ?? [];
    if (layers.length < 4) layers.push(createBloodEffect());
    effect[impactSide] = layers;
    state.bloodEffects.set(wallKey, effect);
    state.animation = {
      type: "impact-reset",
      direction,
      startedAt: now,
      duration: 220,
      hiddenDuration: 120,
      origin: { row, col }
    };
    state.player = { ...state.start };
    state.inputLockedUntil = now + DEATH_INPUT_DELAY_MS;
    return;
  }

  state.temporaryWalls.clear();
  state.temporaryWalls.set(wallKey, now + HARD_REVEAL_MS);
  state.animation = {
    type: "impact-reset",
    direction,
    startedAt: now,
    duration: 520,
    hiddenDuration: 120,
    fadeOutDuration: 180,
    fadeInDelay: 170,
    fadeInDuration: 220,
    origin: { row, col },
    respawn: { ...state.start }
  };
  state.player = { ...state.start };
  state.inputLockedUntil = now + DEATH_INPUT_DELAY_MS;
}

export function cleanupTemporaryWalls(state, now) {
  for (const [key, expiry] of state.temporaryWalls.entries()) {
    if (expiry <= now) state.temporaryWalls.delete(key);
  }
}
