import { faker } from '@faker-js/faker';
import { type ColumnDef } from '@tanstack/react-table';
import { act, render, renderHook, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { useMemo } from 'react';
import { describe, expect, it } from 'vitest';
import type { MarbleTableFeatures } from './features';

import { Table, useTable } from './Table';

mockResizeObserver();

function TestTable({ data }: { data: { name: string; description: string }[] }) {
  const columns = useMemo<
    ColumnDef<
      MarbleTableFeatures,
      {
        name: string;
        description: string;
      }
    >[]
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

    manualSorting: false,
  });

  return <Table.Default {...virtualTable} />;
}

describe('Table', () => {
  const migrationData = [
    { name: 'Zoe', description: 'First' },
    { name: 'Ada', description: 'Second' },
  ];
  const migrationColumns: ColumnDef<MarbleTableFeatures, (typeof migrationData)[number]>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description' },
  ];

  it('preserves server ordering by default and supports client filtering and sorting when enabled', () => {
    const { result, rerender } = renderHook(
      ({ manual }) =>
        useTable({ data: migrationData, columns: migrationColumns, manualSorting: manual, manualFiltering: manual }),
      { initialProps: { manual: true } },
    );
    act(() => result.current.table.setSorting([{ id: 'name', desc: false }]));
    expect(result.current.rows.map((row) => row.original.name)).toEqual(['Zoe', 'Ada']);
    rerender({ manual: false });
    expect(result.current.rows.map((row) => row.original.name)).toEqual(['Ada', 'Zoe']);
    act(() => result.current.table.setGlobalFilter('Zoe'));
    expect(result.current.rows.map((row) => row.original.name)).toEqual(['Zoe']);
  });

  it('updates selection, sizing, visibility and logical pinning', () => {
    const { result } = renderHook(() => useTable({ data: migrationData, columns: migrationColumns }));
    act(() => result.current.table.toggleAllRowsSelected(true));
    expect(result.current.table.getIsAllRowsSelected()).toBe(true);
    act(() => result.current.rows[0]?.toggleSelected(false));
    expect(result.current.table.getSelectedRowModel().rows).toHaveLength(1);
    act(() => {
      result.current.table.setColumnSizing({ name: 240 });
      result.current.table.getColumn('name')?.pin('start');
      result.current.table.getColumn('description')?.toggleVisibility(false);
    });
    expect(result.current.table.getColumn('name')?.getSize()).toBe(240);
    expect(result.current.table.state.columnPinning.start).toEqual(['name']);
    expect(result.current.rows[0]?.getVisibleCells()).toHaveLength(1);
  });

  it('does not mutate caller columns or duplicate row links on rerender', () => {
    const { result, rerender } = renderHook(() =>
      useTable({
        data: migrationData,
        columns: migrationColumns,
        rowLink: (row) => <a href={`/${row.name}`}>{row.name}</a>,
      }),
    );
    rerender();
    expect(migrationColumns).toHaveLength(2);
    expect(result.current.table.getAllColumns()).toHaveLength(3);
  });

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
      const secondRowGroup = screen.getAllByRole('rowgroup')[1];
      expect(secondRowGroup).toBeDefined();
      if (!secondRowGroup) return;

      within(secondRowGroup)
        .getAllByRole('row')
        .forEach((row, index) => {
          const name = sortedData[index]?.name;
          expect(name).toBeDefined();
          if (!name) return;
          expect(within(row).getByText(name)).toBeInTheDocument();
        });
    }

    const nameHeader = screen.getByText(/name/i);

    // First: Ascending order
    await userEvent.click(nameHeader);

    const ascendingData = [...data].sort((lhs, rhs) => lhs.name.localeCompare(rhs.name));

    checkTableSort(ascendingData);

    // Second: Descending order
    await userEvent.click(nameHeader);

    const descendingData = [...data].sort((lhs, rhs) => rhs.name.localeCompare(lhs.name));

    checkTableSort(descendingData);

    // Third: default order
    await userEvent.click(nameHeader);

    checkTableSort(data);
  });
});
