import { faker } from '@faker-js/faker';
import { Callout, Page } from '@marble-front/builder/components';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import {
  Button,
  Input,
  ScrollArea,
  Table,
  useVirtualTable,
} from '@marble-front/ui/design-system';
import { Cross, Scenarios, Search } from '@marble-front/ui/icons';
import * as Dialog from '@radix-ui/react-dialog';
import { json, type LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';

function getFakeList(id: string) {
  const values = Array.from({ length: Math.floor(Math.random() * 100) }).map(
    (_) => faker.person.fullName()
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
  i18n: ['lists', 'common'] satisfies Namespace,
};

const MAX_SCENARIOS = 4;

function ScenariosList({ scenarios }: { scenarios: string[] }) {
  const { t } = useTranslation(handle.i18n);

  return (
    <>
      <div className="flex flex-row gap-2">
        <Scenarios height="24px" width="24px" className="flex-shrink-0" />
        <p className="text-m text-grey-100 font-semibold">
          {t('lists:used_in_scenarios')}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {scenarios.slice(0, MAX_SCENARIOS).map((scenario) => (
          <div
            key={scenario}
            className="border-grey-10 text-s text-grey-100 flex h-10 items-center rounded border px-4 align-middle font-medium"
          >
            {scenario}
          </div>
        ))}
        {scenarios.length > MAX_SCENARIOS && (
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button variant="secondary">
                {t('lists:other_scenarios', {
                  ns: 'lists',
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
                  <p className="text-m text-grey-100 flex-1 font-semibold">
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
                          className="border-grey-10 text-s text-grey-100 flex h-14 items-center rounded border px-4 align-middle font-medium"
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

export default function Lists() {
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
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Page.Container>
      <Page.Header>
        <Link to="./.." className="mr-4">
          <Page.BackButton />
        </Link>
        {data.name}
      </Page.Header>
      <Page.Content scrollable={false} className="max-w-3xl">
        <Callout>{data.description}</Callout>
        <ScenariosList scenarios={scenarios} />
        <div className="flex flex-col gap-2 overflow-hidden lg:gap-4">
          <form className="flex items-center">
            <Input
              type="search"
              aria-label={t('common:search')}
              placeholder={t('common:search')}
              startAdornment={<Search />}
              onChange={(event) => {
                virtualTable.table.setGlobalFilter(event.target.value);
              }}
            />
          </form>

          <Table.Default {...virtualTable} />
        </div>
      </Page.Content>
    </Page.Container>
  );
}
