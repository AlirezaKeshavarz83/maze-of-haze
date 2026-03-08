export function wallKeyFromCell(row, col, direction) {
  if (direction === "top") return `h:${row}:${col}`;
  if (direction === "bottom") return `h:${row + 1}:${col}`;
  if (direction === "left") return `v:${row}:${col}`;
  return `v:${row}:${col + 1}`;
}

export function wallKeyFromMove(row, col, moveDirection) {
  if (moveDirection === "up") return wallKeyFromCell(row, col, "top");
  if (moveDirection === "down") return wallKeyFromCell(row, col, "bottom");
  if (moveDirection === "left") return wallKeyFromCell(row, col, "left");
  return wallKeyFromCell(row, col, "right");
}
