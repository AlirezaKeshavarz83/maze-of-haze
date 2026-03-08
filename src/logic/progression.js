import { LEVELS } from "../config/levels.js";
import { SCREEN } from "../core/constants.js";

export function hasNextLevel(levelIndex) {
  return levelIndex + 1 < LEVELS.length;
}

export function advanceLevel(state) {
  if (hasNextLevel(state.levelIndex)) {
    state.levelIndex += 1;
    state.screen = SCREEN.PLAYING;
    return true;
  }
  state.screen = SCREEN.GAME_COMPLETE;
  return false;
}
