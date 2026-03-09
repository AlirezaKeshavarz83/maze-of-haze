import { drawBoard } from "./drawBoard.js";
import { drawWalls } from "./drawWalls.js";
import { drawMarkers } from "./drawMarkers.js";
import { drawPlayer } from "./drawPlayer.js";
import { drawEffects } from "./drawEffects.js";
import { getEasyTheme } from "./themes/easyTheme.js";
import { getMediumTheme } from "./themes/mediumTheme.js";
import { getHardTheme } from "./themes/hardTheme.js";
import { MOBILE_LAYOUT_BREAKPOINT, isPortraitPhoneViewport, shouldRotateBoardForMobile } from "../core/layout.js";
import { applyBoardTransform } from "./boardTransform.js";
import { getRenderSizing } from "./renderSizing.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function themeByMode(mode) {
  if (mode === "easy") return getEasyTheme();
  if (mode === "medium") return getMediumTheme();
  return getHardTheme();
}

function drawBoardBoundaries(ctx, metrics, mode) {
  const sizing = getRenderSizing(metrics);
  const boardWidth = metrics.cellW * metrics.cols;
  const boardHeight = metrics.cellH * metrics.rows;
  const left = metrics.originX;
  const right = metrics.originX + boardWidth;
  const top = metrics.originY;
  const bottom = metrics.originY + boardHeight;
  const fill =
    mode === "hard"
      ? "rgba(106, 98, 90, 0.44)"
      : mode === "medium"
        ? "rgba(40, 18, 24, 0.32)"
        : "rgba(36, 36, 36, 0.18)";
  const size = sizing.boundaryMark;
  const offset = sizing.boundaryOffset;

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

  const cssWidth = canvas.clientWidth || canvas.width;
  const cssHeight = canvas.clientHeight || canvas.height;
  const pixelRatio = cssWidth > 0 ? canvas.width / cssWidth : 1;
  const isPhoneWidth = cssWidth <= MOBILE_LAYOUT_BREAKPOINT;
  const isPortraitPhone = isPortraitPhoneViewport(cssWidth, cssHeight);
  const rotateBoard = shouldRotateBoardForMobile(cssWidth, cssHeight, state.rows, state.cols);
  const minViewport = Math.min(cssWidth, cssHeight);
  const outerPad = clamp(
    minViewport * (isPhoneWidth ? 0.032 : 0.03),
    isPhoneWidth ? 14 : 18,
    24
  ) * pixelRatio;
  const fallbackTopInset = (isPortraitPhone
    ? clamp(cssHeight * 0.17, 78, 106)
    : clamp(cssHeight * 0.09, 36, 52)) * pixelRatio;
  const topInset = isPhoneWidth
    ? (state.layoutTopInset > 0 ? state.layoutTopInset * pixelRatio : fallbackTopInset)
    : 0;
  const bottomInset = isPortraitPhone ? clamp(cssHeight * 0.012, 4, 8) * pixelRatio : 0;
  const availableWidth = Math.max(pixelRatio, canvas.width - outerPad * 2);
  const availableHeight = Math.max(pixelRatio, canvas.height - outerPad * 2 - topInset - bottomInset);
  const displayCols = rotateBoard ? state.rows : state.cols;
  const displayRows = rotateBoard ? state.cols : state.rows;
  let scale = Math.min(availableWidth / displayCols, availableHeight / displayRows);
  for (let i = 0; i < 2; i += 1) {
    const sizing = getRenderSizing({
      cellW: scale,
      cellH: scale,
      pixelRatio
    });
    const boundaryBudget = (sizing.boundaryOffset + sizing.boundaryMark * 0.5) * 2;
    const boundedWidth = Math.max(pixelRatio, availableWidth - boundaryBudget);
    const boundedHeight = Math.max(pixelRatio, availableHeight - boundaryBudget);
    scale = Math.min(boundedWidth / displayCols, boundedHeight / displayRows);
  }
  const boardWidth = scale * state.cols;
  const boardHeight = scale * state.rows;
  const renderedBoardWidth = rotateBoard ? boardHeight : boardWidth;
  const renderedBoardHeight = rotateBoard ? boardWidth : boardHeight;
  const driftEnabled = state.mode === "hard";
  const driftX = driftEnabled ? Math.sin(now * 0.00023) * 3 * pixelRatio : 0;
  const driftY = driftEnabled ? Math.cos(now * 0.00019) * 2 * pixelRatio : 0;
  let shakeX = 0;
  let shakeY = 0;
  if (state.shake) {
    const t = Math.max(0, Math.min(1, (now - state.shake.startedAt) / state.shake.duration));
    const decay = 1 - t;
    const pulse = Math.sin(t * Math.PI * 4.5);
    shakeX = pulse * state.shake.amplitude * decay * pixelRatio;
    shakeY = Math.cos(t * Math.PI * 3.2) * state.shake.amplitude * 0.5 * decay * pixelRatio;
  }
  const displayOriginX = (canvas.width - renderedBoardWidth) / 2 + driftX + shakeX;
  const displayOriginY = outerPad + topInset + (availableHeight - renderedBoardHeight) / 2 + driftY + shakeY;
  const transform = rotateBoard
    ? {
        rotated: true,
        originX: displayOriginX,
        originY: displayOriginY,
        renderedWidth: renderedBoardWidth
      }
    : null;
  const metrics = {
    originX: rotateBoard ? 0 : displayOriginX,
    originY: rotateBoard ? 0 : displayOriginY,
    cellW: scale,
    cellH: scale,
    rows: state.rows,
    cols: state.cols,
    pixelRatio,
    transform
  };

  ctx.save();
  applyBoardTransform(ctx, transform);
  drawBoardBoundaries(ctx, metrics, state.mode);
  drawWalls(ctx, state, metrics, theme, now);
  drawMarkers(ctx, state, metrics, theme);
  drawPlayer(ctx, state, metrics, theme, now);
  ctx.restore();
  drawEffects(ctx, canvas, state, theme, now, metrics);
}
