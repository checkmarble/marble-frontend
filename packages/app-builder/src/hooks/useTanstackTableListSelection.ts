import { useCallbackRef } from '@marble/shared';
import { Dispatch, SetStateAction, useState } from 'react';

type SetRowSelection = Dispatch<SetStateAction<RowSelectionState>>;

type TableProps<Model> = {
  getRowId: (item: Model) => string;
  onRowSelectionChange: SetRowSelection;
};

export type ListSelectionReturnType<Model> = {
  hasSelectedRows: boolean;
  rowSelection: RowSelectionState;
  tableProps: TableProps<Model>;
  setRowSelection: SetRowSelection;
  selectionProps: {
    rowSelection: RowSelectionState;
  };
  getSelectedRows: () => Model[];
};

type WithSelectable<Model> = {
  selectable: true;
  selectionProps: ListSelectionReturnType<Model>['selectionProps'];
  tableProps: ListSelectionReturnType<Model>['tableProps'];
};

type WithoutSelectable<Model> = {
  selectable?: false;
  selectionProps?: ListSelectionReturnType<Model>['selectionProps'];
  tableProps?: ListSelectionReturnType<Model>['tableProps'];
};

export type SelectionProps<Model> = WithSelectable<Model> | WithoutSelectable<Model>;

export function useTanstackTableListSelection<Model>(
  data: Model[],
  getRowId: (item: Model) => string,
): ListSelectionReturnType<Model> {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const _getRowId = useCallbackRef((item: Model) => getRowId(item));
  const getSelectedRows = useCallbackRef((): Model[] => {
    return data.filter((item) => rowSelection[_getRowId(item)]);
  });

  return {
    hasSelectedRows: getSelectedRows().length > 0,
    setRowSelection,
    rowSelection,
    tableProps: {
      getRowId: _getRowId,
      onRowSelectionChange: setRowSelection,
    },
    selectionProps: {
      rowSelection,
    },
    getSelectedRows,
  };
}

import type { RowSelectionState } from '@tanstack/react-table';
