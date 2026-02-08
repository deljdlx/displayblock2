import { Node } from '../engine/Node.js';

const AXES = [
  { axis: 'x', color: '#ff3333', rotateY: 0, rotateZ: 0 },
  { axis: 'y', color: '#33ff33', rotateY: 0, rotateZ: 90 },
  { axis: 'z', color: '#3366ff', rotateY: 90, rotateZ: 0 },
];

const TICK_SIZE = 8;
const LABEL_OFFSET = 14;

export class AxisHelper extends Node {
  constructor(length = 300, thickness = 2, step = 100) {
    super();
    this.el.classList.add('db-axis-helper');

    this._build(length, thickness, step);
    this.hide();
  }

  _build(length, thickness, step) {
    for (const def of AXES) {
      const group = document.createElement('div');
      group.style.position = 'absolute';
      group.style.transformStyle = 'preserve-3d';
      group.style.transformOrigin = '0 0';
      group.style.transform = `rotateY(${def.rotateY}deg) rotateZ(${def.rotateZ}deg)`;

      // Main line (full span: -length to +length)
      const line = document.createElement('div');
      line.className = `db-axis db-axis--${def.axis}`;
      line.style.position = 'absolute';
      line.style.width = `${length * 2}px`;
      line.style.height = `${thickness}px`;
      line.style.left = `${-length}px`;
      line.style.top = `${-thickness / 2}px`;
      line.style.background = def.color;
      line.style.opacity = '0.7';
      line.style.boxShadow = `0 0 6px ${def.color}`;
      group.appendChild(line);

      // Ticks + labels (negative and positive)
      for (let d = step; d <= length; d += step) {
        group.appendChild(this._createTick(d, def.color));
        group.appendChild(this._createLabel(d, `${d}`, def.color));
        group.appendChild(this._createTick(-d, def.color));
        group.appendChild(this._createLabel(-d, `${-d}`, def.color));
      }

      this.el.appendChild(group);
    }
  }

  _createTick(offset, color) {
    const tick = document.createElement('div');
    tick.style.position = 'absolute';
    tick.style.width = '1px';
    tick.style.height = `${TICK_SIZE}px`;
    tick.style.background = color;
    tick.style.opacity = '0.6';
    tick.style.left = `${offset}px`;
    tick.style.top = `${-TICK_SIZE / 2}px`;
    return tick;
  }

  _createLabel(offset, text, color) {
    const label = document.createElement('div');
    label.textContent = text;
    label.style.position = 'absolute';
    label.style.left = `${offset}px`;
    label.style.top = `${LABEL_OFFSET}px`;
    label.style.transform = 'translateX(-50%)';
    label.style.color = color;
    label.style.fontSize = '9px';
    label.style.fontFamily = 'monospace';
    label.style.opacity = '0.6';
    label.style.whiteSpace = 'nowrap';
    label.style.pointerEvents = 'none';
    return label;
  }
}
