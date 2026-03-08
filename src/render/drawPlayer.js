function directionOffset(dir) {
  if (dir === "up") return { x: 0, y: -1 };
  if (dir === "down") return { x: 0, y: 1 };
  if (dir === "left") return { x: -1, y: 0 };
  return { x: 1, y: 0 };
}

function defaultPlayerLayer(player) {
  return { x: 0, y: 0, hide: false, alpha: 1, origin: player, clipped: false };
}

function clipToWallSide(ctx, animation, metrics) {
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

function getAnimationLayers(animation, now, cellW, cellH) {
  if (!animation) return [defaultPlayerLayer(null)];
  const t = Math.max(0, Math.min(1, (now - animation.startedAt) / animation.duration));
  const dir = directionOffset(animation.direction);
  const d = Math.min(cellW, cellH) * 0.23;

  if (animation.type === "bounce") {
    const hit = t < 0.5 ? t / 0.5 : (1 - t) / 0.5;
    return [
      {
        x: dir.x * d * hit,
        y: dir.y * d * hit,
        hide: false,
        alpha: 1,
        origin: animation.origin,
        clipped: false
      }
    ];
  }

  const elapsed = now - animation.startedAt;
  const p = 1 - Math.pow(1 - t, 2);

  if (animation.fadeOutDuration) {
    const layers = [];
    if (elapsed < animation.fadeOutDuration) {
      const fadeT = elapsed / animation.fadeOutDuration;
      layers.push({
        x: dir.x * d * 4.2 * p,
        y: dir.y * d * 4.2 * p,
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

  const hide = elapsed >= animation.hiddenDuration;
  return [
    {
      x: dir.x * d * p,
      y: dir.y * d * p,
      hide,
      alpha: hide ? 0 : 1,
      origin: animation.origin,
      clipped: false
    }
  ];
}

function drawPlayerBody(ctx, metrics, theme, now, layer) {
  const { originX, originY, cellW, cellH } = metrics;
  const origin = layer.origin;
  const cx = originX + origin.col * cellW + cellW / 2;
  const cy = originY + origin.row * cellH + cellH / 2;
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
    ctx.lineWidth = Math.max(1.2 * metrics.pixelRatio, radius * 0.11);
    ctx.beginPath();
    ctx.arc(cx + layer.x, cy + layer.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawPlayer(ctx, state, metrics, theme, now) {
  const layers = getAnimationLayers(state.animation, now, metrics.cellW, metrics.cellH).map((layer) => {
    if (layer.origin) return layer;
    return { ...layer, origin: state.player };
  });
  const visibleLayers = layers.filter((layer) => !layer.hide && layer.alpha > 0 && layer.origin);

  for (const layer of visibleLayers) {
    ctx.save();
    // Hard-mode death renders the outgoing body clipped to the hit wall side,
    // while the respawn body can fade in separately at the live player position.
    if (layer.clipped && state.mode === "hard" && state.animation?.type === "impact-reset") {
      clipToWallSide(ctx, state.animation, metrics);
    }
    drawPlayerBody(ctx, metrics, theme, now, layer);
    ctx.restore();
  }
}
