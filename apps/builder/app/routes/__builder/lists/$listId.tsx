import * as Dialog from '@radix-ui/react-dialog';
import { Page } from '@marble-front/builder/components/Page';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { faker } from '@faker-js/faker';
import { Cross, Scenarios } from '@marble-front/ui/icons';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ScrollArea,
  Table,
  useVirtualTable,
} from '@marble-front/ui/design-system';

import { type ColumnDef } from '@tanstack/react-table';
import { getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { useMemo } from 'react';
import Callout from '@marble-front/builder/components/Callout';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';

function getFakeList(id: string) {
  const values = Array.from({ length: Math.floor(Math.random() * 100) }).map(
    (_) => faker.name.fullName()
  );

  return {
    name: faker.database.column(),
    description: faker.lorem.sentences(),
    values,
  };
}

export async function loader({ request, params }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  invariant(params.listId, `params.listId is required`);
  /** TODO(data): get list from API */
  const scenario = getFakeList(params.listId);

  return json(scenario);
}

export const handle = {
  i18n: ['lists'] as const,
};

const MAX_SCENARIOS = 4;

function ScenariosList({ scenarios }: { scenarios: string[] }) {
  const { t } = useTranslation(handle.i18n);

  return (
    <>
      <div className="flex flex-row gap-2">
        <Scenarios height="24px" width="24px" className="flex-shrink-0" />
        <p className="text-text-m-semibold text-grey-100">
          {t('lists:used_in_scenarios')}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {scenarios.slice(0, MAX_SCENARIOS).map((scenario) => (
          <div
            key={scenario}
            className="border-grey-10 text-text-s-medium text-grey-100 flex h-10 items-center rounded border px-4 align-middle"
          >
            {scenario}
          </div>
        ))}
        {scenarios.length > MAX_SCENARIOS && (
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button variant="secondary">
                {t('lists:other_scenarios', {
                  count: scenarios.length - MAX_SCENARIOS,
                })}
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="bg-grey-100 animate-overlayShow fixed inset-0 items-center justify-center bg-opacity-40" />
              <Dialog.Content className="bg-grey-00 fixed top-1/2 left-1/2 flex w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-8 rounded-lg p-8">
                <Dialog.Title className="flex flex-row gap-2">
                  <Scenarios
                    height="24px"
                    width="24px"
                    className="flex-shrink-0"
                  />
                  <p className="text-text-m-semibold text-grey-100 flex-1">
                    {t('lists:used_in_scenarios')}
                  </p>
                  <Dialog.Close aria-label="Close">
                    <Cross
                      height="24px"
                      width="24px"
                      className="flex-shrink-0"
                    />
                  </Dialog.Close>
                </Dialog.Title>
                <ScrollArea.Root>
                  <ScrollArea.Viewport className="max-h-72">
                    <div className="flex flex-col gap-2 pr-4">
                      {scenarios.map((scenario) => (
                        <div
                          key={scenario}
                          className="border-grey-10 text-text-s-medium text-grey-100 flex h-14 items-center rounded border px-4 align-middle"
                        >
                          {scenario}
                        </div>
                      ))}
                    </div>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar>
                    <ScrollArea.Thumb />
                  </ScrollArea.Scrollbar>
                </ScrollArea.Root>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </div>
    </>
  );
}

export default function ScenarioLayout() {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation(handle.i18n);

  const scenarios = [
    'Check transactions',
    'Validate sepa payouts',
    'Check french transactions',
    'qui perferendis vitae',
    'est aut aut',
    // 'velit autem sunt',
    // 'et quis voluptatem',
  ];

  const columns = useMemo<ColumnDef<string>[]>(
    () => [
      {
        id: 'values',
        accessorFn: (row) => row,
        header: t('lists:description'),
        size: 600,
      },
    ],
    [t]
  );

  const virtualTable = useVirtualTable({
    data: data.values,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Page.Container>
      <Page.Header>
        <Link to="./..">
          <Page.BackButton className="mr-4" />
        </Link>
        {data.name}
      </Page.Header>
      <Page.Content className="max-w-3xl">
        <Callout>{data.description}</Callout>
        <ScenariosList scenarios={scenarios} />
        <div className="flex flex-col gap-2 lg:gap-4">
          <input className="border" />
          <Table.Default {...virtualTable} />
        </div>
      </Page.Content>
    </Page.Container>
  );
}
