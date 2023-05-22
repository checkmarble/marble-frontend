import { faker } from '@faker-js/faker';
import { type Decision, listDecisions } from '@marble-front/api/marble';
import {
  Outcome,
  type OutcomeProps,
  Page,
} from '@marble-front/builder/components';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { getRoute } from '@marble-front/builder/services/routes';
import { fromUUID } from '@marble-front/builder/utils/short-uuid';
import { Table, Tag, useVirtualTable } from '@marble-front/ui/design-system';
import { Decision as DecisionIcon } from '@marble-front/ui/icons';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';

export const handle = {
  i18n: ['decisions', 'navigation'] satisfies Namespace,
};

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  // const decisions = await listDecisions();

  const decisions: Decision[] = Array.from({
    length: Number(faker.random.numeric(2)),
  }).map(() => ({
    id: faker.datatype.uuid(),
    created_at: faker.date.recent().toISOString(),
    trigger_object: {
      type: faker.helpers.arrayElement(['transaction', 'user', undefined]),
    },
    outcome: faker.helpers.arrayElement([
      'approve',
      'review',
      'reject',
      'null',
      'unknown',
    ]),
    scenario: {
      id: faker.datatype.uuid(),
      name: faker.random.words(),
      description: faker.random.words(7),
      version: Number(faker.random.numeric()),
    },
    rules: Array.from({ length: Number(faker.random.numeric()) }).map(() => ({
      name: faker.random.words(),
      description: faker.random.words(7),
      score_modifier: Number(faker.random.numeric(2)),
      result: Math.random() < 0.5,
    })),
    score: Number(faker.random.numeric(2)),
  }));

  const sortedDecisions = R.sortBy(decisions, [
    ({ created_at }) => created_at,
    'desc',
  ]);

  return json(sortedDecisions);
}

function formatCreatedAt(locale: string, createdAt: string) {
  return Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(createdAt));
}

export default function DecisionsPage() {
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
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Page.Container>
      <Page.Header>
        <DecisionIcon className="mr-2" height="24px" width="24px" />
        {t('navigation:decisions')}
      </Page.Header>
      <Page.Content scrollable={false}>
        <Table.Container {...getContainerProps()}>
          <Table.Header headerGroups={table.getHeaderGroups()} />
          <Table.Body {...getBodyProps()}>
            {rows.map((row) => (
              <Table.Row
                key={row.id}
                className="hover:bg-grey-02 cursor-pointer"
                row={row}
                onClick={() => {
                  console.log(row.id);
                }}
              />
            ))}
          </Table.Body>
        </Table.Container>
      </Page.Content>
    </Page.Container>
  );
}
