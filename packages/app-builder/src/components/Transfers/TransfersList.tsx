import { type Transfer } from '@app-builder/models/transfer';
import { formatCurrency, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useTable } from 'ui-design-system';

import { transfersI18n } from './transfers-i18n';

interface TransfersListProps {
  className?: string;
  transfers: Transfer[];
}

const columnHelper = createColumnHelper<Transfer>();

export function TransfersList({ className, transfers }: TransfersListProps) {
  const { t } = useTranslation(transfersI18n);
  const language = useFormatLanguage();

  const columns = React.useMemo(
    () => [
      columnHelper.accessor((row) => row.data.label, {
        id: 'label',
        header: 'Label',
        size: 200,
      }),
      columnHelper.accessor((row) => row.data.value, {
        id: 'value',
        header: 'Value',
        size: 100,
        cell: ({ getValue, row }) => (
          <span>
            {formatCurrency(getValue(), {
              language,
              currency: row.original.data.currency,
            })}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.data.currency.code, {
        id: 'currency',
        header: 'Currency',
        size: 50,
      }),
    ],
    [language],
  );

  const { rows, table, getBodyProps, getContainerProps } = useTable({
    data: transfers,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    rowLink: (transfer) => (
      <Link
        to={getRoute('/transfercheck/transfers/:transferId', {
          transferId: fromUUID(transfer.id),
        })}
      />
    ),
  });

  if (rows.length === 0) {
    return (
      <div className="bg-grey-100 border-grey-90 flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-4">
        <p className="text-s font-medium">{t('transfercheck:transfer.search.empty')}</p>
      </div>
    );
  }

  return (
    <Table.Container {...getContainerProps()} className={clsx('bg-grey-100', className)}>
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => {
          return <Table.Row key={row.id} row={row} />;
        })}
      </Table.Body>
    </Table.Container>
  );
}
