import { Node } from '../engine/Node.js';

const RAD2DEG = 180 / Math.PI;

export class Link extends Node {
  constructor(from, to, thickness = 1) {
    super();
    this.from = from;
    this.to = to;
    this.thickness = thickness;
    this.el.classList.add('db-link');
    this.el.style.height = `${thickness}px`;
    this.el.style.transformOrigin = '0 50%';
    this.el.style.pointerEvents = 'none';

    this._onEndpointMove = () => this.update();
    this.from.onMove(this._onEndpointMove);
    this.to.onMove(this._onEndpointMove);

    this.update();
  }

  update() {
    const ax = this.from.position.x;
    const ay = this.from.position.y;
    const az = this.from.position.z;
    const dx = this.to.position.x - ax;
    const dy = this.to.position.y - ay;
    const dz = this.to.position.z - az;

    const lenXY = Math.sqrt(dx * dx + dy * dy);
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const rz = Math.atan2(dy, dx) * RAD2DEG;
    const ry = -Math.atan2(dz, lenXY) * RAD2DEG;

    // Sync transition with endpoints for smooth animation (transform + width)
    const src = this.from.el.style.transition || this.to.el.style.transition;
    this.el.style.transition = src ? `${src}, ${src.replace('transform', 'width')}` : '';

    this.el.style.width = `${length}px`;
    this.el.style.transform =
      `translate3d(${ax}px, ${ay}px, ${az}px) rotateZ(${rz}deg) rotateY(${ry}deg)`;

    return this;
  }

  dispose() {
    this.from.offMove(this._onEndpointMove);
    this.to.offMove(this._onEndpointMove);
    this.from = null;
    this.to = null;
    return this;
  }
}
