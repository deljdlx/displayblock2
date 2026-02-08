export class Scene {
  constructor(name = 'default') {
    this.name = name;
    this.el = document.createElement('div');
    this.el.className = 'db-scene';
    this.el.style.position = 'absolute';
    this.el.style.left = '50%';
    this.el.style.top = '50%';
    this.el.style.transformStyle = 'preserve-3d';
    this.items = new Map();
  }

  add(item) {
    this.items.set(item.id, item);
    this.el.appendChild(item.el);
    return this;
  }

  remove(item) {
    if (this.items.has(item.id)) {
      this.items.delete(item.id);
      if (item.el.parentNode === this.el) {
        this.el.removeChild(item.el);
      }
    }
    return this;
  }

  clear() {
    this.items.forEach((item) => this.remove(item));
    return this;
  }
}
