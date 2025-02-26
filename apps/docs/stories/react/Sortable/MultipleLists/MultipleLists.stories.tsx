import type {Meta, StoryObj} from '@storybook/react';

import {MultipleLists} from './MultipleLists';
import docs from './docs/MultipleLists.mdx';

const meta: Meta<typeof MultipleLists> = {
  title: 'React/Sortable/Multiple lists',
  component: MultipleLists,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;
type Story = StoryObj<typeof MultipleLists>;

export const Example: Story = {
  name: 'Example',
  args: {
    debug: false,
    itemCount: 6,
  },
};

export const Scrollable: Story = {
  name: 'Scrollable containers',
  args: {
    debug: false,
    itemCount: 25,
    scrollable: true,
  },
};

export const Grid: Story = {
  name: 'Grid',
  args: {
    debug: false,
    itemCount: 5,
    grid: true,
  },
};

export const VerticalSetup: Story = {
  name: 'Vertical',
  args: {
    debug: false,
    itemCount: 3,
    vertical: true,
  },
};

export const Debug: Story = {
  name: 'Debug',
  args: {
    debug: true,
    itemCount: 6,
  },
};
