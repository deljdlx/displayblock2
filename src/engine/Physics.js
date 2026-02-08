import { World, Body, Box, Vec3 as CVec3, NaiveBroadphase } from 'cannon-es';
import { physicsConfig as defaults } from '../config/physics.js';
import { bus } from './bus.js';

const RAD2DEG = 180 / Math.PI;

export class Physics {
  constructor(config = {}) {
    const cfg = { ...defaults, ...config };
    this._timeStep = cfg.timeStep;
    this._maxSubSteps = cfg.maxSubSteps;

    this.world = new World();
    this.world.gravity.set(0, cfg.gravity, 0);
    this.world.broadphase = new NaiveBroadphase();
    this.world.defaultContactMaterial.restitution = cfg.restitution;
    this.world.defaultContactMaterial.friction = cfg.friction;
    this.world.solver.iterations = cfg.solverIterations;
    this.world.allowSleep = cfg.allowSleep;

    this._linearDamping = cfg.linearDamping;
    this._angularDamping = cfg.angularDamping;
    this._sleepSpeedLimit = cfg.sleepSpeedLimit;
    this._sleepTimeLimit = cfg.sleepTimeLimit;

    this._pairs = [];
    this._running = false;
    this._rafId = null;
    this._lastTime = 0;
    this._euler = new CVec3();
  }

  addGround(y, size = 1000) {
    const body = new Body({ mass: 0 });
    body.addShape(new Box(new CVec3(size, 1, size)));
    body.position.set(0, y + 1, 0);
    this.world.addBody(body);
    return body;
  }

  addBox(node, { mass = defaults.defaultMass, halfExtent = 20 } = {}) {
    const body = new Body({
      mass,
      linearDamping: this._linearDamping,
      angularDamping: this._angularDamping,
      allowSleep: true,
      sleepSpeedLimit: this._sleepSpeedLimit,
      sleepTimeLimit: this._sleepTimeLimit,
    });
    body.addShape(new Box(new CVec3(halfExtent, halfExtent, halfExtent)));
    this.world.addBody(body);
    this._pairs.push({ node, body });
    return body;
  }

  resizeBoxes(halfExtent) {
    for (const { body } of this._pairs) {
      const shape = body.shapes[0];
      if (shape instanceof Box) {
        shape.halfExtents.set(halfExtent, halfExtent, halfExtent);
        shape.updateConvexPolyhedronRepresentation();
        shape.updateBoundingSphereRadius();
        body.updateBoundingRadius();
      }
    }
  }

  start() {
    if (this._running) {
      return;
    }
    for (const { node, body } of this._pairs) {
      body.position.set(node.position.x, node.position.y, node.position.z);
      body.velocity.setZero();
      body.angularVelocity.setZero();
      body.quaternion.set(0, 0, 0, 1);
      body.wakeUp();
    }
    this._running = true;
    this._lastTime = performance.now();
    this._tick();
    bus.emit('physics:start');
  }

  stop() {
    this._running = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    bus.emit('physics:stop');
  }

  get running() {
    return this._running;
  }

  _tick() {
    if (!this._running) {
      return;
    }

    const now = performance.now();
    const dt = Math.min((now - this._lastTime) / 1000, 0.05);
    this._lastTime = now;

    this.world.step(this._timeStep, dt, this._maxSubSteps);

    for (const { node, body } of this._pairs) {
      const p = body.position;
      body.quaternion.toEuler(this._euler);
      node.setRotation(this._euler.x * RAD2DEG, this._euler.y * RAD2DEG, this._euler.z * RAD2DEG);
      node.setPosition(p.x, p.y, p.z);
    }

    this._rafId = requestAnimationFrame(() => this._tick());
  }
}
