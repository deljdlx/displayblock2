import { Cuboid } from './Cuboid.js';

export class Cube extends Cuboid {
  constructor(size = 40) {
    super(size, size, size);
  }

  setSize(size) {
    return super.setSize(size, size, size);
  }
}
