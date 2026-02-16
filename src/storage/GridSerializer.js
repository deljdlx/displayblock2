/**
 * GridSerializer.js — Pure functions to convert the cubes Map to/from JSON.
 *
 * Save format (version 1):
 * {
 *   "version": 1,
 *   "cubes": [
 *     { "x": 0, "y": -20, "z": 0, "material": "glass" },
 *     ...
 *   ]
 * }
 */

export class GridSerializer {
  /**
   * Serialize the cubes Map into a save-ready object.
   *
   * @param {Map<string, import('../shapes/Cube.js').Cube>} cubesMap
   *   Key "x,y,z" → Cube node
   * @returns {{ version: number, cubes: Array<{x: number, y: number, z: number, material: string}> }}
   */
  static serialize(cubesMap) {
    const cubes = [];
    for (const node of cubesMap.values()) {
      cubes.push({
        x: node.position.x,
        y: node.position.y,
        z: node.position.z,
        material: node.material || 'glass',
      });
    }
    return { version: 1, cubes };
  }

  /**
   * Deserialize saved data into an array of cube descriptors.
   *
   * Returns an empty array if the data is invalid or unrecognised.
   *
   * @param {object} data  Raw parsed JSON from storage
   * @returns {Array<{x: number, y: number, z: number, material: string}>}
   */
  static deserialize(data) {
    if (!data || typeof data !== 'object') {
      return [];
    }

    if (data.version !== 1 || !Array.isArray(data.cubes)) {
      return [];
    }

    return data.cubes.filter((c) => {
      return (
        typeof c.x === 'number' &&
        typeof c.y === 'number' &&
        typeof c.z === 'number' &&
        typeof c.material === 'string'
      );
    });
  }
}
