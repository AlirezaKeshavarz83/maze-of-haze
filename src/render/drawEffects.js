export function drawEffects(ctx, canvas, mode, theme, now) {
  const { width, height } = canvas;

  const globalNoiseAlpha = mode === "easy" ? 0.018 : mode === "medium" ? 0.028 : 0.034;
  ctx.fillStyle = `rgba(0, 0, 0, ${globalNoiseAlpha})`;
  for (let i = 0; i < 120; i += 1) {
    const x = ((i * 97) % Math.max(1, width - 2));
    const y = ((i * 57) % Math.max(1, height - 2));
    ctx.fillRect(x, y, 1, 1);
  }

  if (mode === "medium") {
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.28,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.62
    );
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.06)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(207, 200, 191, 0.04)";
    for (let i = 0; i < 18; i += 1) {
      const x = (Math.sin(now * 0.00013 + i * 11.7) * 0.5 + 0.5) * width;
      const y = (Math.cos(now * 0.0001 + i * 7.3) * 0.5 + 0.5) * height;
      ctx.fillRect(x, y, 1.3, 1.3);
    }
    return;
  }

  if (mode !== "hard") return;

  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.14,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.58
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.58)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const pulse = 0.5 + 0.5 * Math.sin(now * 0.003);
  ctx.fillStyle = theme.glow.replace("0.08", String(0.035 + pulse * 0.045));
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(106, 106, 106, 0.18)";
  for (let i = 0; i < 20; i += 1) {
    const x = (Math.sin(now * 0.00006 + i * 17.3) * 0.5 + 0.5) * width;
    const y = (Math.cos(now * 0.00005 + i * 9.1) * 0.5 + 0.5) * height;
    const size = 1 + (i % 2);
    ctx.fillRect(x, y, size, size);
  }
}
