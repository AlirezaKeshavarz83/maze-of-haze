import { HARD_REVEAL_FADE_MS, HARD_REVEAL_MS } from "../core/constants.js";
import { wallKeyFromMove } from "../maze/wallKeys.js";
import { createBloodEffect, createCollapseBurst, triggerShake } from "./effects.js";

const DEATH_INPUT_DELAY_MS = 320;
const EASY_BOUNCE_ANIMATION_MS = 180;
const MEDIUM_RESET_ANIMATION_MS = 220;
const MEDIUM_HIDDEN_MS = 120;
const HARD_FADE_OUT_MS = 300;
const HARD_FADE_IN_DELAY_MS = 120;
const HARD_FADE_IN_MS = 420;
const HARD_RESET_ANIMATION_MS = HARD_FADE_IN_DELAY_MS + HARD_FADE_IN_MS;
const EASY_SHAKE = { amplitude: 1.8, duration: 110 };
const MEDIUM_SHAKE = { amplitude: 2.5, duration: 120 };

function impactSideFromDirection(direction) {
  if (direction === "up") return "bottom";
  if (direction === "down") return "top";
  if (direction === "left") return "right";
  return "left";
}

function activeHardWallProgress(expiry, now) {
  const remaining = Math.max(0, expiry - now);
  const fadeWindow = Math.min(260, HARD_REVEAL_MS * 0.24);
  return fadeWindow <= 0 ? 1 : Math.max(0, Math.min(1, 1 - (remaining / fadeWindow)));
}

function startHardWallFade(state, wall, now) {
  if (!wall) return;
  state.disappearingWall = {
    key: wall.key,
    endsAt: now + HARD_REVEAL_FADE_MS,
    fromProgress: wall.expiresAt ? activeHardWallProgress(wall.expiresAt, now) : 0
  };
}

export function handleBlockedMove(state, direction, now) {
  const { row, col } = state.player;
  const wallKey = wallKeyFromMove(row, col, direction);

  if (state.mode === "easy") {
    triggerShake(state, now, EASY_SHAKE.amplitude, EASY_SHAKE.duration);
    state.animation = {
      type: "bounce",
      direction,
      startedAt: now,
      duration: EASY_BOUNCE_ANIMATION_MS,
      origin: { row, col }
    };
    return;
  }

  if (state.mode === "medium") {
    triggerShake(state, now, MEDIUM_SHAKE.amplitude, MEDIUM_SHAKE.duration);
    state.discoveredWalls.add(wallKey);
    state.collapseBursts.push(createCollapseBurst(row, col, direction, now));
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
      duration: MEDIUM_RESET_ANIMATION_MS,
      hiddenDuration: MEDIUM_HIDDEN_MS,
      origin: { row, col }
    };
    state.player = { ...state.start };
    state.inputLockedUntil = now + DEATH_INPUT_DELAY_MS;
    return;
  }

  if (state.activeWall?.key === wallKey) {
    state.activeWall.expiresAt = now + HARD_REVEAL_MS;
  } else {
    if (state.activeWall) {
      startHardWallFade(state, state.activeWall, now);
    }
    state.activeWall = {
      key: wallKey,
      expiresAt: now + HARD_REVEAL_MS
    };
    if (state.disappearingWall?.key === wallKey) {
      state.disappearingWall = null;
    }
  }

  state.animation = {
    type: "impact-reset",
    direction,
    startedAt: now,
    duration: HARD_RESET_ANIMATION_MS,
    hiddenDuration: MEDIUM_HIDDEN_MS,
    fadeOutDuration: HARD_FADE_OUT_MS,
    fadeInDelay: HARD_FADE_IN_DELAY_MS,
    fadeInDuration: HARD_FADE_IN_MS,
    origin: { row, col },
    respawn: { ...state.start }
  };
  state.player = { ...state.start };
  state.inputLockedUntil = now + HARD_FADE_IN_DELAY_MS + DEATH_INPUT_DELAY_MS;
}

export function cleanupTemporaryWalls(state, now) {
  state.collapseBursts = state.collapseBursts.filter((burst) => burst.createdAt + burst.lifetime > now);

  if (state.activeWall && state.activeWall.expiresAt <= now) {
    startHardWallFade(state, state.activeWall, now);
    state.activeWall = null;
  }

  if (state.disappearingWall && state.disappearingWall.endsAt <= now) {
    state.disappearingWall = null;
  }
}
