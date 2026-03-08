const COLLAPSE_BURST_COLORS = ["light", "light", "light", "light", "mid", "mid", "dark"];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function localImpactOffset(impact, spread) {
  return clamp(impact + (Math.random() - Math.random()) * spread, 0.04, 0.96);
}

function arcDistance(tangent, near, far, power = 1.45) {
  const edge = Math.min(1, Math.abs(tangent));
  const centerBias = Math.pow(1 - edge, power);
  return near + (far - near) * centerBias;
}

function alongFromTangent(tangent, scale, jitter) {
  return clamp(0.5 + tangent * scale + (Math.random() - Math.random()) * jitter, 0.08, 0.92);
}

function createArcDroplets() {
  const count = 16 + Math.floor(Math.random() * 6);
  return Array.from({ length: count }, (_, index) => {
    const base = count <= 1 ? 0.5 : index / (count - 1);
    const tangent = (base - 0.5) * 1.62 + (Math.random() - Math.random()) * 0.1;
    const edge = Math.min(1, Math.abs(tangent));
    return {
      along: alongFromTangent(tangent, 0.42, 0.025),
      tangent,
      distance:
        arcDistance(tangent, 0.018, 0.22 + Math.random() * 0.08, 1 + Math.random() * 0.55) +
        Math.random() * 0.045,
      radius: 0.055 + (1 - edge) * 0.09 + Math.random() * 0.09,
      shade: 0.44 + Math.random() * 0.5
    };
  });
}

function createSprayDroplets() {
  return Array.from({ length: 16 + Math.floor(Math.random() * 7) }, () => {
    const tangent = (Math.random() - 0.5) * 1.42;
    return {
      tangent,
      along: alongFromTangent(tangent, 0.38, 0.08),
      distance:
        arcDistance(tangent, 0.06 + Math.random() * 0.04, 0.92 + Math.random() * 0.24, 1.2 + Math.random() * 0.9) +
        Math.random() * 0.12,
      radius: 0.022 + Math.random() * 0.11,
      smear: 0.04 + Math.random() * 0.2,
      shade: 0.38 + Math.random() * 0.58
    };
  });
}

function createSatelliteDroplets() {
  return Array.from({ length: 4 + Math.floor(Math.random() * 3) }, () => {
    const tangent = (Math.random() - 0.5) * 1.5;
    return {
      tangent,
      along: alongFromTangent(tangent, 0.34, 0.11),
      distance:
        arcDistance(tangent, 0.16 + Math.random() * 0.08, 0.58 + Math.random() * 0.18, 0.9 + Math.random() * 0.6) +
        Math.random() * 0.14,
      radius: 0.035 + Math.random() * 0.13,
      shade: 0.34 + Math.random() * 0.5
    };
  });
}

function createStreaks() {
  return Array.from({ length: 4 + Math.floor(Math.random() * 3) }, () => {
    const tangent = (Math.random() - 0.5) * 0.92;
    return {
      tangent,
      along: alongFromTangent(tangent, 0.3, 0.06),
      distance:
        arcDistance(tangent, 0.035 + Math.random() * 0.03, 0.28 + Math.random() * 0.12, 1.15 + Math.random() * 0.5) +
        Math.random() * 0.05,
      length: 0.16 + Math.random() * 0.32,
      width: 0.024 + Math.random() * 0.03,
      shade: 0.45 + Math.random() * 0.45
    };
  });
}

function createDrips(impact) {
  return Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => ({
    along: localImpactOffset(impact, 0.12),
    distance: 0.04 + Math.random() * 0.18,
    length: 0.16 + Math.random() * 0.24,
    width: 0.018 + Math.random() * 0.028
  }));
}

export function createBloodEffect() {
  const impact = 0.5;
  return {
    impact,
    core: {
      along: impact,
      distance: 0.012 + Math.random() * 0.04,
      radius: 0.2 + Math.random() * 0.12,
      squash: 0.72 + Math.random() * 0.28,
      shade: 0.62 + Math.random() * 0.28
    },
    arc: createArcDroplets(),
    spray: createSprayDroplets(),
    satellites: createSatelliteDroplets(),
    streaks: createStreaks(),
    drips: createDrips(impact)
  };
}

export function createCollapseBurst(row, col, direction, now) {
  const isHorizontal = direction === "up" || direction === "down";
  const normalSign = direction === "up" || direction === "left" ? -1 : 1;
  const count = 12 + ((Math.random() * 7) | 0);
  const particles = Array.from({ length: count }, () => {
    const tangent = (Math.random() - 0.5) * 0.95;
    const spread = 0.04 + Math.pow(Math.random(), 1.4) * 0.38;
    return {
      along: clamp(0.5 + (Math.random() - Math.random()) * 0.2, 0.1, 0.9),
      tangent,
      normal: spread * normalSign,
      vx: (Math.random() - Math.random()) * 0.28 + (isHorizontal ? tangent * 0.24 : spread * normalSign * 0.05),
      vy: Math.random() * 0.22 + (isHorizontal ? spread * normalSign * 0.05 : tangent * 0.18),
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

export function triggerShake(state, now, amplitude = 2.4, duration = 120) {
  state.shake = {
    startedAt: now,
    duration,
    amplitude
  };
}
