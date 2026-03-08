import "./styles.css";
import { createGame } from "./core/game.js";

const canvas = document.getElementById("gameCanvas");

createGame({
  canvas,
  ui: {
    menuScreen: document.getElementById("menuScreen"),
    modePanel: document.getElementById("modePanel"),
    startBtn: document.getElementById("startBtn"),
    startMode: document.getElementById("startMode"),
    newGameBtn: document.getElementById("newGameBtn"),
    levelCompleteOverlay: document.getElementById("levelCompleteOverlay"),
    gameCompleteOverlay: document.getElementById("gameCompleteOverlay"),
    modeButtons: Array.from(document.querySelectorAll(".mode-btn")),
    levelLabel: document.getElementById("levelLabel"),
    modeLabel: document.getElementById("modeLabel")
  }
});
