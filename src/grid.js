/**
 * grid.js — entry point for the Grid page.
 *
 * Creates a clickable grid. Clicking a cell spawns a cube on it.
 * Clicking a face of an existing cube spawns a new cube adjacent to that face.
 * Right-clicking a cube removes it.
 * Drag detection prevents accidental spawns/removals while orbiting.
 */
import { Viewport } from './engine/Viewport.js';
import { Scene } from './engine/Scene.js';
import { OrbitControls } from './interaction/OrbitControls.js';
import { SwatchDragHandler } from './interaction/SwatchDragHandler.js';
import { Grid } from './shapes/Grid.js';
import { Cube } from './shapes/Cube.js';
import { MaterialPalette } from './ui/MaterialPalette.js';
import { LocalStorageAdapter } from './storage/LocalStorageAdapter.js';
import { GridSerializer } from './storage/GridSerializer.js';
import { SaveLoadBar } from './ui/SaveLoadBar.js';
import './styles/main.css';
import './styles/toolbar.css';
import './styles/engine.css';
import './styles/materials.css';
import './styles/palette.css';
import './styles/saveload.css';

// --- Engine setup ---

const app = document.getElementById('app');
const viewport = new Viewport(app);
const scene = new Scene('grid');
viewport.addScene(scene);

// --- Materials ---

/**
 * Available materials. Each entry maps an id to a preview color
 * displayed on the toolbar button swatch.
 */
const MATERIALS = [
  { id: 'glass',    label: 'Glass',    color: 'rgba(0, 255, 255, 0.3)' },
  { id: 'stone',    label: 'Stone',    color: 'rgba(120, 120, 130, 0.85)' },
  { id: 'dirt',     label: 'Dirt',     color: 'rgba(120, 80, 50, 0.85)' },
  { id: 'wood',     label: 'Wood',     color: 'rgba(160, 110, 60, 0.85)' },
  { id: 'water',    label: 'Water',    color: 'rgba(30, 100, 220, 0.45)' },
  { id: 'lava',     label: 'Lava',     color: 'rgba(220, 60, 20, 0.85)' },
  { id: 'sand',     label: 'Sand',     color: 'rgba(210, 190, 140, 0.85)' },
  { id: 'ice',      label: 'Ice',      color: 'rgba(180, 220, 255, 0.5)' },
  { id: 'gold',     label: 'Gold',     color: 'rgba(255, 200, 50, 0.85)' },
  { id: 'obsidian', label: 'Obsidian', color: 'rgba(20, 15, 30, 0.92)' },
  { id: 'brick',    label: 'Brick',    color: 'rgba(160, 60, 50, 0.85)' },
  { id: 'snow',     label: 'Snow',     color: 'rgba(240, 245, 255, 0.9)' },
];

let currentMaterial = 'glass';

// --- Material palette (floating panel) ---

const palette = new MaterialPalette(MATERIALS);
palette.select(currentMaterial);

palette.onSelect = (materialId) => {
  currentMaterial = materialId;
};

const dragHandler = new SwatchDragHandler(palette.swatchContainer);

dragHandler.onSelect = (materialId) => {
  currentMaterial = materialId;
  palette.select(materialId);
};

dragHandler.onDropOnCube = (cubeEl, materialId) => {
  const node = scene.findById(cubeEl.dataset.nodeId);
  if (node) {
    node.setMaterial(materialId);
    scheduleAutoSave();
  }
};

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

// --- Persistence setup (must be before placeCube which calls scheduleAutoSave) ---

const storage = new LocalStorageAdapter();

/** Timer id for the debounced auto-save. */
let autoSaveTimer = null;

/** Build a position key for the Map. */
function posKey(x, y, z) {
  return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
}

/**
 * Place a cube at the given world position with an explicit material.
 * Does nothing if the position is already occupied.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {string} material  Material id (e.g. 'glass', 'stone')
 */
