import { Node } from '../engine/Node.js';

const FACE_NAMES = ['front', 'back', 'right', 'left', 'top', 'bottom'];

export class Cuboid extends Node {
  constructor(width = 40, height = 40, depth = 40) {
    super();
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.el.classList.add('db-cuboid');
    this.faces = {};
    this._buildFaces();
  }

  _buildFaces() {
    for (const name of FACE_NAMES) {
      const face = document.createElement('div');
      face.className = `db-face db-face--${name}`;
      face.style.position = 'absolute';
      face.style.backfaceVisibility = 'visible';
      this.faces[name] = face;
      this.el.appendChild(face);
    }
    this._layoutFaces();
  }

  _layoutFaces() {
    const { width: w, height: h, depth: d } = this;
    const hw = w / 2;
    const hh = h / 2;
    const hd = d / 2;

    // Front → faces +Z
    this._applyFace('front', w, h, `translate(-50%, -50%) translateZ(${hd}px)`);
    // Back → faces -Z
    this._applyFace('back', w, h, `translate(-50%, -50%) rotateY(180deg) translateZ(${hd}px)`);
    // Right → faces +X
    this._applyFace('right', d, h, `translate(-50%, -50%) rotateY(90deg) translateZ(${hw}px)`);
    // Left → faces -X
    this._applyFace('left', d, h, `translate(-50%, -50%) rotateY(-90deg) translateZ(${hw}px)`);
    // Top → faces -Y
    this._applyFace('top', w, d, `translate(-50%, -50%) rotateX(90deg) translateZ(${hh}px)`);
    // Bottom → faces +Y
    this._applyFace('bottom', w, d, `translate(-50%, -50%) rotateX(-90deg) translateZ(${hh}px)`);
  }

  _applyFace(name, w, h, transform) {
    const face = this.faces[name];
    face.style.width = `${w}px`;
    face.style.height = `${h}px`;
    face.style.transform = transform;
  }

  setSize(width, height, depth) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this._layoutFaces();
    return this;
  }

  setColor(color) {
    for (const name of FACE_NAMES) {
      this.faces[name].style.background = color;
    }
    return this;
  }

  setFaceColor(name, color) {
    if (this.faces[name]) {
      this.faces[name].style.background = color;
    }
    return this;
  }
}
