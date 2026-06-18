import { ColumnHelper } from '@tanstack/react-table';
import { Checkbox } from 'ui-design-system';

export const getTableSelectColumn = (columnHelper: ColumnHelper<any>, selectable?: boolean) => {
  return selectable
    ? [
        columnHelper.display({
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ? true : table.getIsSomeRowsSelected() ? 'indeterminate' : false
              }
              onClick={table.getToggleAllRowsSelectedHandler()}
              className="ms-sm"
            />
          ),
          cell: ({ row }) => (
            <label onClick={(e) => e.stopPropagation()} className="block h-10 w-10 p-sm">
              <Checkbox
                checked={row.getIsSelected()}
                onClick={(e) => {
                  e.stopPropagation();
                  row.getToggleSelectedHandler()(e);
                }}
              />
            </label>
          ),
          size: 40,
          enableResizing: false,
        }),
      ]
    : [];
};
