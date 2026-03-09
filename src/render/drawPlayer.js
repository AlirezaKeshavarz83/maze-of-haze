import { clipToWallSide, getPlayerAnimationLayers } from "./playerAnimation.js";
import { getRenderSizing } from "./renderSizing.js";

function resolveLayerOrigin(layer, player) {
  if (layer.origin) return layer;
  return { ...layer, origin: player };
}

function drawPlayerBody(ctx, metrics, theme, now, layer, sizing) {
  const { originX, originY, cellW, cellH } = metrics;
  const cx = originX + layer.origin.col * cellW + cellW / 2;
  const cy = originY + layer.origin.row * cellH + cellH / 2;
  const breathe = 1 + Math.sin(now * 0.0032) * 0.028;
  const radius = Math.min(cellW, cellH) * 0.248 * breathe;

  ctx.globalAlpha = layer.alpha;
  if (theme.playerWarmGlow) {
    ctx.fillStyle = `${theme.playerWarmGlow}20`;
    ctx.beginPath();
    ctx.arc(cx + layer.x, cy + layer.y, radius * 1.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `${theme.playerGlow}26`;
    ctx.beginPath();
    ctx.arc(cx + layer.x, cy + layer.y, radius * 1.38, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = theme.player;
  ctx.beginPath();
  ctx.arc(cx + layer.x, cy + layer.y, radius, 0, Math.PI * 2);
  ctx.fill();

  if (theme.playerStroke) {
    ctx.strokeStyle = theme.playerStroke;
    ctx.lineWidth = Math.max(sizing.playerStrokeMinPx * metrics.pixelRatio, radius * sizing.playerStrokeFactor);
    ctx.beginPath();
    ctx.arc(cx + layer.x, cy + layer.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawAnimationLayer(ctx, state, metrics, theme, now, layer, sizing) {
  ctx.save();
  // Hard-mode death renders the outgoing body clipped to the hit wall side,
  // while the respawn body can fade in separately at the live player position.
  if (layer.clipped && state.mode === "hard" && state.animation?.type === "impact-reset") {
    clipToWallSide(ctx, state.animation, metrics);
  }
  drawPlayerBody(ctx, metrics, theme, now, layer, sizing);
  ctx.restore();
}

export function drawPlayer(ctx, state, metrics, theme, now) {
  const sizing = getRenderSizing(metrics);
  const layers = getPlayerAnimationLayers(state.animation, now, metrics.cellW, metrics.cellH)
    .map((layer) => resolveLayerOrigin(layer, state.player))
    .filter((layer) => !layer.hide && layer.alpha > 0 && layer.origin);

  for (const layer of layers) {
    drawAnimationLayer(ctx, state, metrics, theme, now, layer, sizing);
  }
}
