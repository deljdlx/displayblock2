import { Vec3 } from './Vec3.js';

let _uid = 0;

export class Node {
  constructor() {
    this.id = `node-${++_uid}`;
    this.position = new Vec3();
    this.rotation = new Vec3();
    this.visible = true;
    this.el = document.createElement('div');
    this.el.style.position = 'absolute';
    this.el.style.transformStyle = 'preserve-3d';
    this.children = [];
    this.parent = null;
    this._moveListeners = [];
  }

  // --- Hierarchy ---

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

  // --- Transform ---

  updateTransform() {
    const { x, y, z } = this.position;
    const r = this.rotation;
    this.el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(${r.x}deg) rotateY(${r.y}deg) rotateZ(${r.z}deg)`;
    return this;
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z);
    this.updateTransform();
    this._emitMove();
    return this;
  }

  setRotation(x, y, z) {
    this.rotation.set(x, y, z);
    this.updateTransform();
    return this;
  }

  // --- Animation ---

  animateTo(x, y, z, duration = 0.5) {
    this.el.style.transition = `transform ${duration}s ease-out`;
    this.setPosition(x, y, z);
    return this;
  }

  animateRotation(x, y, z, duration = 0.5) {
    this.el.style.transition = `transform ${duration}s ease-in-out`;
    this.setRotation(x, y, z);
    return this;
  }

  onTransitionEnd(fn) {
    const handler = (e) => {
      if (e.target !== this.el) {
        return;
      }
      this.el.removeEventListener('transitionend', handler);
      fn(e);
    };
    this.el.addEventListener('transitionend', handler);
    return this;
  }

  clearTransition() {
    this.el.style.transition = '';
    return this;
  }

  // --- Visibility ---

  show() {
    this.el.style.display = '';
    this.visible = true;
    return this;
  }

  hide() {
    this.el.style.display = 'none';
    this.visible = false;
    return this;
  }

  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
    return this;
  }

  // --- Move observers ---

  onMove(fn) {
    this._moveListeners.push(fn);
    return this;
  }

  offMove(fn) {
    const idx = this._moveListeners.indexOf(fn);
    if (idx !== -1) {
      this._moveListeners.splice(idx, 1);
    }
    return this;
  }

  _emitMove() {
    for (const fn of this._moveListeners) {
      fn(this);
    }
  }
}
