import { type Meta, type StoryFn } from '@storybook/react';
import { useState } from 'react';

import { FiltersBar } from './FiltersBar';
import { type FilterDescriptor } from './types';

const Story: Meta<typeof FiltersBar> = {
  component: FiltersBar,
  title: 'FiltersBar',
};

export default Story;

const mainDescriptors: FilterDescriptor[] = [
  { type: 'text', name: 'search', placeholder: 'Search terms', operator: 'in' },
  { type: 'number', name: 'amount', placeholder: 'Amount', operator: 'eq' },
  { type: 'boolean', name: 'isActive', placeholder: 'Active' },
  {
    type: 'select',
    name: 'status',
    placeholder: 'Status',
    options: ['new', 'pending', 'approved', 'rejected'],
  },
];

const dynamicDescriptors: FilterDescriptor[] = [
  { type: 'date-range-popover', name: 'createdAt', placeholder: 'Created between' },
  { type: 'text', name: 'tags', placeholder: 'Tags', operator: 'in' },
  { type: 'boolean', name: 'archived', placeholder: 'Archived' },
  {
    type: 'select',
    name: 'owner',
    placeholder: 'Owner',
    options: [
      { label: 'Alice', value: 'alice' },
      { label: 'Bob', value: 'bob' },
      { label: 'Charlie', value: 'charlie' },
    ],
  },
];

export const Basic: StoryFn<typeof FiltersBar> = (args) => {
  const [state, setState] = useState<{ value: Record<string, unknown>; active: string[] }>({
    value: {},
    active: [],
  });

  return (
    <FiltersBar
      {...args}
      descriptors={mainDescriptors}
      dynamicDescriptors={dynamicDescriptors}
      value={state.value}
      active={state.active}
      onChange={(_, next) => setState(next)}
    />
  );
};

export const WithInitialActive: StoryFn<typeof FiltersBar> = (args) => {
  const [state, setState] = useState<{ value: Record<string, unknown>; active: string[] }>({
    value: {},
    active: ['createdAt', 'owner'],
  });

  return (
    <FiltersBar
      {...args}
      descriptors={mainDescriptors}
      dynamicDescriptors={dynamicDescriptors}
      value={state.value}
      active={state.active}
      onChange={(_, next) => setState(next)}
    />
  );
};

export const PrefilledValues: StoryFn<typeof FiltersBar> = (args) => {
  const [state, setState] = useState<{ value: Record<string, unknown>; active: string[] }>({
    value: {
      search: [
        { operator: 'in', value: 'fraud' },
        { operator: 'in', value: 'chargeback' },
      ],
      amount: { operator: 'gte', value: 1000 },
      isActive: true,
      status: 'approved',
      createdAt: { type: 'dynamic', fromNow: '-P30D' },
    },
    active: ['createdAt'],
  });

  return (
    <FiltersBar
      {...args}
      descriptors={mainDescriptors}
      dynamicDescriptors={dynamicDescriptors}
      value={state.value}
      active={state.active}
      onChange={(_, next) => setState(next)}
    />
  );
};
