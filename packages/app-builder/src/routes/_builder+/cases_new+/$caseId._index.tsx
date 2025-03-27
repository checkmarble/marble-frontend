import { Page } from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { PanelIcon } from '@app-builder/components/CaseManager/PivotsPanel/PanelIcon';
import { PivotsPanel } from '@app-builder/components/CaseManager/PivotsPanel/PivotsPanel';
import {
  DataModelExplorer,
  type TabItem,
} from '@app-builder/components/DataModelExplorer/DataModelExplorer';
import { LeftSidebarSharpFactory } from '@app-builder/components/Layout/LeftSidebar';
import { type DataModel } from '@app-builder/models';
import { type CaseDetail, type PivotObject } from '@app-builder/models/cases';
import { type Inbox } from '@app-builder/models/inbox';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { faker } from '@faker-js/faker';
import {
  HoverCard,
  HoverCardContent,
  HoverCardPortal,
  HoverCardTrigger,
} from '@radix-ui/react-hover-card';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { cva } from 'class-variance-authority';
import { useEffect, useMemo, useState } from 'react';
import * as R from 'remeda';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

type CaseManagerPageLoaderData = {
  case: CaseDetail;
  pivotObjects: PivotObject[] | null;
  dataModel: DataModel;
  currentInbox: Inbox;
  inboxes: Inbox[];
};

