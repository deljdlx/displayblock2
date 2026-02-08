/**
 * Global event bus — singleton EventEmitter for cross-cutting events
 * like `physics:start` and `physics:stop`.
 */
import { EventEmitter } from './EventEmitter.js';

export const bus = new EventEmitter();
