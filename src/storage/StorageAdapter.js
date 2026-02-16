/**
 * StorageAdapter.js — Abstract base class for persistence backends.
 *
 * Defines the async interface that every storage backend must implement.
 * Today we use LocalStorageAdapter; tomorrow a REST API adapter can
 * be swapped in without changing any calling code (Strategy pattern).
 */

export class StorageAdapter {
  /**
   * List all saved slot names.
   *
   * @returns {Promise<string[]>}
   */
  async listSlots() {
    throw new Error('StorageAdapter.listSlots() not implemented');
  }

  /**
   * Load the data stored under `slotName`.
   *
   * @param {string} slotName
   * @returns {Promise<object|null>} Parsed save data, or null if not found
   */
  async load(slotName) {
    throw new Error(`StorageAdapter.load(${slotName}) not implemented`);
  }

  /**
   * Save `data` under `slotName`.
   *
   * @param {string} slotName
   * @param {object} data
   * @returns {Promise<void>}
   */
  async save(slotName, _data) {
    throw new Error(`StorageAdapter.save(${slotName}) not implemented`);
  }

  /**
   * Delete the slot identified by `slotName`.
   *
   * @param {string} slotName
   * @returns {Promise<void>}
   */
  async delete(slotName) {
    throw new Error(`StorageAdapter.delete(${slotName}) not implemented`);
  }
}
