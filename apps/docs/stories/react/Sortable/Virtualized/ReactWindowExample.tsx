import React, {useRef, useEffect, useState} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {defaultPreset} from '@dnd-kit/dom';
import {Debug} from '@dnd-kit/dom/plugins/debug';
import {move} from '@dnd-kit/state-management';
import {FixedSizeList as List} from 'react-window';

import {Item, Handle} from '../../components';
import {createRange, cloneDeep} from '../../../utilities';

interface Props {
  debug?: boolean;
}

export function ReactWindowExample({debug}: Props) {
  const [items, setItems] = useState<UniqueIdentifier[]>(createRange(1000));
  const snapshot = useRef(cloneDeep(items));

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
      <List
        width={window.innerWidth - 100}
        height={window.innerHeight - 100}
        itemCount={items.length}
        itemSize={82}
        itemData={items}
        itemKey={(index) => items[index]}
        style={{margin: '0 auto'}}
      >
        {Row}
      </List>
    </DragDropProvider>
  );
}

function Row({
  data,
  index,
  style,
}: {
  data: UniqueIdentifier[];
  index: number;
  style: React.CSSProperties;
}) {
  return <Sortable id={data[index]} index={index} style={style} />;
}

interface SortableProps {
  id: UniqueIdentifier;
  index: number;
  style: React.CSSProperties;
}

function Sortable({id, index, style}: SortableProps) {
  const {isDragSource, ref, handleRef} = useSortable({
    id,
    index,
  });

  useEffect(() => {
    return () => {
      console.log('unmount', id);
    };
  }, [id]);

  return (
    <div
      ref={ref}
      style={{...style, display: 'flex', justifyContent: 'center', padding: 10}}
    >
      <Item
        actions={<Handle ref={handleRef} />}
        data-index={index}
        shadow={isDragSource}
      >
        {id}
      </Item>
    </div>
  );
}