function placeCubeWithMaterial(x, y, z, material) {
  const key = posKey(x, y, z);
  if (cubes.has(key)) {
    return;
  }

  const cube = new Cube(CELL_SIZE);
  cube.setMaterial(material);
  cube.setPosition(x, y, z);
  scene.add(cube);
  cubes.set(key, cube);
}

/**
 * Place a cube at the given world position using the current material.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
function placeCube(x, y, z) {
  placeCubeWithMaterial(x, y, z, currentMaterial);
  scheduleAutoSave();
}

/**
 * Remove a cube identified by its scene node.
 *
 * @param {import('./engine/Node.js').Node} node
 */
function removeCube(node) {
  const key = posKey(node.position.x, node.position.y, node.position.z);
  scene.remove(node);
  cubes.delete(key);
  scheduleAutoSave();
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

// --- Right-click to remove a cube ---

viewport.el.addEventListener('contextmenu', (e) => {
  const cubeEl = e.target.closest('.db-cuboid');
  if (!cubeEl) {
    return;
  }

  // Ignore drags (user was rotating the camera)
  const dx = e.clientX - downX;
  const dy = e.clientY - downY;
  if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
    return;
  }

  e.preventDefault();

  const node = scene.findById(cubeEl.dataset.nodeId);
  if (node) {
    removeCube(node);
  }
});

// --- Persistence (save/load UI + wiring) ---

const saveLoadBar = new SaveLoadBar();

/** Currently active slot name. */
let activeSlot = 'autosave';

/**
 * Serialize the current cubes Map into the save format.
 *
 * @returns {{ version: number, cubes: Array<{x: number, y: number, z: number, material: string}> }}
 */
function serializeCubes() {
  return GridSerializer.serialize(cubes);
}

/**
 * Clear the grid and restore cubes from deserialized data.
 *
 * @param {object} data  Raw save data (passed to GridSerializer.deserialize)
 */
function loadCubes(data) {
  // Remove all existing cubes
  for (const node of cubes.values()) {
    scene.remove(node);
  }
  cubes.clear();

  // Recreate cubes from save data
  const entries = GridSerializer.deserialize(data);
  for (const entry of entries) {
    placeCubeWithMaterial(entry.x, entry.y, entry.z, entry.material);
  }
}

/**
 * Schedule an auto-save to the "autosave" slot after a 1-second debounce.
 */
function scheduleAutoSave() {
  if (autoSaveTimer !== null) {
    clearTimeout(autoSaveTimer);
  }
  autoSaveTimer = setTimeout(async () => {
    autoSaveTimer = null;
    await storage.save('autosave', serializeCubes());
  }, 1000);
}

/**
 * Refresh the slot dropdown from storage and select the given slot.
 *
 * @param {string} selectSlot  Slot name to mark as selected
 */
async function refreshSlotList(selectSlot) {
  const slots = await storage.listSlots();
  // Always include "autosave" even if no saves exist yet
  if (!slots.includes('autosave')) {
    slots.unshift('autosave');
  }
  activeSlot = selectSlot;
  saveLoadBar.updateSlots(slots, selectSlot);
}

// --- Wire SaveLoadBar callbacks ---

saveLoadBar.onSave = async (slotName) => {
  await storage.save(slotName, serializeCubes());
  saveLoadBar.showFeedback(`Saved to "${slotName}"`);
};

saveLoadBar.onLoad = async (slotName) => {
  const data = await storage.load(slotName);
  if (!data) {
    saveLoadBar.showFeedback(`Slot "${slotName}" is empty`);
    return;
  }
  loadCubes(data);
  activeSlot = slotName;
  saveLoadBar.showFeedback(`Loaded "${slotName}"`);
};

saveLoadBar.onDelete = async (slotName) => {
  await storage.delete(slotName);
  saveLoadBar.showFeedback(`Deleted "${slotName}"`);
  await refreshSlotList('autosave');
};

saveLoadBar.onNewSlot = async (slotName) => {
  await storage.save(slotName, serializeCubes());
  await refreshSlotList(slotName);
  saveLoadBar.showFeedback(`Created "${slotName}"`);
};

// --- Startup: populate the slot dropdown ---

refreshSlotList('autosave');
