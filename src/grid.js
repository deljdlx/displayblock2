/**
 * grid.js — entry point for the Grid page.
 *
 * Creates a clickable grid. Clicking a cell spawns a cube on it.
 * Clicking a face of an existing cube spawns a new cube adjacent to that face.
 * Drag detection prevents accidental spawns while orbiting.
 */
import { Viewport } from './engine/Viewport.js';
import { Scene } from './engine/Scene.js';
import { OrbitControls } from './interaction/OrbitControls.js';
import { Grid } from './shapes/Grid.js';
import { Cube } from './shapes/Cube.js';
import './styles/main.css';
import './styles/toolbar.css';
import './styles/engine.css';

// --- Engine setup ---

const app = document.getElementById('app');
const viewport = new Viewport(app);
const scene = new Scene('grid');
viewport.addScene(scene);

// --- Grid ---

const COLS = 20;
const ROWS = 20;
const CELL_SIZE = 40;

const grid = new Grid(COLS, ROWS, CELL_SIZE);
scene.add(grid);

// --- Controls ---

new OrbitControls(viewport);

// --- Cube placement ---

/**
 * Direction offsets for each cube face.
 * Clicking a face spawns a new cube adjacent in that direction.
 *
 *   face     CSS 3D axis     world offset
 *   ─────    ───────────     ────────────
 *   right    +X              x + cellSize
 *   left     -X              x - cellSize
 *   top      -Y (up)         y - cellSize
 *   bottom   +Y (down)       y + cellSize
 *   front    +Z              z + cellSize
 *   back     -Z              z - cellSize
 */
const FACE_OFFSETS = {
  front:  { x:  0, y:  0, z:  1 },
  back:   { x:  0, y:  0, z: -1 },
  right:  { x:  1, y:  0, z:  0 },
  left:   { x: -1, y:  0, z:  0 },
  top:    { x:  0, y: -1, z:  0 },
  bottom: { x:  0, y:  1, z:  0 },
};

/** @type {Map<string, import('./shapes/Cube.js').Cube>} key "x,y,z" → cube */
const cubes = new Map();

/** Build a position key for the Map. */
function posKey(x, y, z) {
  return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
}

/**
 * Place a cube at the given world position (if not already occupied).
 *
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
function placeCube(x, y, z) {
  const key = posKey(x, y, z);
  if (cubes.has(key)) {
    return;
  }

  const cube = new Cube(CELL_SIZE);
  cube.setPosition(x, y, z);
  scene.add(cube);
  cubes.set(key, cube);
}

/**
 * Resolve which face name was clicked ("front", "back", etc.).
 *
 * @param {HTMLElement} target  The event target element
 * @returns {string|null}
 */
function resolveFace(target) {
  const faceEl = target.closest('.db-face');
  if (!faceEl) {
    return null;
  }
  for (const cls of faceEl.classList) {
    if (cls.startsWith('db-face--')) {
      return cls.slice('db-face--'.length);
    }
  }
  return null;
}

// Drag detection (same pattern as Picking: mousedown coords + 3px threshold)
let downX = 0;
let downY = 0;
const DRAG_THRESHOLD = 3;

viewport.el.addEventListener('mousedown', (e) => {
  downX = e.clientX;
  downY = e.clientY;
});

viewport.el.addEventListener('click', (e) => {
  // Ignore drags (user was orbiting)
  const dx = e.clientX - downX;
  const dy = e.clientY - downY;
  if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
    return;
  }

  // Case 1: clicked on a cube face → spawn adjacent cube
  const cubeEl = e.target.closest('.db-cuboid');
  if (cubeEl) {
    const face = resolveFace(e.target);
    const offset = face ? FACE_OFFSETS[face] : null;
    if (!offset) {
      return;
    }

    // Read the clicked cube's current position from the scene graph
    const node = scene.findById(cubeEl.dataset.nodeId);
    if (!node) {
      return;
    }

    placeCube(
      node.position.x + offset.x * CELL_SIZE,
      node.position.y + offset.y * CELL_SIZE,
      node.position.z + offset.z * CELL_SIZE,
    );
    return;
  }

  // Case 2: clicked on a grid cell → spawn the first cube
  const cell = e.target.closest('.db-grid-cell');
  if (!cell) {
    return;
  }

  const pos = grid.cellToWorld(Number(cell.dataset.col), Number(cell.dataset.row));
  placeCube(pos.x, pos.y, pos.z);
});
