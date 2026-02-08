import { Viewport } from './engine/Viewport.js';
import { Scene } from './engine/Scene.js';
import { Group } from './engine/Group.js';
import { Node } from './engine/Node.js';
import { Physics } from './engine/Physics.js';
import { physicsConfig } from './config/physics.js';
import { Cube } from './shapes/Cube.js';
import { Link } from './shapes/Link.js';
import { OrbitControls } from './interaction/OrbitControls.js';
import { AxisHelper } from './helpers/AxisHelper.js';
import './styles/main.css';
import './styles/toolbar.css';
import './styles/engine.css';

// --- Engine setup ---

const app = document.getElementById('app');
const viewport = new Viewport(app);
const scene = new Scene('main');
viewport.addScene(scene);

// --- Cube group ---

const cubeGroup = new Group('cubes');
scene.add(cubeGroup);

const size = 40;
const gap = 10;
const grid = 3;
const half = ((grid - 1) * (size + gap)) / 2;
const cubes = [];

for (let x = 0; x < grid; x++) {
  for (let y = 0; y < grid; y++) {
    for (let z = 0; z < grid; z++) {
      const cube = new Cube(size);
      const ox = x * (size + gap) - half;
      const oy = y * (size + gap) - half;
      const oz = z * (size + gap) - half;
      cube.setPosition(ox, oy, oz);
      cubeGroup.add(cube);
      cubes.push({ cube, ox, oy, oz });
    }
  }
}

// --- Links ---

const centerEntry = cubes.find(({ ox, oy, oz }) => ox === 0 && oy === 0 && oz === 0);
const links = [];

for (const { cube } of cubes) {
  if (cube === centerEntry.cube) {
    continue;
  }
  const link = new Link(centerEntry.cube, cube);
  link.hide();
  cubeGroup.add(link);
  links.push(link);
}

// --- Physics ---

const physics = new Physics();
physics.addGround(physicsConfig.groundY);

const halfExtent = size / 2;
for (const { cube } of cubes) {
  physics.addBox(cube, { mass: 1, halfExtent });
}

const ground = new Node();
ground.el.classList.add('db-ground');
ground.el.style.width = `${physicsConfig.groundSize}px`;
ground.el.style.height = `${physicsConfig.groundSize}px`;
ground.el.style.marginLeft = `${-physicsConfig.groundSize / 2}px`;
ground.el.style.marginTop = `${-physicsConfig.groundSize / 2}px`;
ground.setPosition(0, physicsConfig.groundY, 0);
ground.setRotation(90, 0, 0);
ground.hide();
scene.add(ground);

// --- Axis helper ---

const axisHelper = new AxisHelper(300);
axisHelper.hide();
scene.add(axisHelper);

// --- Explode state ---

const EXPLODE_FACTOR = 2.5;
const SCALE_FACTOR = 2;
let exploded = false;
let scaled = false;

// --- Toolbar bindings ---

document.getElementById('btn-axes').addEventListener('click', (e) => {
  axisHelper.toggle();
  e.currentTarget.classList.toggle('active');
});

document.getElementById('btn-links').addEventListener('click', (e) => {
  for (const link of links) {
    link.toggle();
  }
  e.currentTarget.classList.toggle('active');
});

document.getElementById('btn-explode').addEventListener('click', (e) => {
  if (physics.running) {
    return;
  }
  exploded = !exploded;
  const f = exploded ? EXPLODE_FACTOR : 1;
  for (const { cube, ox, oy, oz } of cubes) {
    cube.animateTo(ox * f, oy * f, oz * f, 0.5);
  }
  e.currentTarget.classList.toggle('active');
  e.currentTarget.textContent = exploded ? 'Implode' : 'Explode';
});

let spinning = false;
document.getElementById('btn-spin').addEventListener('click', (e) => {
  if (spinning || physics.running) {
    return;
  }
  spinning = true;
  e.currentTarget.classList.add('active');
  const btn = e.currentTarget;

  let done = 0;
  for (const { cube } of cubes) {
    cube.animateRotation(0, 360, 0, 1);
    cube.onTransitionEnd(() => {
      cube.clearTransition();
      cube.setRotation(0, 0, 0);
      done++;
      if (done === cubes.length) {
        spinning = false;
        btn.classList.remove('active');
      }
    });
  }
});

let groupSpinning = false;
document.getElementById('btn-group-spin').addEventListener('click', (e) => {
  if (groupSpinning || physics.running) {
    return;
  }
  groupSpinning = true;
  const btn = e.currentTarget;
  btn.classList.add('active');

  cubeGroup.animateRotation(0, 360, 0, 1.5);
  cubeGroup.onTransitionEnd(() => {
    cubeGroup.clearTransition();
    cubeGroup.setRotation(0, 0, 0);
    groupSpinning = false;
    btn.classList.remove('active');
  });
});

document.getElementById('btn-scale').addEventListener('click', (e) => {
  if (physics.running) {
    return;
  }
  scaled = !scaled;
  const s = scaled ? size * SCALE_FACTOR : size;
  for (const { cube } of cubes) {
    cube.animateSize(s, s, s, 0.5);
  }
  physics.resizeBoxes(s / 2);
  e.currentTarget.classList.toggle('active');
  e.currentTarget.textContent = scaled ? 'Shrink' : 'Scale';
});

document.getElementById('btn-physics').addEventListener('click', (e) => {
  if (physics.running) {
    physics.stop();
    ground.hide();
    e.currentTarget.classList.remove('active');
    const f = exploded ? EXPLODE_FACTOR : 1;
    for (const { cube, ox, oy, oz } of cubes) {
      cube.setRotation(0, 0, 0);
      cube.animateTo(ox * f, oy * f, oz * f, 0.8);
    }
  } else {
    for (const { cube } of cubes) {
      cube.clearTransition();
    }
    ground.show();
    physics.start();
    e.currentTarget.classList.add('active');
  }
});

// --- Controls ---

new OrbitControls(viewport);
