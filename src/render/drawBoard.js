export function drawBoard(ctx, width, height, theme, mode) {
  if (mode === "hard") {
    const gradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.47,
      Math.min(width, height) * 0.035,
      width * 0.5,
      height * 0.52,
      Math.max(width, height) * 0.58
    );
    gradient.addColorStop(0, theme.floor);
    gradient.addColorStop(0.16, theme.floor);
    gradient.addColorStop(1, theme.boardBg);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = theme.boardBg;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.fillStyle = theme.floor;
  ctx.fillRect(10, 10, width - 20, height - 20);

  if (mode === "medium") {
    ctx.fillStyle = theme.grain;
    for (let i = 0; i < 180; i += 1) {
      const x = 10 + ((i * 37) % Math.max(1, width - 20));
      const y = 10 + ((i * 53) % Math.max(1, height - 20));
      const w = i % 5 === 0 ? 2 : 1;
      ctx.globalAlpha = i % 7 === 0 ? 0.06 : 0.035;
      ctx.fillRect(x, y, w, 1);
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = theme.gridHint;
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, width - 20, height - 20);
  }

  if (mode !== "hard") {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, width - 20, height - 20);
  }
}
