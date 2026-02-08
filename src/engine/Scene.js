import { Node } from './Node.js';

export class Scene extends Node {
  constructor(name = 'default') {
    super();
    this.name = name;
    this.el.classList.add('db-scene');
    this.el.style.left = '50%';
    this.el.style.top = '50%';
    this.items = new Map();
  }

  add(child) {
    this.items.set(child.id, child);
    super.add(child);
    return this;
  }

  remove(child) {
    this.items.delete(child.id);
    super.remove(child);
    return this;
  }

  clear() {
    const snapshot = [...this.items.values()];
    for (const item of snapshot) {
      this.remove(item);
    }
    return this;
  }
}
