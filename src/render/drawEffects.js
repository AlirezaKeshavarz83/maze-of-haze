import { drawCollapseEffects, drawGlobalNoise, drawHardEffects } from "./effectLayers.js";

export function drawEffects(ctx, canvas, state, theme, now, metrics) {
  const mode = state.mode;
  const { width, height } = canvas;

  drawGlobalNoise(ctx, width, height, mode);

  if (mode === "medium") {
    drawCollapseEffects(ctx, width, height, state, now, metrics);
    return;
  }

  if (mode === "hard") {
    drawHardEffects(ctx, width, height, theme, now);
  }
}
