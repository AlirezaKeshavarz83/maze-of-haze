function directionOffset(dir) {
  if (dir === "up") return { x: 0, y: -1 };
  if (dir === "down") return { x: 0, y: 1 };
  if (dir === "left") return { x: -1, y: 0 };
  return { x: 1, y: 0 };
}

function getAnimationState(animation, now, cellW, cellH) {
  if (!animation) return { x: 0, y: 0, hide: false, alpha: 1, origin: null };
  const t = Math.max(0, Math.min(1, (now - animation.startedAt) / animation.duration));
  const dir = directionOffset(animation.direction);
  const d = Math.min(cellW, cellH) * 0.23;

  if (animation.type === "bounce") {
    const hit = t < 0.5 ? t / 0.5 : (1 - t) / 0.5;
    return { x: dir.x * d * hit, y: dir.y * d * hit, hide: false, alpha: 1, origin: animation.origin };
  }

  const elapsed = now - animation.startedAt;
  const p = 1 - Math.pow(1 - t, 2);

  if (animation.fadeOutDuration) {
    if (elapsed < animation.fadeOutDuration) {
      const fade = 1 - (elapsed / animation.fadeOutDuration);
      return {
        x: dir.x * d * p,
        y: dir.y * d * p,
        hide: false,
        alpha: fade,
        origin: animation.origin
      };
    }

    const fadeInStart = animation.fadeInDelay ?? 0;
    if (elapsed < fadeInStart) {
      return { x: 0, y: 0, hide: true, alpha: 0, origin: animation.respawn };
    }

    const fadeInProgress = Math.max(
      0,
      Math.min(1, (elapsed - fadeInStart) / (animation.fadeInDuration || 1))
    );
    return {
      x: 0,
      y: 0,
      hide: false,
      alpha: fadeInProgress,
      origin: animation.respawn
    };
  }

  const hide = elapsed >= animation.hiddenDuration;
  return { x: dir.x * d * p, y: dir.y * d * p, hide, alpha: hide ? 0 : 1, origin: animation.origin };
}

export function drawPlayer(ctx, state, metrics, theme, now) {
  const { originX, originY, cellW, cellH } = metrics;
  const anim = getAnimationState(state.animation, now, cellW, cellH);
  const animOrigin = anim.origin ?? state.player;
  const cx = originX + animOrigin.col * cellW + cellW / 2;
  const cy = originY + animOrigin.row * cellH + cellH / 2;
  const breathe = 1 + Math.sin(now * 0.0032) * 0.028;

  if (state.animation?.type === "impact-reset" && anim.hide) return;

  ctx.save();
  ctx.globalAlpha = anim.alpha;
  const radius = Math.min(cellW, cellH) * 0.248 * breathe;
  if (theme.playerWarmGlow) {
    ctx.fillStyle = `${theme.playerWarmGlow}20`;
    ctx.beginPath();
    ctx.arc(cx + anim.x, cy + anim.y, radius * 1.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `${theme.playerGlow}26`;
    ctx.beginPath();
    ctx.arc(cx + anim.x, cy + anim.y, radius * 1.38, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = theme.player;
  ctx.beginPath();
  ctx.arc(cx + anim.x, cy + anim.y, radius, 0, Math.PI * 2);
  ctx.fill();

  if (theme.playerStroke) {
    ctx.strokeStyle = theme.playerStroke;
    ctx.lineWidth = Math.max(1.2 * metrics.pixelRatio, radius * 0.11);
    ctx.beginPath();
    ctx.arc(cx + anim.x, cy + anim.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
