import { LEVELS } from "../config/levels.js";
import { MODES } from "../config/modes.js";
import { SCREEN } from "./constants.js";
import { createInitialState } from "./state.js";
import { generateMaze } from "../maze/generateMaze.js";
import { findMazeEndpoints } from "../maze/farthestPoints.js";
import { attemptMove } from "../logic/movement.js";
import { handleBlockedMove, cleanupTemporaryWalls } from "../logic/collision.js";
import { advanceLevel } from "../logic/progression.js";
import { switchMode } from "../logic/modeSwitch.js";
import { setupKeyboard } from "../input/keyboard.js";
import { drawScene } from "../render/drawScene.js";

export function createGame({ canvas, ui }) {
  const ctx = canvas.getContext("2d");
  const state = createInitialState();
  let levelAdvanceTimer = null;
  let selectedMenuMode = "easy";

  function clearTransientState() {
    state.animation = null;
    state.inputLockedUntil = 0;
    state.temporaryWalls.clear();
  }

  function resizeCanvas() {
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    const width = Math.floor(canvas.clientWidth * dpr);
    const height = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function prepareLevel() {
    const level = LEVELS[state.levelIndex];
    state.rows = level.rows;
    state.cols = level.cols;
    state.maze = generateMaze(level.rows, level.cols);
    const endpoints = findMazeEndpoints(state.maze);
    state.start = endpoints.start;
    state.finish = endpoints.finish;
    state.player = { ...state.start };
    state.discoveredWalls = new Set();
    state.bloodEffects = new Map();
    state.temporaryWalls = new Map();
    clearTransientState();
  }

  function updateModeUI() {
    ui.modeLabel.textContent = `Mode: ${MODES[state.mode].label}`;
    for (const btn of ui.modeButtons) {
      btn.classList.toggle("active", btn.dataset.mode === state.mode);
    }
    for (const btn of ui.menuModeButtons) {
      btn.classList.toggle("active", btn.dataset.mode === selectedMenuMode);
    }
    document.body.classList.toggle("mode-medium", state.mode === "medium");
    document.body.classList.toggle("mode-hard", state.mode === "hard");
  }

  function updateLevelUI() {
    ui.levelLabel.textContent = `Level ${state.levelIndex + 1}/${LEVELS.length}`;
  }

  function updateScreenUI() {
    const inMenu = state.screen === SCREEN.MENU;
    ui.menuScreen.classList.toggle("hidden", !inMenu);
    ui.modePanel.classList.toggle("hidden", inMenu);

    ui.levelCompleteOverlay.classList.toggle("hidden", state.screen !== SCREEN.LEVEL_COMPLETE);
    ui.gameCompleteOverlay.classList.toggle("hidden", state.screen !== SCREEN.GAME_COMPLETE);
  }

  function startRun() {
    if (levelAdvanceTimer) {
      clearTimeout(levelAdvanceTimer);
      levelAdvanceTimer = null;
    }
    clearTransientState();
    state.levelIndex = 0;
    state.screen = SCREEN.PLAYING;
    state.mode = selectedMenuMode;
    prepareLevel();
    updateModeUI();
    updateLevelUI();
    updateScreenUI();
  }

  function onMove(direction) {
    if (state.screen !== SCREEN.PLAYING) return;

    const now = performance.now();
    if (now < state.inputLockedUntil) return;
    if (state.animation && now - state.animation.startedAt < state.animation.duration) return;

    const result = attemptMove(state, direction);
    if (result.blocked) {
      handleBlockedMove(state, direction, now);
      return;
    }

    if (result.moved && state.player.row === state.finish.row && state.player.col === state.finish.col) {
      clearTransientState();
      state.screen = SCREEN.LEVEL_COMPLETE;
      updateScreenUI();
      levelAdvanceTimer = setTimeout(() => {
        levelAdvanceTimer = null;
        nextLevel();
      }, 1000);
    }
  }

  function nextLevel() {
    if (levelAdvanceTimer) {
      clearTimeout(levelAdvanceTimer);
      levelAdvanceTimer = null;
    }
    if (!advanceLevel(state)) {
      clearTransientState();
      updateScreenUI();
      return;
    }
    prepareLevel();
    updateLevelUI();
    updateScreenUI();
  }

  function setMode(mode) {
    if (!MODES[mode]) return;
    if (state.mode !== mode) {
      clearTransientState();
    }
    switchMode(state, mode);
    updateModeUI();
  }

  ui.menuModeButtons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      if (state.screen !== SCREEN.MENU) return;
      setMode(btn.dataset.mode);
    });
    btn.addEventListener("focus", () => {
      if (state.screen !== SCREEN.MENU) return;
      setMode(btn.dataset.mode);
    });
    btn.addEventListener("click", () => {
      selectedMenuMode = btn.dataset.mode;
      setMode(selectedMenuMode);
      startRun();
    });
  });

  ui.newGameBtn.addEventListener("click", () => {
    if (levelAdvanceTimer) {
      clearTimeout(levelAdvanceTimer);
      levelAdvanceTimer = null;
    }
    clearTransientState();
    state.screen = SCREEN.MENU;
    updateScreenUI();
  });

  ui.modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  const teardownKeyboard = setupKeyboard(onMove);

  function tick(now) {
    resizeCanvas();
    cleanupTemporaryWalls(state, now);
    if (state.animation && now - state.animation.startedAt >= state.animation.duration) {
      state.animation = null;
    }

    drawScene(ctx, canvas, state, now);
    requestAnimationFrame(tick);
  }

  updateModeUI();
  updateLevelUI();
  updateScreenUI();
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  requestAnimationFrame(tick);

  return {
    destroy() {
      if (levelAdvanceTimer) clearTimeout(levelAdvanceTimer);
      window.removeEventListener("resize", resizeCanvas);
      teardownKeyboard();
    }
  };
}
