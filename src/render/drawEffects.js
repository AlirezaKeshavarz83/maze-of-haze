import { drawCollapseBursts, drawCollapseOverlay, drawGlobalNoise, drawHardEffects } from "./effectLayers.js";
import { applyBoardTransform } from "./boardTransform.js";

export function drawEffects(ctx, canvas, state, theme, now, metrics) {
  const mode = state.mode;
  const { width, height } = canvas;

  drawGlobalNoise(ctx, width, height, mode);

  if (mode === "medium") {
    drawCollapseOverlay(ctx, width, height, now);
    if (metrics) {
      ctx.save();
      applyBoardTransform(ctx, metrics.transform);
      drawCollapseBursts(ctx, state.collapseBursts, now, metrics);
      ctx.restore();
    }
    return;
  }

  if (mode === "hard") {
    drawHardEffects(ctx, width, height, theme, now);
  }
}
