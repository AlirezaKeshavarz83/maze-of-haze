function directionOffset(dir) {
  if (dir === "up") return { x: 0, y: -1 };
  if (dir === "down") return { x: 0, y: 1 };
  if (dir === "left") return { x: -1, y: 0 };
  return { x: 1, y: 0 };
}

function defaultPlayerLayer() {
  return { x: 0, y: 0, hide: false, alpha: 1, origin: null, clipped: false };
}

function bounceLayers(animation, t, distance) {
  const dir = directionOffset(animation.direction);
  const hit = t < 0.5 ? t / 0.5 : (1 - t) / 0.5;
  return [
    {
      x: dir.x * distance * hit,
      y: dir.y * distance * hit,
      hide: false,
      alpha: 1,
      origin: animation.origin,
      clipped: false
    }
  ];
}

function resetLayers(animation, elapsed, t, distance) {
  const layers = [];
  const dir = directionOffset(animation.direction);
  const motion = 1 - Math.pow(1 - t, 2);

  if (elapsed < animation.fadeOutDuration) {
    const fadeT = elapsed / animation.fadeOutDuration;
    layers.push({
      x: dir.x * distance * 4.2 * motion,
      y: dir.y * distance * 4.2 * motion,
      hide: false,
      alpha: 1 - fadeT,
      origin: animation.origin,
      clipped: true
    });
  }

  const fadeInStart = animation.fadeInDelay ?? 0;
  if (elapsed >= fadeInStart) {
    const fadeInProgress = Math.max(
      0,
      Math.min(1, (elapsed - fadeInStart) / (animation.fadeInDuration || 1))
    );
    layers.push({
      x: 0,
      y: 0,
      hide: false,
      alpha: fadeInProgress,
      origin: null,
      clipped: false
    });
  }

  return layers.length ? layers : [{ x: 0, y: 0, hide: true, alpha: 0, origin: null, clipped: false }];
}

function simpleImpactLayers(animation, elapsed, t, distance) {
  const dir = directionOffset(animation.direction);
  const motion = 1 - Math.pow(1 - t, 2);
  const hide = elapsed >= animation.hiddenDuration;
  return [
    {
      x: dir.x * distance * motion,
      y: dir.y * distance * motion,
      hide,
      alpha: hide ? 0 : 1,
      origin: animation.origin,
      clipped: false
    }
  ];
}

export function getPlayerAnimationLayers(animation, now, cellW, cellH) {
  if (!animation) return [defaultPlayerLayer()];

  const elapsed = now - animation.startedAt;
  const duration = Math.max(1, animation.duration || 1);
  const t = Math.max(0, Math.min(1, elapsed / duration));
  const distance = Math.min(cellW, cellH) * 0.23;

  if (animation.type === "bounce") {
    return bounceLayers(animation, t, distance);
  }

  if (animation.fadeOutDuration) {
    return resetLayers(animation, elapsed, t, distance);
  }

  return simpleImpactLayers(animation, elapsed, t, distance);
}

export function clipToWallSide(ctx, animation, metrics) {
  if (!animation?.fadeOutDuration || animation.respawn == null || !animation.origin) return false;

  const { originX, originY, cellW, cellH, cols, rows } = metrics;
  const cellX = originX + animation.origin.col * cellW;
  const cellY = originY + animation.origin.row * cellH;
  const boardLeft = originX - cellW;
  const boardTop = originY - cellH;
  const boardRight = originX + cols * cellW + cellW;
  const boardBottom = originY + rows * cellH + cellH;

  ctx.beginPath();
  if (animation.direction === "up") {
    ctx.rect(boardLeft, cellY, boardRight - boardLeft, boardBottom - cellY);
  } else if (animation.direction === "down") {
    ctx.rect(boardLeft, boardTop, boardRight - boardLeft, cellY + cellH - boardTop);
  } else if (animation.direction === "left") {
    ctx.rect(cellX, boardTop, boardRight - cellX, boardBottom - boardTop);
  } else {
    ctx.rect(boardLeft, boardTop, cellX + cellW - boardLeft, boardBottom - boardTop);
  }
  ctx.clip();
  return true;
}
