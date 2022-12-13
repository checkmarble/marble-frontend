import type { Story, Meta } from '@storybook/react';
import { useMemo } from 'react';
import { Table } from './Table';
import { faker } from '@faker-js/faker';
import type { ColumnDef } from '@tanstack/react-table';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';

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
        name: faker.name.fullName(),
        description: faker.lorem.sentences(),
      })),
    [count]
  );

  const columns = useMemo<
    ColumnDef<{
      name: string;
      description: string;
    }>[]
  >(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 50,
      },
      {
        accessorKey: 'description',
        header: 'Description',
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  return <Table.Default table={table} />;
};

export const Primary = Template.bind({});
Primary.args = {};
