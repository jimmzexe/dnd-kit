import {batch, effect} from '@dnd-kit/state';
import {Plugin} from '@dnd-kit/abstract';
import {closestCenter} from '@dnd-kit/collision';
import {
  isKeyboardEvent,
  scheduler,
  scrollIntoViewIfNeeded,
} from '@dnd-kit/dom/utilities';
import type {Coordinates} from '@dnd-kit/geometry';

import {Scroller} from '@dnd-kit/dom';
import type {DragDropManager, Droppable} from '@dnd-kit/dom';

import {isSortable} from './utilities.js';

const TOLERANCE = 10;

export class SortableKeyboardPlugin extends Plugin<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);

    const cleanupEffect = effect(() => {
      const {dragOperation} = manager;

      if (!isKeyboardEvent(dragOperation.activatorEvent)) {
        return;
      }

      if (!isSortable(dragOperation.source)) {
        return;
      }

      if (dragOperation.status.initialized) {
        const scroller = manager.registry.plugins.get(Scroller);

        if (scroller) {
          scroller.disable();

          return () => scroller.enable();
        }
      }
    });

    const unsubscribe = manager.monitor.addEventListener(
      'dragmove',
      (event, manager) => {
        if (this.disabled || event.defaultPrevented) {
          return;
        }

        const {dragOperation} = manager;

        if (!isKeyboardEvent(dragOperation.activatorEvent)) {
          return;
        }

        if (!isSortable(dragOperation.source)) {
          return;
        }

        if (!dragOperation.shape) {
          return;
        }

        const {actions, collisionObserver, registry} = manager;
        const {by} = event;

        if (!by) {
          return;
        }

        const direction = getDirection(by);
        const {source} = dragOperation;
        const {center} = dragOperation.shape.current;
        const potentialTargets: Droppable[] = [];

        for (const droppable of registry.droppables) {
          const {shape, id} = droppable;

          if (
            !shape ||
            (id === source?.id && isSortable(droppable)) ||
            (source?.type != null && !droppable.accepts(source.type))
          ) {
            continue;
          }

          switch (direction) {
            case 'down':
              if (center.y + TOLERANCE < shape.center.y) {
                potentialTargets.push(droppable);
              }
              break;
            case 'up':
              if (center.y - TOLERANCE > shape.center.y) {
                potentialTargets.push(droppable);
              }
              break;
            case 'left':
              if (center.x - TOLERANCE > shape.center.x) {
                potentialTargets.push(droppable);
              }
              break;
            case 'right':
              if (center.x + TOLERANCE < shape.center.x) {
                potentialTargets.push(droppable);
              }
              break;
          }
        }

        event.preventDefault();
        collisionObserver.disable();

        const collisions = collisionObserver.computeCollisions(
          potentialTargets,
          closestCenter
        );
        const [firstCollision] = collisions;

        if (!firstCollision) {
          return;
        }

        const {id} = firstCollision;

        actions.setDropTarget(id).then(() => {
          const {source} = dragOperation;

          if (!source) {
            return;
          }

          const droppable = registry.droppables.get(source.id);

          if (!droppable?.element) {
            return;
          }

          const {element} = droppable;
          scrollIntoViewIfNeeded(element);

          scheduler.schedule(() => {
            const shape = droppable.refreshShape();

            if (!shape) {
              return;
            }

            batch(() => {
              actions.setDropTarget(source.id);
              actions.move({
                to: {
                  x: shape.center.x,
                  y: shape.center.y,
                },
              });
            });

            collisionObserver.enable();
          });
        });
      }
    );

    this.destroy = () => {
      unsubscribe();
      cleanupEffect();
    };
  }
}

function getDirection(delta: Coordinates) {
  const {x, y} = delta;

  if (x > 0) {
    return 'right';
  } else if (x < 0) {
    return 'left';
  } else if (y > 0) {
    return 'down';
  } else if (y < 0) {
    return 'up';
  }
}
