import { getRenderSizing } from "./renderSizing.js";

function addHexAlpha(hex, alpha) {
  const value = Math.max(0, Math.min(255, Math.round(alpha * 255)));
  return `${hex}${value.toString(16).padStart(2, "0")}`;
}

export function drawMarkers(ctx, state, metrics, theme) {
  const { originX, originY, cellW, cellH } = metrics;
  const sizing = getRenderSizing(metrics);
  const size = Math.min(cellW, cellH);
  const line = Math.max(sizing.markerStrokeMinCanvasPx, size * sizing.markerStrokeRatio);

  const sx = originX + state.start.col * cellW;
  const sy = originY + state.start.row * cellH;
  const scx = sx + cellW * 0.5;
  const scy = sy + cellH * 0.5;
  const sOuter = size * 0.31;
  if (theme.startGlow) {
    const glow = ctx.createRadialGradient(scx, scy, size * 0.08, scx, scy, sOuter * 1.45);
    glow.addColorStop(0, addHexAlpha(theme.startGlow, 0));
    glow.addColorStop(0.62, addHexAlpha(theme.startGlow, 0.18));
    glow.addColorStop(1, addHexAlpha(theme.startGlow, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(scx, scy, sOuter * 1.45, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = theme.start;
  ctx.lineWidth = line * 0.95;
  ctx.beginPath();
  ctx.arc(scx, scy, sOuter, 0, Math.PI * 2);
  ctx.stroke();

  const fx = originX + state.finish.col * cellW;
  const fy = originY + state.finish.row * cellH;
  const fcx = fx + cellW * 0.5;
  const fcy = fy + cellH * 0.5;
  const fOuter = size * 0.33;
  if (theme.finishGlow) {
    const glow = ctx.createRadialGradient(fcx, fcy, size * 0.08, fcx, fcy, fOuter * 1.5);
    glow.addColorStop(0, addHexAlpha(theme.finishGlow, 0));
    glow.addColorStop(0.65, addHexAlpha(theme.finishGlow, 0.22));
    glow.addColorStop(1, addHexAlpha(theme.finishGlow, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(fcx, fcy, fOuter * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = theme.finish;
  ctx.lineWidth = line * 0.95;
  ctx.beginPath();
  ctx.arc(fcx, fcy, fOuter, 0, Math.PI * 2);
  ctx.stroke();
}
