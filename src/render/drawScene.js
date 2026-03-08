import { drawBoard } from "./drawBoard.js";
import { drawWalls } from "./drawWalls.js";
import { drawMarkers } from "./drawMarkers.js";
import { drawPlayer } from "./drawPlayer.js";
import { drawEffects } from "./drawEffects.js";
import { getEasyTheme } from "./themes/easyTheme.js";
import { getMediumTheme } from "./themes/mediumTheme.js";
import { getHardTheme } from "./themes/hardTheme.js";

function themeByMode(mode) {
  if (mode === "easy") return getEasyTheme();
  if (mode === "medium") return getMediumTheme();
  return getHardTheme();
}

function drawBoardBoundaries(ctx, metrics, mode) {
  const boardWidth = metrics.cellW * metrics.cols;
  const boardHeight = metrics.cellH * metrics.rows;
  const left = metrics.originX;
  const right = metrics.originX + boardWidth;
  const top = metrics.originY;
  const bottom = metrics.originY + boardHeight;
  const fill = mode === "hard" ? "rgba(216, 196, 172, 0.22)" : "rgba(40, 18, 24, 0.2)";
  const size = 4 * metrics.pixelRatio;
  const offset = 10 * metrics.pixelRatio;

  function drawCornerL(x, y, horizontalDir, verticalDir) {
    const arm = size * 2.4;
    const startX = x + horizontalDir * arm;
    const startY = y + verticalDir * arm;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, startY);
    ctx.stroke();
  }

  ctx.fillStyle = fill;
  ctx.strokeStyle = fill;
  ctx.lineWidth = size;
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";

  for (let c = 1; c < metrics.cols; c += 1) {
    const x = left + c * metrics.cellW - size / 2;
    ctx.fillRect(x, top - offset - size / 2, size, size);
    ctx.fillRect(x, bottom + offset - size / 2, size, size);
  }

  for (let r = 1; r < metrics.rows; r += 1) {
    const y = top + r * metrics.cellH - size / 2;
    ctx.fillRect(left - offset - size / 2, y, size, size);
    ctx.fillRect(right + offset - size / 2, y, size, size);
  }

  drawCornerL(left - offset, top - offset, 1, 1);
  drawCornerL(right + offset, top - offset, -1, 1);
  drawCornerL(left - offset, bottom + offset, 1, -1);
  drawCornerL(right + offset, bottom + offset, -1, -1);
}

export function drawScene(ctx, canvas, state, now) {
  const theme = themeByMode(state.mode);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBoard(ctx, canvas.width, canvas.height, theme, state.mode);
  if (!state.maze) return;

  const outerPad = Math.max(24, Math.min(canvas.width, canvas.height) * 0.03);
  const availableWidth = canvas.width - outerPad * 2;
  const availableHeight = canvas.height - outerPad * 2;
  const scale = Math.min(availableWidth / state.cols, availableHeight / state.rows);
  const boardWidth = scale * state.cols;
  const boardHeight = scale * state.rows;
  const driftX = Math.sin(now * 0.00023) * 3 * (canvas.width / Math.max(canvas.clientWidth || canvas.width, 1));
  const driftY = Math.cos(now * 0.00019) * 2 * (canvas.height / Math.max(canvas.clientHeight || canvas.height, 1));
  const metrics = {
    originX: (canvas.width - boardWidth) / 2 + driftX,
    originY: (canvas.height - boardHeight) / 2 + driftY,
    cellW: scale,
    cellH: scale,
    rows: state.rows,
    cols: state.cols,
    pixelRatio: canvas.clientWidth > 0 ? canvas.width / canvas.clientWidth : 1
  };

  drawBoardBoundaries(ctx, metrics, state.mode);
  drawWalls(ctx, state, metrics, theme);
  drawMarkers(ctx, state, metrics, theme);
  drawPlayer(ctx, state, metrics, theme, now);
  drawEffects(ctx, canvas, state.mode, theme, now);
}
