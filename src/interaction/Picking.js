/**
 * Picking — selects 3D nodes by clicking on their DOM faces.
 *
 * Uses event delegation on the viewport element. The browser resolves
 * which `.db-face` is under the cursor natively (CSS 3D = real DOM).
 * A drag vs. click is distinguished by mouse distance (< 3 px = click).
 *
 * Selection state:
 *   - click on unselected node  → select it (deselect previous if any)
 *   - click on already-selected → deselect it
 *   - click on empty space      → deselect current
 */
export class Picking {
  /**
   * @param {import('../engine/Viewport.js').Viewport} viewport
   * @param {import('../engine/Scene.js').Scene} scene
   */
  constructor(viewport, scene) {
    this._viewport = viewport;
    this._scene = scene;

    /** @type {import('../engine/Node.js').Node|null} */
    this._selected = null;

    // Track mousedown position to distinguish click from drag
    this._downX = 0;
    this._downY = 0;
    this._dragThreshold = 3; // px

    this._onMouseDown = (e) => {
      this._downX = e.clientX;
      this._downY = e.clientY;
    };
    this._onClick = (e) => this._handleClick(e);

    viewport.el.addEventListener('mousedown', this._onMouseDown, true);
    viewport.el.addEventListener('click', this._onClick);
  }

  /**
   * @param {MouseEvent} e
   */
  _handleClick(e) {
    // Ignore drags — user was orbiting the camera
    const dx = e.clientX - this._downX;
    const dy = e.clientY - this._downY;
    if (Math.hypot(dx, dy) > this._dragThreshold) {
      return;
    }

    // Walk up from the clicked face to find the owning node
    const nodeEl = e.target.closest('[data-node-id]');
    const node = nodeEl ? this._scene.findById(nodeEl.dataset.nodeId) : null;

    // Click in empty space → deselect
    if (!node) {
      this._deselect();
      return;
    }

    // Click on already-selected → toggle off
    if (node === this._selected) {
      this._deselect();
      return;
    }

    // Select new node (deselects previous if any)
    this._select(node, e.target);
  }

  /**
   * Resolve the face name from a clicked element (e.g. "front", "back").
   *
   * @param {HTMLElement} target
   * @returns {string|null}
   */
  _resolveFace(target) {
    const face = target.closest('.db-face');
    if (!face) {
      return null;
    }
    // class "db-face--front" → "front"
    for (const cls of face.classList) {
      if (cls.startsWith('db-face--')) {
        return cls.slice('db-face--'.length);
      }
    }
    return null;
  }

  /**
   * @param {import('../engine/Node.js').Node} node
   * @param {HTMLElement} target
   */
  _select(node, target) {
    // Deselect previous
    if (this._selected) {
      this._deselect();
    }

    this._selected = node;
    node.el.classList.add('db-selected');

    const face = this._resolveFace(target);
    node.emit('picked', { node, face });
  }

  _deselect() {
    if (!this._selected) {
      return;
    }
    const prev = this._selected;
    this._selected = null;
    prev.el.classList.remove('db-selected');
    prev.emit('unpicked', { node: prev });
  }

  /** Remove all listeners — clean shutdown. */
  destroy() {
    this._viewport.el.removeEventListener('mousedown', this._onMouseDown, true);
    this._viewport.el.removeEventListener('click', this._onClick);
    this._deselect();
    this._viewport = null;
    this._scene = null;
  }
}
