import {signal} from '@dnd-kit/state';

import type {Entity} from './entity.js';
import type {UniqueIdentifier} from './types.js';

/**
 * Reactive class representing a registry for entities.
 * @template T - The type of entries that the registry manages,
 * for example, `Draggable` or `Droppable` entities.
 */
export class EntityRegistry<T extends Entity> {
  private map = signal<Map<UniqueIdentifier, T>>(new Map());

  /**
   * Iterator for the EntityRegistry class.
   * @returns An iterator for the values in the map.
   */
  public [Symbol.iterator]() {
    return this.map.peek().values();
  }

  public get value() {
    return this.map.value.values();
  }

  /**
   * Checks if a entity with the given identifier exists in the registry.
   * @param identifier - The unique identifier of the entity.
   * @returns True if the entity exists, false otherwise.
   */
  public has(identifier: UniqueIdentifier): boolean {
    return this.map.value.has(identifier);
  }

  /**
   * Retrieves a entity from the registry using its identifier.
   * @param identifier - The unique identifier of the entity.
   * @returns The entity if it exists, undefined otherwise.
   */
  public get(identifier: UniqueIdentifier): T | undefined {
    return this.map.value.get(identifier);
  }

  /**
   * Registers a entity in the registry.
   * @param key - The unique identifier of the entity.
   * @param value - The entity to register.
   * @returns A function that unregisters the entity.
   */
  public register = (key: UniqueIdentifier, value: T) => {
    const current = this.map.peek();

    if (current.get(key) === value) {
      return;
    }

    const updatedMap = new Map(current);
    updatedMap.set(key, value);

    this.map.value = updatedMap;

    return () => this.unregister(key, value);
  };

  /**
   * Unregisters an entity from the registry.
   * @param key - The unique identifier of the entity.
   * @param value - The entity instance to unregister.
   */
  public unregister = (key: UniqueIdentifier, value: T) => {
    const current = this.map.peek();

    if (current.get(key) !== value) {
      return;
    }

    const updatedMap = new Map(current);
    updatedMap.delete(key);

    this.map.value = updatedMap;
  };

  /**
   * Destroys all entries in the registry and clears the registry.
   */
  public destroy() {
    for (const entry of this) {
      entry.destroy();
    }

    this.map.value = new Map();
  }
}
