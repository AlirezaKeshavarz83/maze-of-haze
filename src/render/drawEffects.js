function collapseDustColor(tone, alpha) {
  if (tone === "dark") return `rgba(110, 100, 92, ${alpha})`;
  if (tone === "darkest") return `rgba(76, 68, 61, ${alpha})`;
  if (tone === "mid") return `rgba(197, 188, 178, ${alpha})`;
  return `rgba(222, 214, 205, ${alpha})`;
}

function drawCollapseAmbient(ctx, width, height, now) {
  const area = (width * height) / 1000000;
  const count = Math.max(120, Math.min(180, Math.round(120 + area * 36)));

  for (let i = 0; i < count; i += 1) {
    const seedA = i * 17.13;
    const seedB = i * 23.41;
    const sizeRoll = (Math.sin(i * 12.73) * 0.5) + 0.5;
    const size = sizeRoll < 0.7 ? 2 : sizeRoll < 0.95 ? 3 : 4;
    const isDark = i % 8 === 0;
    const isDarkest = i % 15 === 0;
    const alpha = isDarkest
      ? 0.16 + (((Math.sin(i * 4.7) * 0.5) + 0.5) * 0.12)
      : isDark
        ? 0.17 + (((Math.cos(i * 5.1) * 0.5) + 0.5) * 0.12)
        : 0.2 + (((Math.sin(i * 7.3) * 0.5) + 0.5) * 0.18);
    const tone = isDarkest ? "darkest" : isDark ? "dark" : i % 4 === 0 ? "mid" : "light";
    const xDrift = 0.000011 + (i % 10) * 0.0000024;
    const yDrift = 0.0000048 + (i % 6) * 0.0000012;
    const sway = 4.8 + (i % 5) * 1.4;
    const baseX = ((((Math.sin(seedA * 0.91) * 0.5) + 0.5) * width) + (now * xDrift * width)) % (width + 36);
    const baseY = ((((Math.cos(seedB * 0.87) * 0.5) + 0.5) * height) + (now * yDrift * height)) % (height + 24);
    const noiseA = Math.sin(now * (0.000045 + (i % 4) * 0.000008) + seedB);
    const noiseB = Math.cos(now * (0.00003 + (i % 5) * 0.000006) + seedA * 0.6);
    const x = (
      baseX
      + noiseA * sway
      + noiseB * sway * 0.35
      - 18
    ) % (width + 36);
    const y = (baseY + noiseB * 0.9) % (height + 24);
    ctx.fillStyle = collapseDustColor(tone, alpha);
    ctx.beginPath();
    ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function burstDustColor(color, alpha) {
  if (color === "dark") return `rgba(126, 116, 106, ${alpha})`;
  if (color === "mid") return `rgba(191, 182, 170, ${alpha})`;
  return `rgba(207, 200, 191, ${alpha})`;
}

function burstOrigin(burst, metrics) {
  const x = metrics.originX + burst.col * metrics.cellW;
  const y = metrics.originY + burst.row * metrics.cellH;
  if (burst.direction === "up") {
    return { x: x + metrics.cellW * 0.5, y };
  }
  if (burst.direction === "down") {
    return { x: x + metrics.cellW * 0.5, y: y + metrics.cellH };
  }
  if (burst.direction === "left") {
    return { x, y: y + metrics.cellH * 0.5 };
  }
  return { x: x + metrics.cellW, y: y + metrics.cellH * 0.5 };
}

function drawCollapseBursts(ctx, state, now, metrics) {
  const scale = Math.min(metrics.cellW, metrics.cellH);
  for (const burst of state.collapseBursts) {
    const t = Math.max(0, Math.min(1, (now - burst.createdAt) / burst.lifetime));
    const fade = 1 - Math.pow(t, 1.6);
    if (fade <= 0.02) continue;

    const origin = burstOrigin(burst, metrics);
    const isHorizontalWall = burst.direction === "up" || burst.direction === "down";
    for (const particle of burst.particles) {
      const easeOut = 1 - Math.pow(1 - t, 2.2);
      const tangentOffset = (particle.tangent + particle.vx * 0.35) * scale * 0.42;
      const normalOffset = (particle.normal + particle.vy * 0.4) * scale * 0.42;
      const finalOffsetX = isHorizontalWall ? tangentOffset : normalOffset;
      const finalOffsetY = isHorizontalWall ? normalOffset : tangentOffset;
      const px = origin.x + finalOffsetX * easeOut;
      const py = origin.y + finalOffsetY * easeOut;
      ctx.fillStyle = burstDustColor(particle.color, particle.alpha * fade);
      ctx.fillRect(px, py, particle.size * metrics.pixelRatio * 1.55, particle.size * metrics.pixelRatio * 1.55);
    }
  }
}

export function drawEffects(ctx, canvas, state, theme, now, metrics) {
  const mode = state.mode;
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

    drawCollapseAmbient(ctx, width, height, now);
    if (metrics) drawCollapseBursts(ctx, state, now, metrics);
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
