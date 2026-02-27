import { type DebugDeltaTrack, type DebugDeltaTrackOperation } from '@app-builder/models/continuous-screening-debug';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { type FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tag, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

const columnHelper = createColumnHelper<DebugDeltaTrack>();

const operationColor: Record<DebugDeltaTrackOperation, 'green' | 'yellow' | 'red'> = {
  add: 'green',
  update: 'yellow',
  delete: 'red',
};

interface DeltaTracksTableProps {
  items: DebugDeltaTrack[];
}

export const DeltaTracksTable: FunctionComponent<DeltaTracksTableProps> = ({ items }) => {
  const { t } = useTranslation(['settings']);
  const language = useFormatLanguage();

  const columns = useMemo(
    () => [
      columnHelper.accessor('objectId', {
        id: 'object_id',
        header: t('settings:continuous_screening_debug.delta_tracks.object_id'),
        size: 200,
        cell: ({ getValue }) => <span className="text-grey-primary font-mono text-xs">{getValue()}</span>,
      }),
      columnHelper.accessor('objectType', {
        id: 'object_type',
        header: t('settings:continuous_screening_debug.delta_tracks.object_type'),
        size: 120,
        cell: ({ getValue }) => <span className="text-grey-primary text-sm">{getValue()}</span>,
      }),
      columnHelper.accessor('operation', {
        id: 'operation',
        header: t('settings:continuous_screening_debug.delta_tracks.operation'),
        size: 70,
        cell: ({ getValue }) => {
          const operation = getValue();
          return (
            <Tag border="square" size="small" color={operationColor[operation]}>
              {t(`settings:continuous_screening_debug.operation.${operation}` as const)}
            </Tag>
          );
        },
      }),
      columnHelper.accessor('processed', {
        id: 'processed',
        header: t('settings:continuous_screening_debug.delta_tracks.processed'),
        size: 80,
        cell: ({ getValue }) => {
          const processed = getValue();
          return (
            <div className="flex justify-center">
              <Icon
                icon={processed ? 'tick' : 'cross'}
                className={processed ? 'size-5 text-green-primary' : 'size-5 text-red-primary'}
              />
            </div>
          );
        },
      }),
      columnHelper.accessor('datasetFile', {
        id: 'dataset_file',
        header: t('settings:continuous_screening_debug.delta_tracks.dataset_file'),
        size: 150,
        cell: ({ getValue }) => {
          const file = getValue();
          if (!file) return <span className="text-grey-secondary">-</span>;
          return (
            <div className="flex flex-col">
              <span className="text-grey-primary font-mono text-xs">{file.version}</span>
              <span className="text-grey-secondary text-xs">{file.fileType}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('createdAt', {
        id: 'created_at',
        header: t('settings:continuous_screening_debug.delta_tracks.created_at'),
        size: 120,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? (
            <span className="text-grey-primary text-sm">
              {formatDateTimeWithoutPresets(value, {
                language,
                dateStyle: 'short',
                timeStyle: 'medium',
              })}
            </span>
          ) : (
            <span className="text-grey-secondary">-</span>
          );
        },
      }),
    ],
    [language, t],
  );

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: items,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Table.Container {...getContainerProps()}>
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => (
          <Table.Row key={row.id} row={row} />
        ))}
      </Table.Body>
    </Table.Container>
  );
};
