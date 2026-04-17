import { Callout, decisionsI18n } from '@app-builder/components';
import { type Pivot } from '@app-builder/models';
import { type DataModelObject } from '@app-builder/models/data-model';
import { DecisionFilters } from '@app-builder/schemas/decisions';
import { getPivotDisplayValue } from '@app-builder/services/data/pivot';
import { pivotValuesDocHref } from '@app-builder/services/documentation-href';
import { Link } from '@tanstack/react-router';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Collapsible, Table, Tooltip, useVirtualTable } from 'ui-design-system';
import { DataFields } from '../Data/DataVisualisation/DataFields';
import { PivotType } from '../Data/PivotType';
import { ExternalLink, linkClasses } from '../ExternalLink';

interface PivotDetailProps {
  pivotValues: {
    pivot: Pivot;
    value: string;
    object: DataModelObject | null;
  }[];
  existingPivotDefinition: boolean;
}

export function PivotDetail({ pivotValues, existingPivotDefinition }: PivotDetailProps) {
  const { t } = useTranslation(decisionsI18n);

  let content;
  if (pivotValues.length > 0) {
    content = (
      <div className="flex flex-col gap-4">
        <Callout>
          <span className="whitespace-pre text-balance">
            <Trans
              t={t}
              i18nKey="decisions:pivot_detail.description"
              components={{
                DocLink: <ExternalLink href={pivotValuesDocHref} />,
              }}
            />
          </span>
        </Callout>
        <PivotList pivotValues={pivotValues} />
      </div>
    );
  } else if (existingPivotDefinition) {
    content = (
      <Callout>
        <span className="whitespace-pre text-balance">
          <Trans
            t={t}
            i18nKey="decisions:pivot_detail.no_pivot_description"
            components={{
              DocLink: <ExternalLink href={pivotValuesDocHref} />,
            }}
          />
        </span>
      </Callout>
    );
  } else {
    content = (
      <Callout>
        <span className="whitespace-pre text-balance">
          <Trans
            t={t}
            i18nKey="decisions:pivot_detail.missing_pivot_definition"
            components={{
              DataModelLink: <Link to="/data/schema" className={linkClasses} />,
              DocLink: <ExternalLink href={pivotValuesDocHref} />,
            }}
          />
        </span>
      </Callout>
    );
  }

  return (
    <Collapsible.Container className="bg-surface-card">
      <Collapsible.Title>{t('decisions:pivot_detail.title')}</Collapsible.Title>
      <Collapsible.Content>{content}</Collapsible.Content>
    </Collapsible.Container>
  );
}

function PivotList({ pivotValues }: Pick<PivotDetailProps, 'pivotValues'>) {
  const { t } = useTranslation(decisionsI18n);

  const columnHelper = useMemo(
    () => createColumnHelper<{ pivot: Pivot; value: string; object: DataModelObject | null }>(),
    [],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.pivot.type, {
        id: 'type',
        header: t('decisions:pivot_detail.type'),
        size: 50,
        cell: ({ getValue }) => {
          const type = getValue();
          return <PivotType {...{ type }} />;
        },
      }),
      columnHelper.accessor((row) => getPivotDisplayValue(row.pivot), {
        id: 'definition',
        header: t('decisions:pivot_detail.definition'),
        size: 160,
        cell: ({ getValue }) => {
          const definition = getValue();
          return <span>{definition}</span>;
        },
      }),
      columnHelper.accessor(
        (row) => ({
          value: row.value,
          table: row.pivot.type === 'field' ? row.pivot.baseTable : row.pivot.pivotTable,
          object: row.object,
        }),
        {
          id: 'filter_decisions',
          header: t('decisions:pivot_detail.pivot_value'),
          size: 240,
          cell: ({ getValue }) => (
            <Tooltip.Default content={t('decisions:pivot_detail.pivot_value.tooltip')}>
              <Link to={getDecisionRoute({ pivotValue: getValue().value })}>
                <PivotDetails value={getValue().value} table={getValue().table} object={getValue().object} />
              </Link>
            </Tooltip.Default>
          ),
        },
      ),
    ],
    [t, columnHelper],
  );

  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: pivotValues,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Table.Container {...getContainerProps()} className="bg-surface-card">
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => {
          return <Table.Row key={row.id} row={row} />;
        })}
      </Table.Body>
    </Table.Container>
  );
}

function getDecisionRoute(decisionFilters: Pick<DecisionFilters, 'pivotValue'>) {
  const searchParams = new URLSearchParams(decisionFilters);
  return `/detection/decisions?${searchParams.toString()}`;
}

function PivotDetails({ value, table, object }: { value: string; table: string; object: DataModelObject | null }) {
  if (!object) {
    return (
      <span className="hover:text-purple-hover focus:text-purple-hover text-purple-primary relative font-semibold hover:underline focus:underline">
        {value}
      </span>
    );
  }

  return (
    <DataFields
      table={table}
      object={object}
      preset="essentials"
      options={{ withId: true }}
      className="p-2 my-2 bg-surface-card rounded-v2-lg border-grey-border border cursor-pointer"
    />
  );
}
