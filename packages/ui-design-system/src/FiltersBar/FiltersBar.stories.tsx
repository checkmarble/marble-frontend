import { type Meta, type StoryFn } from '@storybook/react';
import { useState } from 'react';

import { FiltersBar } from './FiltersBar';
import { type FilterDescriptor, type FilterValue } from './types';

const Story: Meta<typeof FiltersBar> = {
  component: FiltersBar,
  title: 'FiltersBar',
};

export default Story;

const mainDescriptors: FilterDescriptor[] = [
  { type: 'text', name: 'search', placeholder: 'Search terms', op: 'in' },
  { type: 'number', name: 'amount', placeholder: 'Amount', op: '=' },
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
  { type: 'text', name: 'tags', placeholder: 'Tags', op: 'in' },
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
  const [value, setValue] = useState<Record<string, FilterValue>>({});

  return (
    <FiltersBar
      {...args}
      descriptors={mainDescriptors}
      dynamicDescriptors={dynamicDescriptors}
      value={value}
      onChange={(_, next) => setValue(next.value)}
    />
  );
};

export const WithInitialActive: StoryFn<typeof FiltersBar> = (args) => {
  const [value, setValue] = useState<Record<string, FilterValue>>({});

  return (
    <FiltersBar
      {...args}
      descriptors={mainDescriptors}
      dynamicDescriptors={dynamicDescriptors}
      value={value}
      onChange={(_, next) => setValue(next.value)}
    />
  );
};

export const PrefilledValues: StoryFn<typeof FiltersBar> = (args) => {
  const [value, setValue] = useState<Record<string, FilterValue>>({
    search: { op: 'in', value: ['fraud', 'chargeback'] },
    amount: { op: '>=', value: 1000 },
    isActive: true,
    status: 'approved',
    createdAt: { type: 'dynamic', fromNow: '-P30D' },
  });

  return (
    <FiltersBar
      {...args}
      descriptors={mainDescriptors}
      dynamicDescriptors={dynamicDescriptors}
      value={value}
      onChange={(_, next) => setValue(next.value)}
    />
  );
};
