import { faker } from '@faker-js/faker';
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { useMemo } from 'react';

import { Table, useTable } from './Table';

mockResizeObserver();

function TestTable({
  data,
}: {
  data: { name: string; description: string }[];
}) {
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
    [],
  );

  const virtualTable = useTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return <Table.Default {...virtualTable} />;
}

describe('Table', () => {
  it('should render successfully', () => {
    const data = Array.from({ length: 10 }).map(() => ({
      name: faker.person.fullName(),
      description: faker.lorem.sentences(),
    }));

    render(<TestTable data={data} />);

    expect(screen.getByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();

    data.forEach(({ name, description }) => {
      expect(screen.getByText(name)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });

  it('should reorder successfully', async () => {
    const data = Array.from({ length: 10 }).map(() => ({
      name: faker.person.fullName(),
      description: faker.lorem.sentences(),
    }));

    render(<TestTable data={data} />);

    function checkTableSort(sortedData: typeof data) {
      within(screen.getAllByRole('rowgroup')[1])
        .getAllByRole('row')
        .forEach((row, index) => {
          expect(
            within(row).getByText(sortedData[index].name),
          ).toBeInTheDocument();
        });
    }

    const nameHeader = screen.getByText(/name/i);

    // First: Ascending order
    await userEvent.click(nameHeader);

    const ascendingData = [...data].sort((lhs, rhs) =>
      lhs.name.localeCompare(rhs.name),
    );

    checkTableSort(ascendingData);

    // Second: Descending order
    await userEvent.click(nameHeader);

    const descendingData = [...data].sort((lhs, rhs) =>
      rhs.name.localeCompare(lhs.name),
    );

    checkTableSort(descendingData);

    // Third: default order
    await userEvent.click(nameHeader);

    checkTableSort(data);
  });
});
