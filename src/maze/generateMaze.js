import { DIRECTIONS } from "../core/constants.js";

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createCell(row, col) {
  return {
    row,
    col,
    walls: { top: true, right: true, bottom: true, left: true }
  };
}

class DisjointSet {
  constructor(size) {
    this.parent = Array.from({ length: size }, (_, index) => index);
    this.rank = Array(size).fill(0);
  }

  find(value) {
    if (this.parent[value] !== value) {
      this.parent[value] = this.find(this.parent[value]);
    }
    return this.parent[value];
  }

  union(a, b) {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return false;

    if (this.rank[rootA] < this.rank[rootB]) {
      this.parent[rootA] = rootB;
    } else if (this.rank[rootA] > this.rank[rootB]) {
      this.parent[rootB] = rootA;
    } else {
      this.parent[rootB] = rootA;
      this.rank[rootA] += 1;
    }

    return true;
  }
}

function indexForCell(row, col, cols) {
  return row * cols + col;
}

function buildEdges(rows, cols) {
  const edges = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (col + 1 < cols) {
        edges.push({ row, col, nextRow: row, nextCol: col + 1, wall: "right", opposite: "left" });
      }
      if (row + 1 < rows) {
        edges.push({ row, col, nextRow: row + 1, nextCol: col, wall: "bottom", opposite: "top" });
      }
    }
  }

  return shuffle(edges);
}

export function generateMaze(rows, cols) {
  const maze = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => createCell(r, c))
  );

  const disjointSet = new DisjointSet(rows * cols);
  const edges = buildEdges(rows, cols);

  for (const edge of edges) {
    const currentIndex = indexForCell(edge.row, edge.col, cols);
    const nextIndex = indexForCell(edge.nextRow, edge.nextCol, cols);
    if (!disjointSet.union(currentIndex, nextIndex)) continue;

    maze[edge.row][edge.col].walls[edge.wall] = false;
    maze[edge.nextRow][edge.nextCol].walls[edge.opposite] = false;
  }

  return maze;
}
