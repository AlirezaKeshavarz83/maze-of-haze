import "./styles.css";
import { createGame } from "./core/game.js";

const canvas = document.getElementById("gameCanvas");

createGame({
  canvas,
  ui: {
    menuScreen: document.getElementById("menuScreen"),
    modePanel: document.getElementById("modePanel"),
    newGameBtn: document.getElementById("newGameBtn"),
    levelCompleteOverlay: document.getElementById("levelCompleteOverlay"),
    gameCompleteOverlay: document.getElementById("gameCompleteOverlay"),
    modeButtons: Array.from(document.querySelectorAll(".mode-btn")),
    menuModeButtons: Array.from(document.querySelectorAll(".menu-mode")),
    levelLabel: document.getElementById("levelLabel"),
    modeLabel: document.getElementById("modeLabel")
  }
});
