import { Vec3 } from './Vec3.js';

export class Viewport {
  constructor(container) {
    this.container = container;

    this.el = document.createElement('div');
    this.el.classList.add('db-viewport');

    this.camera = document.createElement('div');
    this.camera.classList.add('db-camera');

    this.cameraPosition = new Vec3(0, 0, 0);
    this.cameraRotation = new Vec3(-30, -40, 0);
    this.zoom = 1;

    this.el.appendChild(this.camera);
    this.container.appendChild(this.el);

    this.scenes = new Map();
    this.updateCamera();
  }

  addScene(scene) {
    this.scenes.set(scene.name, scene);
    this.camera.appendChild(scene.el);
    return this;
  }

  removeScene(name) {
    const scene = this.scenes.get(name);
    if (scene) {
      if (scene.el.parentNode === this.camera) {
        this.camera.removeChild(scene.el);
      }
      this.scenes.delete(name);
    }
    return this;
  }

  updateCamera() {
    const { x, y, z } = this.cameraPosition;
    const r = this.cameraRotation;
    const s = this.zoom;
    this.camera.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(${r.x}deg) rotateY(${r.y}deg) rotateZ(${r.z}deg) scale3d(${s}, ${s}, ${s})`;
    return this;
  }
}
