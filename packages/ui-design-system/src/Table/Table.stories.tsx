import { fakerEN } from '@faker-js/faker';
import type { Meta, StoryFn } from '@storybook/react';
import { type ColumnDef, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { useMemo } from 'react';

import { Table, useVirtualTable } from './Table';

type StoryProps = {
  count: number;
};

const Template: StoryFn<StoryProps> = ({ count }: StoryProps) => {
  const data = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        firstName: fakerEN.person.firstName(),
        lastName: fakerEN.person.lastName(),
        description: fakerEN.lorem.sentences(),
      })),
    [count],
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
    [],
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

const Story: Meta<StoryProps> = {
  component: Template,
  title: 'Table',
  args: {
    count: 2500,
  },
  argTypes: {
    count: { type: 'number' },
  },
  decorators: [(story) => <div className="flex max-h-72">{story()}</div>],
};
export default Story;

export const Primary = Template.bind({});
Primary.args = {};
