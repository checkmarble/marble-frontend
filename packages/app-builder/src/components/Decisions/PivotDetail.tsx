import {
  Callout,
  type DecisionFilters,
  decisionsI18n,
} from '@app-builder/components';
import { type Pivot } from '@app-builder/models';
import { getPivotDisplayValue } from '@app-builder/services/data/pivot';
import { pivotValuesDocHref } from '@app-builder/services/documentation-href';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Collapsible, Table, Tooltip, useVirtualTable } from 'ui-design-system';

import { PivotType } from '../Data/PivotDetails';
import { ExternalLink, linkClasses } from '../ExternalLink';

interface PivotDetailProps {
  pivotValues: {
    pivot: Pivot;
    value: string;
  }[];
  existingPivotDefinition: boolean;
}

export function PivotDetail({
  pivotValues,
  existingPivotDefinition,
}: PivotDetailProps) {
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
              DataModelLink: (
                <Link to={getRoute('/data/schema')} className={linkClasses} />
              ),
              DocLink: <ExternalLink href={pivotValuesDocHref} />,
            }}
          />
        </span>
      </Callout>
    );
  }

  return (
    <Collapsible.Container className="bg-grey-100">
      <Collapsible.Title>{t('decisions:pivot_detail.title')}</Collapsible.Title>
      <Collapsible.Content>{content}</Collapsible.Content>
    </Collapsible.Container>
  );
}

const columnHelper =
  createColumnHelper<PivotDetailProps['pivotValues'][number]>();

function PivotList({ pivotValues }: Pick<PivotDetailProps, 'pivotValues'>) {
  const { t } = useTranslation(decisionsI18n);

  const columns = React.useMemo(
    () => [
      columnHelper.accessor((row) => row.pivot.type, {
        id: 'type',
        header: t('decisions:pivot_detail.type'),
        size: 50,
        cell: ({ getValue }) => {
          const type = getValue();
          return <PivotType type={type} />;
        },
      }),
      columnHelper.accessor((row) => getPivotDisplayValue(row.pivot), {
        id: 'definition',
        header: t('decisions:pivot_detail.definition'),
        size: 200,
        cell: ({ getValue }) => {
          const definition = getValue();
          return <span>{definition}</span>;
        },
      }),
      columnHelper.accessor((row) => row.value, {
        id: 'filter_decisions',
        header: t('decisions:pivot_detail.pivot_value'),
        size: 200,
        cell: ({ getValue }) => (
          <Tooltip.Default
            content={t('decisions:pivot_detail.pivot_value.tooltip')}
          >
            <Link
              to={getDecisionRoute({ pivotValue: getValue() })}
              className="hover:text-purple-60 focus:text-purple-60 text-purple-65 relative font-semibold hover:underline focus:underline"
            >
              {getValue()}
            </Link>
          </Tooltip.Default>
        ),
      }),
    ],
    [t],
  );

  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: pivotValues,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Table.Container {...getContainerProps()} className="bg-grey-100">
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => {
          return <Table.Row key={row.id} row={row} />;
        })}
      </Table.Body>
    </Table.Container>
  );
}

function getDecisionRoute(
  decisionFilters: Pick<DecisionFilters, 'pivotValue'>,
) {
  const searchParams = new URLSearchParams(decisionFilters);
  return `${getRoute('/decisions')}?${searchParams.toString()}`;
}
