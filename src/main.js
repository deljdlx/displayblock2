import { Viewport } from './engine/Viewport.js';
import { Scene } from './engine/Scene.js';
import { Group } from './engine/Group.js';
import { Cube } from './shapes/Cube.js';
import { OrbitControls } from './interaction/OrbitControls.js';
import { Link } from './shapes/Link.js';
import { AxisHelper } from './helpers/AxisHelper.js';
import './styles/main.css';
import './styles/toolbar.css';
import './styles/engine.css';

const app = document.getElementById('app');

// Engine setup
const viewport = new Viewport(app);
const scene = new Scene('main');
viewport.addScene(scene);

// Cube group
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

// Links from center cube to all others
const centerEntry = cubes.find(({ ox, oy, oz }) => ox === 0 && oy === 0 && oz === 0);
const links = [];
let linksVisible = false;

for (const { cube } of cubes) {
  if (cube === centerEntry.cube) {
    continue;
  }
  const link = new Link(centerEntry.cube, cube);
  link.hide();
  cubeGroup.add(link);
  links.push(link);
}

const btnLinks = document.getElementById('btn-links');
btnLinks.addEventListener('click', () => {
  linksVisible = !linksVisible;
  for (const link of links) {
    if (linksVisible) {
      link.show();
    } else {
      link.hide();
    }
  }
  btnLinks.classList.toggle('active');
});

// Axis helper
const axisHelper = new AxisHelper(300);
scene.add(axisHelper);

const btnAxes = document.getElementById('btn-axes');
btnAxes.addEventListener('click', () => {
  axisHelper.toggle();
  btnAxes.classList.toggle('active');
});

// Explode / Implode
const EXPLODE_FACTOR = 2.5;
let exploded = false;

const btnExplode = document.getElementById('btn-explode');
btnExplode.addEventListener('click', () => {
  exploded = !exploded;
  const f = exploded ? EXPLODE_FACTOR : 1;
  for (const { cube, ox, oy, oz } of cubes) {
    cube.animateTo(ox * f, oy * f, oz * f, 0.5);
  }
  btnExplode.classList.toggle('active');
  btnExplode.textContent = exploded ? 'Implode' : 'Explode';
});

// Spin (individual cubes)
let spinning = false;
const btnSpin = document.getElementById('btn-spin');
btnSpin.addEventListener('click', () => {
  if (spinning) {
    return;
  }
  spinning = true;
  btnSpin.classList.add('active');

  let done = 0;
  for (const { cube } of cubes) {
    cube.animateRotation(0, 360, 0, 1);
    cube.onTransitionEnd(() => {
      cube.clearTransition();
      cube.setRotation(0, 0, 0);
      done++;
      if (done === cubes.length) {
        spinning = false;
        btnSpin.classList.remove('active');
      }
    });
  }
});

// Group spin (whole group rotates as a unit)
let groupSpinning = false;
const btnGroupSpin = document.getElementById('btn-group-spin');
btnGroupSpin.addEventListener('click', () => {
  if (groupSpinning) {
    return;
  }
  groupSpinning = true;
  btnGroupSpin.classList.add('active');

  cubeGroup.animateRotation(0, 360, 0, 1.5);
  cubeGroup.onTransitionEnd(() => {
    cubeGroup.clearTransition();
    cubeGroup.setRotation(0, 0, 0);
    groupSpinning = false;
    btnGroupSpin.classList.remove('active');
  });
});

// Orbit controls
new OrbitControls(viewport);
