import { Node } from './Node.js';

export class Group extends Node {
  constructor(name = '') {
    super();
    this.name = name;
    this.el.classList.add('db-group');
  }
}
