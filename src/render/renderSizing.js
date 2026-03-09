function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function scaleCellRule(cellSize, pixelRatio, rule) {
  return clamp(cellSize * rule.ratio, rule.minPx * pixelRatio, rule.maxPx * pixelRatio);
}

function scaleFromBase(base, pixelRatio, rule) {
  return clamp(base * rule.multiplier, rule.minPx * pixelRatio, rule.maxPx * pixelRatio);
}

const RULES = {
  boundaryOffset: { ratio: 0.07, minPx: Number.NEGATIVE_INFINITY, maxPx: Number.POSITIVE_INFINITY }, // Distance from the maze border to the decorative outer boundary marks.
  boundaryMark: { ratio: 0.025, minPx: Number.NEGATIVE_INFINITY, maxPx: Number.POSITIVE_INFINITY }, // Shared stroke size of boundary marks in all modes.
  wallBase: { ratio: 0.052, minPx: Number.NEGATIVE_INFINITY, maxPx: Number.POSITIVE_INFINITY }, // Shared base wall thickness derived directly from cell size.
  mediumBloodThicknessRatio: 0.12, // Collapse blood thickness scales from cell size by this ratio.
  mediumBloodThicknessMinPx: 4.8, // Collapse blood thickness will not go below this screen-pixel floor before DPR scaling.
  mediumSprayStrokeFactor: 0.085, // Collapse blood spray stroke scales from blood thickness by this factor.
  mediumSprayStrokeMinPx: 1.05, // Collapse blood spray stroke will not go below this screen-pixel floor before DPR scaling.
  mediumStreakStrokeMinPx: 1.15, // Collapse blood streak stroke will not go below this screen-pixel floor before DPR scaling.
  mediumDripStrokeFactor: 0.82, // Collapse blood drip stroke scales from blood thickness and drip width by this factor.
  mediumDripStrokeMinPx: 1.2, // Collapse blood drip stroke will not go below this screen-pixel floor before DPR scaling.
  mediumWireSegment: { ratio: 0.17, minPx: Number.NEGATIVE_INFINITY, maxPx: Number.POSITIVE_INFINITY }, // Target segment length for subdividing Collapse wire walls.
  mediumWireJitter: { ratio: 0.05, minPx: Number.NEGATIVE_INFINITY, maxPx: Number.POSITIVE_INFINITY }, // Maximum sideways wobble applied to the Collapse wire path.
  mediumWireWidth: { multiplier: 0.25, minPx: Number.NEGATIVE_INFINITY, maxPx: Number.POSITIVE_INFINITY }, // Main stroke width of the primary Collapse wire wall.
  mediumWireDetailWidth: { multiplier: 0.50, minPx: Number.NEGATIVE_INFINITY, maxPx: Number.POSITIVE_INFINITY }, // Secondary detail stroke width layered on top of the Collapse wire wall.
  mediumWireRoughNoise: { ratio: 0.03, minPx: Number.NEGATIVE_INFINITY, maxPx: Number.POSITIVE_INFINITY }, // Small roughness offset applied to the Collapse wire detail stroke.
  hardGlowWidth: { multiplier: 2.3, minPx: Number.NEGATIVE_INFINITY, maxPx: Number.POSITIVE_INFINITY }, // Outer glow stroke width for After mode walls.
  hardEdgeWidth: { multiplier: 1.75, minPx: Number.NEGATIVE_INFINITY, maxPx: Number.POSITIVE_INFINITY }, // Mid-layer edge stroke width for After mode walls.
  hardCoreWidth: { multiplier: 1.1, minPx: Number.NEGATIVE_INFINITY, maxPx: Number.POSITIVE_INFINITY }, // Bright inner core stroke width for After mode walls.
  markerStrokeRatio: 0.057, // Portal ring stroke scales from cell size by this ratio.
  markerStrokeMinCanvasPx: 1.9, // Portal ring stroke will not go below this canvas-pixel floor.
  playerStrokeFactor: 0.11, // Player outline stroke scales from live player radius by this factor.
  playerStrokeMinPx: 1.2 // Player outline stroke will not go below this screen-pixel floor before DPR scaling.
};

export function getRenderSizing(metrics) {
  const cellSize = Math.min(metrics.cellW, metrics.cellH);
  const wallBase = scaleCellRule(cellSize, metrics.pixelRatio, RULES.wallBase);
  return {
    cellSize,
    wallBase,
    boundaryOffset: scaleCellRule(cellSize, metrics.pixelRatio, RULES.boundaryOffset),
    boundaryMark: scaleCellRule(cellSize, metrics.pixelRatio, RULES.boundaryMark),
    easyWall: wallBase,
    mediumBloodThicknessRatio: RULES.mediumBloodThicknessRatio,
    mediumBloodThicknessMinPx: RULES.mediumBloodThicknessMinPx,
    mediumSprayStrokeFactor: RULES.mediumSprayStrokeFactor,
    mediumSprayStrokeMinPx: RULES.mediumSprayStrokeMinPx,
    mediumStreakStrokeMinPx: RULES.mediumStreakStrokeMinPx,
    mediumDripStrokeFactor: RULES.mediumDripStrokeFactor,
    mediumDripStrokeMinPx: RULES.mediumDripStrokeMinPx,
    mediumWireSegment: scaleCellRule(cellSize, metrics.pixelRatio, RULES.mediumWireSegment),
    mediumWireJitter: scaleCellRule(cellSize, metrics.pixelRatio, RULES.mediumWireJitter),
    mediumWireWidth: scaleFromBase(wallBase, metrics.pixelRatio, RULES.mediumWireWidth),
    mediumWireDetailWidth: scaleFromBase(wallBase, metrics.pixelRatio, RULES.mediumWireDetailWidth),
    mediumWireRoughNoise: scaleCellRule(cellSize, metrics.pixelRatio, RULES.mediumWireRoughNoise),
    hardGlowWidth: scaleFromBase(wallBase, metrics.pixelRatio, RULES.hardGlowWidth),
    hardEdgeWidth: scaleFromBase(wallBase, metrics.pixelRatio, RULES.hardEdgeWidth),
    hardCoreWidth: scaleFromBase(wallBase, metrics.pixelRatio, RULES.hardCoreWidth),
    markerStrokeRatio: RULES.markerStrokeRatio,
    markerStrokeMinCanvasPx: RULES.markerStrokeMinCanvasPx,
    playerStrokeFactor: RULES.playerStrokeFactor,
    playerStrokeMinPx: RULES.playerStrokeMinPx
  };
}
