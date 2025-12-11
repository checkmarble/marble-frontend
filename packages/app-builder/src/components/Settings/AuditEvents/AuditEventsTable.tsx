import { CopyToClipboardButton } from '@app-builder/components/CopyToClipboardButton';
import { usePanel } from '@app-builder/components/Panel';
import { type AuditEvent } from '@app-builder/models/audit-event';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useTable } from 'ui-design-system';

import { AuditEventDetailPanel } from './AuditEventDetailPanel';
import { OperationBadge } from './OperationBadge';

const columnHelper = createColumnHelper<AuditEvent>();

interface AuditEventsTableProps {
  auditEvents: AuditEvent[];
}

export function AuditEventsTable({ auditEvents }: AuditEventsTableProps) {
  const { t } = useTranslation(['settings']);
  const language = useFormatLanguage();
  const { openPanel } = usePanel();

  const columns = useMemo(
    () => [
      columnHelper.accessor('createdAt', {
        id: 'timestamp',
        header: t('settings:activity_follow_up.table.timestamp'),
        size: 180,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? (
            <span className="text-grey-00 text-sm">
              {formatDateTimeWithoutPresets(value, {
                language,
                dateStyle: 'short',
                timeStyle: 'medium',
              })}
            </span>
          ) : (
            <span className="text-grey-50">-</span>
          );
        },
      }),
      columnHelper.accessor('actor', {
        id: 'object_id',
        header: t('settings:activity_follow_up.table.object_id'),
        size: 200,
        cell: ({ getValue }) => {
          const actor = getValue();
          if (!actor) return <span className="text-grey-50">-</span>;
          return (
            <div className="flex flex-col">
              <span className="text-grey-00 text-sm">{actor.name}</span>
              <span className="text-grey-50 text-xs capitalize">{actor.type.replace('_', ' ')}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('operation', {
        id: 'operation',
        header: t('settings:activity_follow_up.table.operation'),
        size: 100,
        cell: ({ getValue }) => <OperationBadge operation={getValue()} />,
      }),
      columnHelper.accessor('table', {
        id: 'table',
        header: t('settings:activity_follow_up.table.table'),
        size: 150,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? (
            <span className="text-grey-00 text-sm">{value}</span>
          ) : (
            <span className="text-grey-50">-</span>
          );
        },
      }),
      columnHelper.accessor('entityId', {
        id: 'entity_id',
        header: t('settings:activity_follow_up.table.entity_id'),
        size: 250,
        cell: ({ getValue }) => {
          const value = getValue();
          if (!value) return <span className="text-grey-50">-</span>;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <CopyToClipboardButton toCopy={value} size="sm">
                <span className="text-grey-00 max-w-[200px] truncate font-mono text-xs">{value}</span>
              </CopyToClipboardButton>
            </div>
          );
        },
      }),
    ],
    [language, t],
  );

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: auditEvents,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  const handleRowClick = useCallback(
    (event: AuditEvent) => {
      openPanel(<AuditEventDetailPanel event={event} />);
    },
    [openPanel],
  );

  return (
    <Table.Container {...getContainerProps()} className="max-h-[600px]">
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => (
          <Table.Row
            key={row.id}
            className="hover:bg-purple-98 group cursor-pointer"
            row={row}
            onClick={() => handleRowClick(row.original)}
          />
        ))}
      </Table.Body>
    </Table.Container>
  );
}
