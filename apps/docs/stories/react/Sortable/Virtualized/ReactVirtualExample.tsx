import React, {forwardRef, useLayoutEffect, useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider, useSortable} from '@dnd-kit/react';
import {Debug, defaultPreset} from '@dnd-kit/dom';
import {move} from '@dnd-kit/state-management';
import {useWindowVirtualizer} from '@tanstack/react-virtual';

import {Item, Handle} from '../../components';
import {createRange, cloneDeep} from '../../../utilities';

interface Props {
  debug?: boolean;
}

export function ReactVirtualExample({debug}: Props) {
  const [items, setItems] = useState<UniqueIdentifier[]>(createRange(1000));
  const snapshot = useRef(cloneDeep(items));

  const parentRef = React.useRef<HTMLDivElement>(null);
  const parentOffsetRef = React.useRef(0);

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => 62,
    scrollMargin: parentOffsetRef.current,
    getItemKey: (index) => items[index],
  });
  const virtualItems = virtualizer.getVirtualItems();

  useLayoutEffect(() => {
    parentOffsetRef.current = parentRef.current?.offsetTop ?? 0;
  }, []);

  return (
    <DragDropProvider
      plugins={debug ? [Debug, ...defaultPreset.plugins] : undefined}
      onDragStart={() => {
        snapshot.current = cloneDeep(items);
      }}
      onDragOver={(event) => {
        const {source, target} = event.operation;

        if (!source || !target) {
          return;
        }

        setItems((items) => move(items, source, target));
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          setItems(snapshot.current);
        }
      }}
    >
      <div ref={parentRef} className="List">
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              padding: 20,
              alignItems: 'center',
              gap: 20,
              transform: `translateY(${
                virtualItems[0].start - virtualizer.options.scrollMargin
              }px)`,
            }}
          >
            {virtualItems.map(({key, index}) => {
              return (
                <Sortable
                  ref={virtualizer.measureElement}
                  key={key}
                  id={items[index]}
                  index={index}
                />
              );
            })}
          </div>
        </div>
      </div>
    </DragDropProvider>
  );
}

interface SortableProps {
  id: UniqueIdentifier;
  index: number;
}

const Sortable = forwardRef<Element, PropsWithChildren<SortableProps>>(
  function Sortable({id, index}, ref) {
    const [element, setElement] = useState<Element | null>(null);
    const activatorRef = useRef<HTMLButtonElement | null>(null);

    const {isDragSource} = useSortable({
      id,
      index,
      element,
      feedback: 'clone',
      activator: activatorRef,
    });

    return (
      <Item
        ref={(el) => {
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            ref.current = el;
          }

          setElement(el);
        }}
        actions={<Handle ref={activatorRef} />}
        data-index={index}
        shadow={isDragSource}
      >
        {id}
      </Item>
    );
  }
);