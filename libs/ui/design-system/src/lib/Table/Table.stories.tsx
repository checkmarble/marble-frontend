import { faker } from '@faker-js/faker';
import { type Meta, Story } from '@storybook/react';
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { useMemo } from 'react';

import { Table, useVirtualTable } from './Table';

type StoryProps = {
  count: number;
};

const Story: Meta<StoryProps> = {
  component: Table.Default,
  title: 'Table',
  argTypes: {
    count: { type: 'number', defaultValue: 2500 },
  },
};
export default Story;

const Template: Story<StoryProps> = ({ count }) => {
  const data = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        description: faker.lorem.sentences(),
      })),
    [count]
  );

  const columns = useMemo<
    ColumnDef<{
      firstName: string;
      lastName: string;
      description: string;
    }>[]
  >(
    () => [
      {
        accessorKey: 'firstName',
        header: 'firstName',
        size: 200,
      },
      {
        accessorKey: 'lastName',
        header: 'lastName',
        size: 200,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 400,
      },
    ],
    []
  );

  const virtualTable = useVirtualTable({
    data,
    columns,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return <Table.Default {...virtualTable} />;
};

export const Primary = Template.bind({});
Primary.args = {};
