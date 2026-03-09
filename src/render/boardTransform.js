export function applyBoardTransform(ctx, transform) {
  if (!transform?.rotated) return;

  ctx.translate(transform.originX + transform.renderedWidth, transform.originY);
  ctx.rotate(Math.PI / 2);
}
