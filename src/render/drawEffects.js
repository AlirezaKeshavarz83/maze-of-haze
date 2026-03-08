export function drawEffects(ctx, canvas, mode, theme, now) {
  if (mode === "medium") {
    const vignette = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) * 0.28,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) * 0.62
    );
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, "rgba(214, 208, 199, 0.1)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(207, 200, 191, 0.04)";
    for (let i = 0; i < 18; i += 1) {
      const x = (Math.sin(now * 0.00013 + i * 11.7) * 0.5 + 0.5) * canvas.width;
      const y = (Math.cos(now * 0.0001 + i * 7.3) * 0.5 + 0.5) * canvas.height;
      ctx.fillRect(x, y, 1.3, 1.3);
    }
    return;
  }

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
  ctx.fillStyle = theme.glow.replace("0.06", String(0.04 + pulse * 0.04));
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(60, 47, 47, 0.05)";
  for (let i = 0; i < 24; i += 1) {
    const x = (Math.sin(now * 0.00018 + i * 17.3) * 0.5 + 0.5) * width;
    const y = (Math.cos(now * 0.00014 + i * 9.1) * 0.5 + 0.5) * height;
    const size = 1.2 + (i % 3);
    ctx.fillRect(x, y, size, size);
  }
}
