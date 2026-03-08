import { wallKeyFromCell } from "../maze/wallKeys.js";
import { HARD_REVEAL_FADE_MS, HARD_REVEAL_MS } from "../core/constants.js";

function shouldRenderWall(state, key) {
  if (state.mode === "easy") return true;
  if (state.mode === "medium") return state.discoveredWalls.has(key);
  return state.temporaryWalls.has(key) || state.fadingWalls.has(key);
}

function hexToRgb(hex) {
  const cleaned = hex.replace("#", "");
  const value = Number.parseInt(cleaned, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function rgbaFromHex(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function bloodColor(theme, alpha, tone = "fresh") {
  if (tone === "dark") return rgbaFromHex(theme.bloodDark, alpha);
  if (tone === "dried") return rgbaFromHex(theme.bloodDried, alpha);
  if (tone === "highlight") return rgbaFromHex(theme.bloodHighlight, alpha);
  if (tone === "faded") return rgbaFromHex(theme.bloodFaded, alpha);
  return rgbaFromHex(theme.bloodFresh, alpha);
}

function drawBloodMark(ctx, x1, y1, x2, y2, effect, wallSide, metrics, theme) {
  if (!effect) return;
  const isHorizontal = Math.abs(y1 - y2) < 0.001;
  const primary = isHorizontal ? x2 - x1 : y2 - y1;
  const cellSize = Math.min(metrics.cellW, metrics.cellH);
  const thickness = Math.max(4.8 * metrics.pixelRatio, cellSize * 0.12);
  const offsetSign = wallSide === "top" || wallSide === "left" ? -1 : 1;
  const normalX = isHorizontal ? 0 : offsetSign;
  const normalY = isHorizontal ? offsetSign : 0;
  const tangentX = isHorizontal ? 1 : 0;
  const tangentY = isHorizontal ? 0 : 1;

  const drawBlob = (along, tangent, distance, radiusScale, squash, shade) => {
    const alongX = isHorizontal ? primary * along : 0;
    const alongY = isHorizontal ? 0 : primary * along;
    const px = x1 + alongX + tangentX * thickness * tangent + normalX * thickness * distance;
    const py = y1 + alongY + tangentY * thickness * tangent + normalY * thickness * distance;
    const rx = thickness * radiusScale * (isHorizontal ? squash * 1.25 : squash);
    const ry = thickness * radiusScale * (isHorizontal ? squash : squash * 1.25);

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((Math.sin(along * 13.7) * 0.2) + (isHorizontal ? 0 : Math.PI * 0.5));
    ctx.fillStyle = bloodColor(theme, 0.5 + shade * 0.28, shade > 0.8 ? "highlight" : shade < 0.46 ? "faded" : "fresh");
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return { px, py };
  };

  drawBlob(
    effect.core.along,
    0,
    effect.core.distance,
    effect.core.radius,
    effect.core.squash,
    effect.core.shade
  );

  for (const droplet of effect.arc ?? []) {
    drawBlob(
      droplet.along,
      droplet.tangent,
      droplet.distance,
      droplet.radius,
      0.96 + droplet.shade * 0.2,
      droplet.shade
    );
  }

  for (const droplet of effect.spray ?? []) {
    const { px, py } = drawBlob(
      droplet.along,
      droplet.tangent,
      droplet.distance,
      droplet.radius,
      0.92 + droplet.shade * 0.22,
      droplet.shade
    );
    ctx.strokeStyle = bloodColor(theme, 0.2 + droplet.shade * 0.15, "dark");
    ctx.lineWidth = Math.max(1.05 * metrics.pixelRatio, thickness * 0.085);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(
      px + normalX * thickness * droplet.smear * 1.32,
      py + normalY * thickness * droplet.smear * 1.52
    );
    ctx.stroke();
  }

  for (const droplet of effect.satellites ?? []) {
    drawBlob(
      droplet.along,
      droplet.tangent,
      droplet.distance,
      droplet.radius,
      0.85 + droplet.shade * 0.2,
      droplet.shade
    );
  }

  for (const streak of effect.streaks ?? []) {
    const alongX = isHorizontal ? primary * streak.along : 0;
    const alongY = isHorizontal ? 0 : primary * streak.along;
    const px = x1 + alongX + tangentX * thickness * streak.tangent + normalX * thickness * streak.distance;
    const py = y1 + alongY + tangentY * thickness * streak.tangent + normalY * thickness * streak.distance;
    ctx.strokeStyle = bloodColor(theme, 0.34 + streak.shade * 0.22, streak.shade > 0.8 ? "highlight" : "dark");
    ctx.lineWidth = Math.max(1.15 * metrics.pixelRatio, thickness * streak.width);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(
      px + normalX * thickness * streak.length * 1.35 + tangentX * thickness * streak.tangent * 0.55,
      py + normalY * thickness * streak.length * 1.45 + tangentY * thickness * streak.tangent * 0.55
    );
    ctx.stroke();
  }

  for (const drip of effect.drips) {
    const px = x1 + (isHorizontal ? primary * drip.along : 0) + normalX * thickness * drip.distance;
    const py = y1 + (isHorizontal ? 0 : primary * drip.along) + normalY * thickness * drip.distance;
    const dx = 0;
    const dy = thickness * drip.length * 1.42;
    ctx.strokeStyle = bloodColor(theme, 0.38, "dried");
    ctx.lineWidth = Math.max(1.2 * metrics.pixelRatio, thickness * drip.width * 0.82);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + dx, py + dy);
    ctx.stroke();
  }
}

function drawMediumBlood(ctx, x1, y1, x2, y2, effectBySide, metrics, theme) {
  if (!effectBySide) return;
  const isHorizontal = Math.abs(y1 - y2) < 0.001;
  const sides = isHorizontal ? ["top", "bottom"] : ["left", "right"];
  for (const side of sides) {
    for (const layer of effectBySide[side] ?? []) {
      drawBloodMark(ctx, x1, y1, x2, y2, layer, side, metrics, theme);
    }
  }
}

function hashNoise(key, step) {
  let hash = 2166136261;
  const text = `${key}:${step}`;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000) / 999;
}

function drawMediumWire(ctx, x1, y1, x2, y2, metrics, theme, wallKey) {
  const isHorizontal = Math.abs(y1 - y2) < 0.001;
  const length = isHorizontal ? x2 - x1 : y2 - y1;
  const segments = Math.max(8, Math.round(length / (14 * metrics.pixelRatio)));
  const jitter = 3.4 * metrics.pixelRatio;
  ctx.strokeStyle = theme.wall;
  ctx.lineWidth = 3 * metrics.pixelRatio;
  ctx.beginPath();

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const baseX = x1 + (x2 - x1) * t;
    const baseY = y1 + (y2 - y1) * t;
    const edgeBias = 0.75 + (1 - Math.abs(t - 0.5) * 1.4) * 0.35;
    const baseNoise = hashNoise(wallKey, i) - 0.5;
    const prevNoise = i > 0 ? hashNoise(wallKey, i - 1) - 0.5 : baseNoise;
    const nextNoise = i < segments ? hashNoise(wallKey, i + 1) - 0.5 : baseNoise;
    const blendedNoise = (baseNoise * 0.55) + (prevNoise * 0.2) + (nextNoise * 0.25);
    const wobble = blendedNoise * jitter * edgeBias;
    const px = isHorizontal ? baseX : baseX + wobble;
    const py = isHorizontal ? baseY + wobble : baseY;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.stroke();

  ctx.strokeStyle = theme.wallVariation;
  ctx.lineWidth = 1.35 * metrics.pixelRatio;
  ctx.beginPath();
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const baseX = x1 + (x2 - x1) * t;
    const baseY = y1 + (y2 - y1) * t;
    const noise = (hashNoise(`${wallKey}:rough`, i) - 0.5) * 1.1 * metrics.pixelRatio;
    const px = isHorizontal ? baseX : baseX + noise;
    const py = isHorizontal ? baseY + noise : baseY;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function drawHardNeonWall(ctx, x1, y1, x2, y2, metrics, theme, progress) {
  const collapse = progress * progress;
  const alpha = 1 - collapse;
  const midX = (x1 + x2) * 0.5;
  const midY = (y1 + y2) * 0.5;
  const sx1 = x1 + (midX - x1) * collapse;
  const sy1 = y1 + (midY - y1) * collapse;
  const sx2 = x2 + (midX - x2) * collapse;
  const sy2 = y2 + (midY - y2) * collapse;

  if (alpha <= 0.02) return;

  ctx.strokeStyle = rgbaFromHex(theme.wallGlow, 0.12 * alpha);
  ctx.lineWidth = 8 * metrics.pixelRatio;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  ctx.strokeStyle = rgbaFromHex(theme.wallEdge, 0.18 * alpha);
  ctx.lineWidth = 5.8 * metrics.pixelRatio;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  ctx.strokeStyle = rgbaFromHex(theme.wall, alpha);
  ctx.lineWidth = 3.8 * metrics.pixelRatio;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();
}

function hardWallProgress(state, key, now) {
  if (state.fadingWalls.has(key)) {
    const fade = state.fadingWalls.get(key);
    const remaining = Math.max(0, fade.endsAt - now);
    const t = HARD_REVEAL_FADE_MS <= 0 ? 1 : 1 - (remaining / HARD_REVEAL_FADE_MS);
    return fade.fromProgress + (1 - fade.fromProgress) * t;
  }

  const remaining = Math.max(0, (state.temporaryWalls.get(key) ?? now) - now);
  const fadeWindow = Math.min(260, HARD_REVEAL_MS * 0.24);
  return fadeWindow <= 0 ? 1 : Math.max(0, Math.min(1, 1 - (remaining / fadeWindow)));
}

export function drawWalls(ctx, state, metrics, theme, now) {
  const { originX, originY, cellW, cellH } = metrics;
  const wallWidth = state.mode === "medium"
    ? 10 * metrics.pixelRatio
    : state.mode === "hard"
      ? 7 * metrics.pixelRatio
      : Math.max(2.2, Math.min(cellW, cellH) * 0.052);
  ctx.lineCap = "round";

  for (let r = 0; r < state.rows; r += 1) {
    for (let c = 0; c < state.cols; c += 1) {
      const cell = state.maze[r][c];
      const x = originX + c * cellW;
      const y = originY + r * cellH;

      if (cell.walls.top) {
        const key = wallKeyFromCell(r, c, "top");
        if (shouldRenderWall(state, key)) {
          if (state.mode === "medium" && state.discoveredWalls.has(key)) {
            drawMediumWire(ctx, x, y, x + cellW, y, metrics, theme, key);
            drawMediumBlood(ctx, x, y, x + cellW, y, state.bloodEffects.get(key), metrics, theme);
          } else if (state.mode === "hard") {
            drawHardNeonWall(ctx, x, y, x + cellW, y, metrics, theme, hardWallProgress(state, key, now));
          } else {
            ctx.lineWidth = wallWidth;
            ctx.strokeStyle = theme.wall;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellW, y);
            ctx.stroke();
          }
        }
      }

      if (cell.walls.left) {
        const key = wallKeyFromCell(r, c, "left");
        if (shouldRenderWall(state, key)) {
          if (state.mode === "medium" && state.discoveredWalls.has(key)) {
            drawMediumWire(ctx, x, y, x, y + cellH, metrics, theme, key);
            drawMediumBlood(ctx, x, y, x, y + cellH, state.bloodEffects.get(key), metrics, theme);
          } else if (state.mode === "hard") {
            drawHardNeonWall(ctx, x, y, x, y + cellH, metrics, theme, hardWallProgress(state, key, now));
          } else {
            ctx.lineWidth = wallWidth;
            ctx.strokeStyle = theme.wall;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + cellH);
            ctx.stroke();
          }
        }
      }

      if (r === state.rows - 1 && cell.walls.bottom) {
        const key = wallKeyFromCell(r, c, "bottom");
        if (shouldRenderWall(state, key)) {
          if (state.mode === "medium" && state.discoveredWalls.has(key)) {
            drawMediumWire(ctx, x, y + cellH, x + cellW, y + cellH, metrics, theme, key);
            drawMediumBlood(ctx, x, y + cellH, x + cellW, y + cellH, state.bloodEffects.get(key), metrics, theme);
          } else if (state.mode === "hard") {
            drawHardNeonWall(ctx, x, y + cellH, x + cellW, y + cellH, metrics, theme, hardWallProgress(state, key, now));
          } else {
            ctx.lineWidth = wallWidth;
            ctx.strokeStyle = theme.wall;
            ctx.beginPath();
            ctx.moveTo(x, y + cellH);
            ctx.lineTo(x + cellW, y + cellH);
            ctx.stroke();
          }
        }
      }

      if (c === state.cols - 1 && cell.walls.right) {
        const key = wallKeyFromCell(r, c, "right");
        if (shouldRenderWall(state, key)) {
          if (state.mode === "medium" && state.discoveredWalls.has(key)) {
            drawMediumWire(ctx, x + cellW, y, x + cellW, y + cellH, metrics, theme, key);
            drawMediumBlood(ctx, x + cellW, y, x + cellW, y + cellH, state.bloodEffects.get(key), metrics, theme);
          } else if (state.mode === "hard") {
            drawHardNeonWall(ctx, x + cellW, y, x + cellW, y + cellH, metrics, theme, hardWallProgress(state, key, now));
          } else {
            ctx.lineWidth = wallWidth;
            ctx.strokeStyle = theme.wall;
            ctx.beginPath();
            ctx.moveTo(x + cellW, y);
            ctx.lineTo(x + cellW, y + cellH);
            ctx.stroke();
          }
        }
      }
    }
  }
}
