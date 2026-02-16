/**
 * Grid — a flat cols×rows grid of clickable cells laid horizontally in the scene.
 *
 * Each cell is a positioned div with data-col / data-row attributes.
 * The grid node is rotated 90° on X so it lies flat (same pattern as the ground in main.js).
 *
 * Use `cellToWorld(col, row)` to convert a cell position to 3D scene coordinates.
 */
import { Node } from '../engine/Node.js';

export class Grid extends Node {
  /**
   * @param {number} cols  Number of columns
   * @param {number} rows  Number of rows
   * @param {number} cellSize  Size of each cell in pixels
   */
  constructor(cols = 50, rows = 50, cellSize = 20) {
    super();

    this._cols = cols;
    this._rows = rows;
    this._cellSize = cellSize;

    const totalW = cols * cellSize;
    const totalH = rows * cellSize;

    // Lie flat on the ground plane (rotate 90° on X, same as ground in main.js)
    this.setRotation(90, 0, 0);

    // Keep preserve-3d (inherited from Node): the browser does per-cell
    // 3D hit-testing, which stays accurate at every camera angle.
    // ('flat' would flatten into a 2D box that misses cells near the horizon.)

    // Center the grid via negative margin
    this.el.style.width = `${totalW}px`;
    this.el.style.height = `${totalH}px`;
    this.el.style.marginLeft = `${-totalW / 2}px`;
    this.el.style.marginTop = `${-totalH / 2}px`;

    this._buildCells();
  }

  /**
   * Create all cell divs inside the grid element.
   */
  _buildCells() {
    for (let row = 0; row < this._rows; row++) {
      for (let col = 0; col < this._cols; col++) {
        const cell = document.createElement('div');
        cell.classList.add('db-grid-cell');
        cell.dataset.col = col;
        cell.dataset.row = row;
        cell.style.position = 'absolute';
        cell.style.width = `${this._cellSize}px`;
        cell.style.height = `${this._cellSize}px`;
        cell.style.left = `${col * this._cellSize}px`;
        cell.style.top = `${row * this._cellSize}px`;
        this.el.appendChild(cell);
      }
    }
  }

  /**
   * Convert a cell (col, row) to 3D world coordinates above the grid.
   *
   * The grid is centered at origin and rotated 90° on X, so:
   *   - col maps to X axis (left → right)
   *   - row maps to Z axis (front → back)
   *   - Y is set to half-cellSize above the grid (so a cube sits on the surface)
   *
   * @param {number} col
   * @param {number} row
   * @returns {{x: number, y: number, z: number}}
   */
  cellToWorld(col, row) {
    const totalW = this._cols * this._cellSize;
    const totalH = this._rows * this._cellSize;

    // Center of the cell in local 2D grid space, then offset to center the grid at origin
    const x = (col + 0.5) * this._cellSize - totalW / 2;
    const z = (row + 0.5) * this._cellSize - totalH / 2;
    // Place the cube so its bottom sits on the grid surface
    const y = -(this._cellSize / 2);

    return { x, y, z };
  }

  get cols() {
    return this._cols;
  }

  get rows() {
    return this._rows;
  }

  get cellSize() {
    return this._cellSize;
  }
}
