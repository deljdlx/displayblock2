import { Vec3 } from './Vec3.js';

let _uid = 0;

export class Node {
  constructor() {
    this.id = `node-${++_uid}`;
    this.position = new Vec3();
    this.rotation = new Vec3();
    this.el = document.createElement('div');
    this.el.style.position = 'absolute';
    this.el.style.transformStyle = 'preserve-3d';
    this.children = [];
    this.parent = null;
  }

  add(child) {
    if (child.parent) {
      child.parent.remove(child);
    }
    child.parent = this;
    this.children.push(child);
    this.el.appendChild(child.el);
    return this;
  }

  remove(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parent = null;
      if (child.el.parentNode === this.el) {
        this.el.removeChild(child.el);
      }
    }
    return this;
  }

  updateTransform() {
    const { x, y, z } = this.position;
    const r = this.rotation;
    this.el.style.transform =
      `translate3d(${x}px, ${y}px, ${z}px) rotateX(${r.x}deg) rotateY(${r.y}deg) rotateZ(${r.z}deg)`;
    return this;
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z);
    return this.updateTransform();
  }

  setRotation(x, y, z) {
    this.rotation.set(x, y, z);
    return this.updateTransform();
  }
}
