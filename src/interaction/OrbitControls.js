export class OrbitControls {
  constructor(viewport) {
    this.viewport = viewport;
    this._active = false;
    this._mode = null;
    this._startX = 0;
    this._startY = 0;
    this._startRotation = { x: 0, y: 0 };
    this._startPosition = { x: 0, y: 0 };
    this.rotateSensitivity = 0.4;
    this.panSensitivity = 1;
    this.zoomFactor = 1.1;

    this._enabled = false;
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onContextMenu = (e) => e.preventDefault();

    this.enable();
  }

  enable() {
    if (this._enabled) {
      return this;
    }
    this._enabled = true;
    const el = this.viewport.el;
    el.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
    el.addEventListener('wheel', this._onWheel, { passive: false });
    el.addEventListener('contextmenu', this._onContextMenu);
    return this;
  }

  disable() {
    if (!this._enabled) {
      return this;
    }
    this._enabled = false;
    const el = this.viewport.el;
    el.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
    el.removeEventListener('wheel', this._onWheel);
    el.removeEventListener('contextmenu', this._onContextMenu);
    return this;
  }

  destroy() {
    this.disable();
    this.viewport = null;
  }

  _onMouseDown(e) {
    this._active = true;
    this._startX = e.clientX;
    this._startY = e.clientY;

    if (e.button === 2) {
      this._mode = 'rotate';
      this._startRotation.x = this.viewport.cameraRotation.x;
      this._startRotation.y = this.viewport.cameraRotation.y;
    } else if (e.button === 0) {
      this._mode = 'pan';
      this._startPosition.x = this.viewport.cameraPosition.x;
      this._startPosition.y = this.viewport.cameraPosition.y;
    }
  }

  _onMouseMove(e) {
    if (!this._active) {
      return;
    }

    const dx = e.clientX - this._startX;
    const dy = e.clientY - this._startY;

    if (this._mode === 'rotate') {
      this.viewport.cameraRotation.x = this._startRotation.x - dy * this.rotateSensitivity;
      this.viewport.cameraRotation.y = this._startRotation.y + dx * this.rotateSensitivity;
      this.viewport.updateCamera();
    } else if (this._mode === 'pan') {
      this.viewport.cameraPosition.x = this._startPosition.x + dx * this.panSensitivity;
      this.viewport.cameraPosition.y = this._startPosition.y + dy * this.panSensitivity;
      this.viewport.updateCamera();
    }
  }

  _onMouseUp() {
    this._active = false;
    this._mode = null;
  }

  _onWheel(e) {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 / this.zoomFactor : this.zoomFactor;
    this.viewport.zoom = Math.max(0.1, Math.min(10, this.viewport.zoom * direction));
    this.viewport.updateCamera();
  }
}
