import {effects} from '@dnd-kit/state';
import {Plugin} from '@dnd-kit/abstract';

import type {DragDropManager} from '../../manager/index.js';
import {
  defaultAnnouncements,
  defaultAttributes,
  defaultAnnouncementIdPrefix,
  defaultDescriptionIdPrefix,
  defaultScreenReaderInstructions,
} from './defaults.js';
import type {Announcements, ScreenReaderInstructions} from './types.js';
import {generateUniqueId, isFocusable} from './utilities.js';
import {createHiddenText} from './HiddenText.js';
import {createLiveRegion} from './LiveRegion.js';

interface Options {
  id?: string;
  idPrefix?: {
    description?: string;
    announcement?: string;
  };
  announcements?: Announcements;
  screenReaderInstructions?: ScreenReaderInstructions;
}

export class Accessibility extends Plugin<DragDropManager> {
  constructor(manager: DragDropManager, options?: Options) {
    super(manager);

    const {
      id,
      idPrefix: {
        description: descriptionPrefix = defaultDescriptionIdPrefix,
        announcement: announcementPrefix = defaultAnnouncementIdPrefix,
      } = {},
      announcements = defaultAnnouncements,
      screenReaderInstructions = defaultScreenReaderInstructions,
    } = options ?? {};

    const descriptionId = id
      ? `${descriptionPrefix}-${id}`
      : generateUniqueId(descriptionPrefix);
    const announcementId = id
      ? `${announcementPrefix}-${id}`
      : generateUniqueId(announcementPrefix);

    let hiddenTextElement: HTMLElement | undefined;
    let liveRegionElement: HTMLElement | undefined;

    const eventListeners = Object.entries(announcements).map(
      ([eventName, getAnnouncement]) => {
        return this.manager.monitor.addEventListener(
          eventName as keyof Announcements,
          (event: any, manager: DragDropManager) => {
            const announcement = getAnnouncement?.(event, manager);

            if (announcement && liveRegionElement) {
              liveRegionElement.innerText = announcement;
            }
          }
        );
      }
    );

    const initialize = () => {
      hiddenTextElement = createHiddenText(
        descriptionId,
        screenReaderInstructions.draggable
      );
      liveRegionElement = createLiveRegion(announcementId);

      document.body.append(hiddenTextElement, liveRegionElement);
    };

    const cleanupEffects = effects(() => {
      for (const draggable of manager.registry.draggables.value) {
        const {element, handle} = draggable;
        const activator = handle ?? element;

        if (activator) {
          if (!hiddenTextElement || !liveRegionElement) {
            initialize();
          }

          if (!isFocusable(activator) && !activator.hasAttribute('tabindex')) {
            activator.setAttribute('tabindex', '0');
          }

          if (
            !activator.hasAttribute('role') &&
            !(activator instanceof HTMLButtonElement)
          ) {
            activator.setAttribute('role', defaultAttributes.role);
          }

          if (!activator.hasAttribute('role-description')) {
            activator.setAttribute(
              'aria-roledescription',
              defaultAttributes.roleDescription
            );
          }

          if (!activator.hasAttribute('aria-describedby')) {
            activator.setAttribute('aria-describedby', descriptionId);
          }

          activator.setAttribute(
            'aria-pressed',
            String(draggable.isDragSource)
          );

          activator.setAttribute('aria-disabled', String(draggable.disabled));
        }
      }

      this.destroy = () => {
        hiddenTextElement?.remove();
        liveRegionElement?.remove();
        eventListeners.forEach((unsubscribe) => unsubscribe());
        cleanupEffects();
      };
    });
  }
}
