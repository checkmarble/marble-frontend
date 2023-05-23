import { type Decision } from '@marble-front/api/marble';
import {
  Outcome,
  type OutcomeProps,
  Page,
} from '@marble-front/builder/components';
import { listDecisions } from '@marble-front/builder/fixtures';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { formatCreatedAt } from '@marble-front/builder/utils/format';
import { Table, useVirtualTable } from '@marble-front/ui/design-system';
import { Decision as DecisionIcon } from '@marble-front/ui/icons';
import { json, type LinksFunction, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type ColumnDef, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import cssBundleHref from 'react-json-view-lite/dist/index.css';
import * as R from 'remeda';

import {
  DecisionsRightPannel,
  useDecisionsRightPannelState,
} from '../ressources/decisions/decision-detail';

export const handle = {
  i18n: ['decisions', 'navigation'] satisfies Namespace,
};

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: cssBundleHref }];
};

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const decisions = await listDecisions();

  const sortedDecisions = R.sortBy(decisions, [
    ({ created_at }) => created_at,
    'desc',
  ]);

  return json(sortedDecisions);
}

export default function DecisionsPage() {
  const { decisionId, setDecisionId } = useDecisionsRightPannelState();

  const { t, i18n } = useTranslation(handle.i18n);
  const decisions = useLoaderData<typeof loader>();

  const columns = useMemo<ColumnDef<Decision, string>[]>(
    () => [
      {
        id: 'scenario.name',
        accessorFn: (row) => row.scenario.name,
        header: t('decisions:scenario.name'),
        size: 200,
      },
      {
        id: 'trigger_object_type',
        accessorFn: (row) => row.trigger_object_type,
        header: t('decisions:trigger_object.type'),
        size: 100,
      },
      {
        id: 'score',
        accessorFn: (row) => row.score,
        header: t('decisions:score'),
        size: 100,
      },
      {
        id: 'outcome',
        accessorFn: (row) => row.outcome,
        header: t('decisions:outcome'),
        size: 100,
        cell: ({ getValue }) => (
          <Outcome
            border="square"
            size="big"
            outcome={getValue<OutcomeProps['outcome']>()}
          />
        ),
      },
      {
        id: 'created_at',
        accessorFn: (row) => formatCreatedAt(i18n.language, row.created_at),
        header: t('decisions:created_at'),
        size: 200,
      },
    ],
    [i18n.language, t]
  );

  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: decisions,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Page.Container>
      <Page.Header>
        <DecisionIcon className="mr-2" height="24px" width="24px" />
        {t('navigation:decisions')}
      </Page.Header>
      <DecisionsRightPannel.Root>
        <Page.Content scrollable={false}>
          <Table.Container {...getContainerProps()}>
            <Table.Header headerGroups={table.getHeaderGroups()} />
            <Table.Body {...getBodyProps()}>
              {rows.map((row) => (
                <Table.Row
                  key={row.id}
                  className={clsx(
                    'hover:bg-grey-02 cursor-pointer',
                    row.original.id === decisionId && 'bg-grey-02'
                  )}
                  row={row}
                  onClick={(e) => {
                    setDecisionId(row.original.id);
                    e.stopPropagation();
                  }}
                />
              ))}
            </Table.Body>
          </Table.Container>
        </Page.Content>
      </DecisionsRightPannel.Root>
    </Page.Container>
  );
}
