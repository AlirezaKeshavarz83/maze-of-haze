export function drawBoard(ctx, width, height, theme, mode) {
  ctx.fillStyle = theme.boardBg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = theme.floor;
  ctx.fillRect(10, 10, width - 20, height - 20);

  if (mode !== "hard") {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, width - 20, height - 20);
  }
}
