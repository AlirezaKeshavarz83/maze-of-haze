export function drawEffects(ctx, canvas, mode, theme, now) {
  if (mode !== "hard") return;

  const { width, height } = canvas;

  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.2,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.6
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.5)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const pulse = 0.5 + 0.5 * Math.sin(now * 0.003);
  ctx.fillStyle = theme.glow.replace("0.12", String(0.08 + pulse * 0.08));
  ctx.fillRect(0, 0, width, height);
}
