import { HARD_REVEAL_FADE_MS, HARD_REVEAL_MS } from "../core/constants.js";
import { wallKeyFromMove } from "../maze/wallKeys.js";

const DEATH_INPUT_DELAY_MS = 320;
const COLLAPSE_BURST_COLORS = ["light", "light", "light", "light", "mid", "mid", "dark"];
const EASY_BOUNCE_ANIMATION_MS = 180;
const MEDIUM_RESET_ANIMATION_MS = 220;
const MEDIUM_HIDDEN_MS = 120;
const HARD_FADE_OUT_MS = 300;
const HARD_FADE_IN_DELAY_MS = 120;
const HARD_FADE_IN_MS = 420;
const HARD_RESET_ANIMATION_MS = HARD_FADE_IN_DELAY_MS + HARD_FADE_IN_MS;
const EASY_SHAKE = { amplitude: 1.8, duration: 110 };
const MEDIUM_SHAKE = { amplitude: 2.5, duration: 120 };

function createBloodEffect() {
  const impact = 0.5;
  const local = (spread) => Math.max(0.04, Math.min(0.96, impact + (Math.random() - Math.random()) * spread));
  const arcDistance = (tangent, near, far, power = 1.45) => {
    const edge = Math.min(1, Math.abs(tangent));
    const centerBias = Math.pow(1 - edge, power);
    return near + (far - near) * centerBias;
  };
  const clampAlong = (value) => Math.max(0.08, Math.min(0.92, value));

  const core = {
    along: impact,
    distance: 0.012 + Math.random() * 0.04,
    radius: 0.2 + Math.random() * 0.12,
    squash: 0.72 + Math.random() * 0.28,
    shade: 0.62 + Math.random() * 0.28
  };

  const arcCount = 16 + Math.floor(Math.random() * 6);
  const arc = Array.from({ length: arcCount }, (_, index) => {
    const base = arcCount <= 1 ? 0.5 : index / (arcCount - 1);
    const tangent = (base - 0.5) * 1.62 + (Math.random() - Math.random()) * 0.1;
    const edge = Math.min(1, Math.abs(tangent));
    return {
      along: clampAlong(0.5 + tangent * 0.42 + (Math.random() - Math.random()) * 0.025),
      tangent,
      distance: arcDistance(tangent, 0.018, 0.22 + Math.random() * 0.08, 1 + Math.random() * 0.55) + Math.random() * 0.045,
      radius: 0.055 + (1 - edge) * 0.09 + Math.random() * 0.09,
      shade: 0.44 + Math.random() * 0.5
    };
  });

  const spray = Array.from({ length: 16 + Math.floor(Math.random() * 7) }, () => ({
    tangent: (Math.random() - 0.5) * 1.42,
    along: 0,
    distance: 0,
    radius: 0.022 + Math.random() * 0.11,
    smear: 0.04 + Math.random() * 0.2,
    shade: 0.38 + Math.random() * 0.58
  })).map((item) => ({
    ...item,
    along: clampAlong(0.5 + item.tangent * 0.38 + (Math.random() - Math.random()) * 0.08),
    distance: arcDistance(item.tangent, 0.06 + Math.random() * 0.04, 0.92 + Math.random() * 0.24, 1.2 + Math.random() * 0.9) + Math.random() * 0.12
  }));

  const satellites = Array.from({ length: 4 + Math.floor(Math.random() * 3) }, () => ({
    tangent: (Math.random() - 0.5) * 1.5,
    along: 0,
    distance: 0,
    radius: 0.035 + Math.random() * 0.13,
    shade: 0.34 + Math.random() * 0.5
  })).map((item) => ({
    ...item,
    along: clampAlong(0.5 + item.tangent * 0.34 + (Math.random() - Math.random()) * 0.11),
    distance: arcDistance(item.tangent, 0.16 + Math.random() * 0.08, 0.58 + Math.random() * 0.18, 0.9 + Math.random() * 0.6) + Math.random() * 0.14
  }));

  const streaks = Array.from({ length: 4 + Math.floor(Math.random() * 3) }, () => ({
    tangent: (Math.random() - 0.5) * 0.92,
    along: 0,
    distance: 0,
    length: 0.16 + Math.random() * 0.32,
    width: 0.024 + Math.random() * 0.03,
    shade: 0.45 + Math.random() * 0.45
  })).map((item) => ({
    ...item,
    along: clampAlong(0.5 + item.tangent * 0.3 + (Math.random() - Math.random()) * 0.06),
    distance: arcDistance(item.tangent, 0.035 + Math.random() * 0.03, 0.28 + Math.random() * 0.12, 1.15 + Math.random() * 0.5) + Math.random() * 0.05
  }));

  const drips = Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => ({
    along: local(0.12),
    distance: 0.04 + Math.random() * 0.18,
    length: 0.16 + Math.random() * 0.24,
    width: 0.018 + Math.random() * 0.028
  }));

  return { impact, core, arc, spray, satellites, streaks, drips };
}

function createCollapseBurst(row, col, direction, now) {
  const isHorizontal = direction === "up" || direction === "down";
  const normalSign = direction === "up" || direction === "left" ? -1 : 1;
  const count = 12 + ((Math.random() * 7) | 0);
  const particles = Array.from({ length: count }, () => {
    const tangent = (Math.random() - 0.5) * 0.95;
    const spread = 0.04 + Math.pow(Math.random(), 1.4) * 0.38;
    return {
      along: Math.max(0.1, Math.min(0.9, 0.5 + (Math.random() - Math.random()) * 0.2)),
      tangent,
      normal: spread * normalSign,
      vx: ((Math.random() - Math.random()) * 0.28) + (isHorizontal ? tangent * 0.24 : spread * normalSign * 0.05),
      vy: (Math.random() * 0.22) + (isHorizontal ? spread * normalSign * 0.05 : tangent * 0.18),
      wiggle: 0.08 + Math.random() * 0.22,
      wobble: 0.6 + Math.random() * 1.3,
      size: Math.random() < 0.5 ? 2 : Math.random() < 0.88 ? 3 : 4,
      alpha: 0.18 + Math.random() * 0.18,
      color: COLLAPSE_BURST_COLORS[(Math.random() * COLLAPSE_BURST_COLORS.length) | 0]
    };
  });

  return {
    row,
    col,
    direction,
    createdAt: now,
    lifetime: 360 + ((Math.random() * 360) | 0),
    particles
  };
}

function triggerShake(state, now, amplitude = 2.4, duration = 120) {
  state.shake = {
    startedAt: now,
    duration,
    amplitude
  };
}

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