export const loader = async ({
  request,
  params,
}: LoaderFunctionArgs): Promise<CaseManagerPageLoaderData | Response> => {
  const { authService } = initServerServices(request);
  const { cases, inbox, dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const caseId = fromParams(params, 'caseId');

  // Get case by ID
  const [currentCase, inboxes, pivotObjects, dataModel] = await Promise.all([
    cases.getCase({ caseId }),
    inbox.listInboxes(),
    cases.listPivotObjects({ caseId }),
    dataModelRepository.getDataModel(),
  ]);

  if (!currentCase) {
    return redirect(getRoute('/cases/inboxes'));
  }

  const currentInbox = inboxes.find((inbox) => inbox.id === currentCase.inboxId);
  if (!currentInbox) {
    return redirect(getRoute('/cases/inboxes'));
  }

  return {
    case: currentCase,
    pivotObjects,
    dataModel,
    currentInbox,
    inboxes,
  };
};

export const handle = {
  BreadCrumbs: [
    // Inbox part
    ({ isLast, data }: BreadCrumbProps<CaseManagerPageLoaderData>) => {
      return (
        <BreadCrumbLink
          isLast={isLast}
          to={getRoute('/cases/inboxes/:inboxId', { inboxId: fromUUID(data.currentInbox.id) })}
        >
          {data.currentInbox.name}
        </BreadCrumbLink>
      );
    },
    ({ isLast, data }: BreadCrumbProps<CaseManagerPageLoaderData>) => {
      return (
        <>
          <BreadCrumbLink
            isLast={isLast}
            to={getRoute('/cases_new/:caseId', { caseId: fromUUID(data.case.id) })}
          >
            {data.case.name}
          </BreadCrumbLink>
          <Button type="button" variant="secondary">
            <Icon icon="arrow-up" className="size-5" />
            <span>Move to</span>
          </Button>
        </>
      );
    },
  ],
};

const drawerVariants = cva(
  ['w-[520px] h-full border-grey-90 sticky top-0 border-l', 'transition-all duration-500'],
  {
    variants: {
      expanded: {
        false: '',
        true: 'translate-x-[calc(-80vw_+_519px)] shadow-2xl',
      },
    },
  },
);
const drawerContainerVariants = cva(
  ['bg-grey-100 h-full overflow-y-hidden', 'transition-all duration-500'],
  {
    variants: {
      expanded: {
        false: 'w-[519px]',
        true: 'w-[80vw]',
      },
    },
  },
);

const createData = (fields: string[]) => {
  return R.pipe(
    fields,
    R.map((field) => [field, faker.string.sample()] as const),
    R.fromEntries(),
  );
};

const createFields = () => {
  return faker.helpers.multiple(() => faker.string.alphanumeric({ length: { min: 4, max: 15 } }), {
    count: { min: 2, max: 12 },
  });
};

export default function CaseManagerIndexPage() {
  const { case: currentCase, dataModel, pivotObjects } = useLoaderData<CaseManagerPageLoaderData>();
  const leftSidebarSharp = LeftSidebarSharpFactory.useSharp();
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [tabItem, setTabItem] = useState<TabItem | null>(null);
  const [data] = useState(() => {
    const transactionsFields = createFields();
    const accountsFields = createFields();
    const usersFields = createFields();
    const companiesFields = createFields();

    return {
      transactions: faker.helpers.multiple(
        () => ({
          object_id: faker.string.uuid(),
          ...createData(transactionsFields),
        }),
        { count: { min: 3, max: 12 } },
      ),
      accounts: faker.helpers.multiple(
        () => ({
          object_id: faker.string.uuid(),
          ...createData(accountsFields),
        }),
        { count: { min: 3, max: 12 } },
      ),
      users: faker.helpers.multiple(
        () => ({
          object_id: faker.string.uuid(),
          ...createData(usersFields),
        }),
        { count: { min: 3, max: 12 } },
      ),
      companies: faker.helpers.multiple(
        () => ({
          object_id: faker.string.uuid(),
          ...createData(companiesFields),
        }),
        { count: { min: 3, max: 12 } },
      ),
    };
  });

  useEffect(() => {
    leftSidebarSharp.actions.setExpanded(false);
  }, [leftSidebarSharp]);

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
      </Page.Header>
      <Page.Container>
        <Page.Content className="grid h-full grid-cols-[1fr_520px] overflow-x-visible p-0 lg:p-0">
          <main className="px-12 py-8">
            <h1 className="text-l">{currentCase.name}</h1>
          </main>
          {pivotObjects && pivotObjects.length > 0 ? (
            <aside className={drawerVariants({ expanded: drawerExpanded })}>
              <div className="absolute left-3 top-3 flex items-center gap-4">
                <div className="border-grey-90 flex gap-2 rounded border p-2">
                  <PanelIcon size="small" active={!drawerExpanded} />
                  <div className="border-grey-90 w-px border-l" />
                  <PanelIcon size="large" active={drawerExpanded} />
                </div>
                {drawerExpanded ? (
                  <button
                    className="flex items-center gap-2"
                    onClick={() => setDrawerExpanded(false)}
                  >
                    <Icon icon="arrow-left" className="size-6" />
                    Back
                  </button>
                ) : null}
              </div>
              <div className={drawerContainerVariants({ expanded: drawerExpanded })}>
                {!drawerExpanded || !tabItem ? (
                  <div className="w-[519px] p-8 pt-24">
                    <PivotsPanel
                      pivotObjects={pivotObjects}
                      dataModel={dataModel}
                      onExplore={(pivotValue, tableName) => {
                        setTabItem({ pivotValue, tableName });
                        setDrawerExpanded(true);
                      }}
                    />
                  </div>
                ) : (
                  <div className="min-w-[80vw] p-14 pt-20">
                    <DataModelExplorer initialTab={tabItem}>
                      {(tabState, addTab) => {
                        const tableData = data[tabState.tableName as keyof data];
                        return tableData ? (
                          <div className="overflow-x-auto">
                            <DataTable navigateTo={addTab} data={tableData} />
                          </div>
                        ) : (
                          <></>
                        );
                      }}
                    </DataModelExplorer>
                  </div>
                )}
              </div>
            </aside>
          ) : null}
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

function DataTable({
  data,
  navigateTo,
}: {
  data: Record<string, string>[];
  navigateTo: (tab: TabItem) => void;
}) {
  const columnHelper = useMemo(() => createColumnHelper<(typeof data)[number]>(), []);
  const columns = useMemo(() => {
    return Object.keys(data[0]).map((key) => {
      return columnHelper.accessor(key, {
        header: () => key,
        cell: (info) => <span className="relative line-clamp-1 px-4">{info.getValue()}</span>,
      });
    });
  }, [columnHelper, data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="mb-4 min-w-full">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="text-grey-50 h-10 text-left">
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="px-4 font-normal">
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <HoverCard key={row.id} openDelay={50} closeDelay={100}>
            <HoverCardTrigger asChild>
              <tr key={row.id} className="hover:bg-grey-98 border-grey-90 h-10 border-y">
                {row.getVisibleCells().map((cell) => (
                  <td
                    className="border-grey-90 w-fit min-w-[200px] last:border-l [&:not(:last-child)]:border-r"
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            </HoverCardTrigger>
            <HoverCardPortal>
              <HoverCardContent side="left" align="start" sideOffset={34} className="mt-1">
                <MenuCommand.Menu>
                  <MenuCommand.Trigger>
                    <Button variant="secondary" size="icon" className="absolute -left-full size-8">
                      <Icon icon="more-menu" className="size-5" />
                    </Button>
                  </MenuCommand.Trigger>
                  <MenuCommand.Content align="start" sideOffset={4}>
                    <MenuCommand.List>
                      {['transactions', 'accounts', 'users', 'companies'].map((tableName) => (
                        <MenuCommand.Item
                          key={tableName}
                          onSelect={() => {
                            navigateTo({ pivotValue: row.getValue('object_id'), tableName });
                          }}
                        >
                          Show {tableName}
                        </MenuCommand.Item>
                      ))}
                    </MenuCommand.List>
                  </MenuCommand.Content>
                </MenuCommand.Menu>
              </HoverCardContent>
            </HoverCardPortal>
          </HoverCard>
        ))}
      </tbody>
    </table>
  );
}
