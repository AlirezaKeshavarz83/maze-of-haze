import { wallKeyFromCell } from "../maze/wallKeys.js";

function shouldRenderWall(state, key) {
  if (state.mode === "easy") return true;
  if (state.mode === "medium") return state.discoveredWalls.has(key);
  return state.temporaryWalls.has(key);
}

function bloodColor(alpha) {
  return `rgba(214, 26, 40, ${Math.min(1, alpha + 0.12)})`;
}

function drawBloodMark(ctx, x1, y1, x2, y2, effect, wallSide, metrics) {
  if (!effect) return;
  const isHorizontal = Math.abs(y1 - y2) < 0.001;
  const primary = isHorizontal ? x2 - x1 : y2 - y1;
  const cellSize = Math.min(metrics.cellW, metrics.cellH);
  const thickness = Math.max(4.5 * metrics.pixelRatio, cellSize * 0.12);
  const offsetSign = wallSide === "top" || wallSide === "left" ? -1 : 1;
  const normalX = isHorizontal ? 0 : offsetSign;
  const normalY = isHorizontal ? offsetSign : 0;

  for (const droplet of effect.droplets) {
    const alongX = isHorizontal ? primary * droplet.along : 0;
    const alongY = isHorizontal ? 0 : primary * droplet.along;
    const spread = droplet.distance + droplet.offset * 0.9;
    const px = x1 + alongX + normalX * thickness * spread;
    const py = y1 + alongY + normalY * thickness * spread;
    const radius = thickness * (droplet.radius * 2.1);

    ctx.fillStyle = bloodColor(0.3 + droplet.shade * 0.45);
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = bloodColor(0.16 + droplet.shade * 0.18);
    ctx.lineWidth = Math.max(1.2 * metrics.pixelRatio, thickness * 0.1);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(
      px + normalX * thickness * droplet.smear * 1.55,
      py + normalY * thickness * droplet.smear * 1.75
    );
    ctx.stroke();
  }

  for (const drip of effect.drips) {
    const px = x1 + (isHorizontal ? primary * drip.along : 0) + normalX * thickness * drip.distance;
    const py = y1 + (isHorizontal ? 0 : primary * drip.along) + normalY * thickness * drip.distance;
    const dx = 0;
    const dy = thickness * drip.length * 1.65;
    ctx.strokeStyle = bloodColor(0.72);
    ctx.lineWidth = Math.max(1.6 * metrics.pixelRatio, thickness * drip.width);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + dx, py + dy);
    ctx.stroke();
  }
}

function drawMediumBlood(ctx, x1, y1, x2, y2, effectBySide, metrics) {
  if (!effectBySide) return;
  const isHorizontal = Math.abs(y1 - y2) < 0.001;
  const sides = isHorizontal ? ["top", "bottom"] : ["left", "right"];
  for (const side of sides) {
    for (const layer of effectBySide[side] ?? []) {
      drawBloodMark(ctx, x1, y1, x2, y2, layer, side, metrics);
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
  ctx.lineWidth = 2.2 * metrics.pixelRatio;
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
}

function drawHardNeonWall(ctx, x1, y1, x2, y2, metrics, theme) {
  ctx.strokeStyle = "rgba(149, 227, 219, 0.14)";
  ctx.lineWidth = 11 * metrics.pixelRatio;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(188, 239, 233, 0.22)";
  ctx.lineWidth = 7.5 * metrics.pixelRatio;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.strokeStyle = theme.wall;
  ctx.lineWidth = 4.8 * metrics.pixelRatio;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function drawWalls(ctx, state, metrics, theme) {
  const { originX, originY, cellW, cellH } = metrics;
  const wallWidth = state.mode === "medium"
    ? 10 * metrics.pixelRatio
    : state.mode === "hard"
      ? 6.5 * metrics.pixelRatio
      : Math.max(2.5, Math.min(cellW, cellH) * 0.06);
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
            drawMediumBlood(ctx, x, y, x + cellW, y, state.bloodEffects.get(key), metrics);
          } else if (state.mode === "hard") {
            drawHardNeonWall(ctx, x, y, x + cellW, y, metrics, theme);
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
            drawMediumBlood(ctx, x, y, x, y + cellH, state.bloodEffects.get(key), metrics);
          } else if (state.mode === "hard") {
            drawHardNeonWall(ctx, x, y, x, y + cellH, metrics, theme);
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
            drawMediumBlood(ctx, x, y + cellH, x + cellW, y + cellH, state.bloodEffects.get(key), metrics);
          } else if (state.mode === "hard") {
            drawHardNeonWall(ctx, x, y + cellH, x + cellW, y + cellH, metrics, theme);
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
            drawMediumBlood(ctx, x + cellW, y, x + cellW, y + cellH, state.bloodEffects.get(key), metrics);
          } else if (state.mode === "hard") {
            drawHardNeonWall(ctx, x + cellW, y, x + cellW, y + cellH, metrics, theme);
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
