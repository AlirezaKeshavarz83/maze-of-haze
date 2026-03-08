const KEY_TO_DIR = {
  ArrowUp: "up",
  ArrowRight: "right",
  ArrowDown: "down",
  ArrowLeft: "left",
  w: "up",
  d: "right",
  s: "down",
  a: "left",
  W: "up",
  D: "right",
  S: "down",
  A: "left"
};

export function setupKeyboard(onDirection) {
  const handler = (event) => {
    const dir = KEY_TO_DIR[event.key];
    if (!dir) return;
    event.preventDefault();
    onDirection(dir);
  };

  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}
