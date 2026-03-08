export function drawMarkers(ctx, state, metrics, theme) {
  const { originX, originY, cellW, cellH } = metrics;
  const size = Math.min(cellW, cellH);
  const line = Math.max(2, size * 0.06);

  const sx = originX + state.start.col * cellW;
  const sy = originY + state.start.row * cellH;
  const scx = sx + cellW * 0.5;
  const scy = sy + cellH * 0.5;
  const sOuter = size * 0.31;
  ctx.strokeStyle = theme.start;
  ctx.lineWidth = line;
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
    glow.addColorStop(0, `${theme.finishGlow}00`);
    glow.addColorStop(0.65, `${theme.finishGlow}66`);
    glow.addColorStop(1, `${theme.finishGlow}00`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(fcx, fcy, fOuter * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = theme.finish;
  ctx.lineWidth = line;
  ctx.beginPath();
  ctx.arc(fcx, fcy, fOuter, 0, Math.PI * 2);
  ctx.stroke();
}
