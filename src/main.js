import { Viewport } from './engine/Viewport.js';
import { Scene } from './engine/Scene.js';
import { Cube } from './shapes/Cube.js';
import { OrbitControls } from './interaction/OrbitControls.js';
import { AxisHelper } from './helpers/AxisHelper.js';
import './styles/main.css';
import './styles/toolbar.css';
import './styles/engine.css';

const app = document.getElementById('app');

// Engine setup
const viewport = new Viewport(app);
const scene = new Scene('main');
viewport.addScene(scene);

// 3x3x3 cube grid
const size = 40;
const gap = 10;
const grid = 3;
const offset = ((grid - 1) * (size + gap)) / 2;

for (let x = 0; x < grid; x++) {
  for (let y = 0; y < grid; y++) {
    for (let z = 0; z < grid; z++) {
      const cube = new Cube(size);
      cube.setPosition(
        x * (size + gap) - offset,
        y * (size + gap) - offset,
        z * (size + gap) - offset,
      );
      scene.add(cube);
    }
  }
}

// Axis helper
const axisHelper = new AxisHelper(300);
scene.el.appendChild(axisHelper.el);

const btnAxes = document.getElementById('btn-axes');
btnAxes.addEventListener('click', () => {
  axisHelper.toggle();
  btnAxes.classList.toggle('active');
});

// Orbit controls
new OrbitControls(viewport);
