/**
 * Node — base building block of the 3D scene graph.
 *
 * Extends EventEmitter so every node can emit its own events:
 *   - `moved`          after setPosition / animateTo
 *   - `rotated`        after setRotation / animateRotation
 *   - `visibility`     after show / hide
 *   - `child:added`    when a child is added   (data: { child })
 *   - `child:removed`  when a child is removed (data: { child })
 *   - `added`          emitted on the child itself when added to a parent
 *   - `removed`        emitted on the child itself when removed from a parent
 */
import { Vec3 } from './Vec3.js';
import { EventEmitter } from './EventEmitter.js';

let _uid = 0;

export class Node extends EventEmitter {
  constructor() {
    super();
    this.id = `node-${++_uid}`;
    this.position = new Vec3();
    this.rotation = new Vec3();
    this.visible = true;
    this.el = document.createElement('div');
    this.el.dataset.nodeId = this.id;
    this.el.style.position = 'absolute';
    this.el.style.transformStyle = 'preserve-3d';
    this.children = [];
    this.parent = null;
  }

  // --- Hierarchy ---

  add(child) {
    if (child.parent) {
      child.parent.remove(child);
    }
    child.parent = this;
    this.children.push(child);
    this.el.appendChild(child.el);
    this.emit('child:added', { child });
    child.emit('added', { parent: this });
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
      this.emit('child:removed', { child });
      child.emit('removed', { parent: this });
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
    this.emit('moved', { node: this });
    return this;
  }

  setRotation(x, y, z) {
    this.rotation.set(x, y, z);
    this.updateTransform();
    this.emit('rotated', { node: this });
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
    this.emit('visibility', { node: this, visible: true });
    return this;
  }

  hide() {
    this.el.style.display = 'none';
    this.visible = false;
    this.emit('visibility', { node: this, visible: false });
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

  // --- Deprecated aliases (use on('moved', fn) / off('moved', fn) instead) ---

  /** @deprecated Use `this.on('moved', fn)` */
  onMove(fn) {
    return this.on('moved', fn);
  }

  /** @deprecated Use `this.off('moved', fn)` */
  offMove(fn) {
    return this.off('moved', fn);
  }
}
