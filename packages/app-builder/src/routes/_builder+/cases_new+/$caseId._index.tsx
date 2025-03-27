import { Page } from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { PanelIcon } from '@app-builder/components/CaseManager/PivotsPanel/PanelIcon';
import { PivotsPanel } from '@app-builder/components/CaseManager/PivotsPanel/PivotsPanel';
import { DataModelExplorer } from '@app-builder/components/DataModelExplorer/DataModelExplorer';
import { LeftSidebarSharpFactory } from '@app-builder/components/Layout/LeftSidebar';
import { type CaseDetail, type PivotObject } from '@app-builder/models/cases';
import { type Inbox } from '@app-builder/models/inbox';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { cva } from 'class-variance-authority';
import { useEffect, useState } from 'react';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

type CaseManagerPageLoaderData = {
  case: CaseDetail;
  pivotObjects: PivotObject[] | null;
  currentInbox: Inbox;
  inboxes: Inbox[];
};

export const loader = async ({
  request,
  params,
}: LoaderFunctionArgs): Promise<CaseManagerPageLoaderData | Response> => {
  const { authService } = initServerServices(request);
  const { cases, inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const caseId = fromParams(params, 'caseId');

  // Get case by ID
  const [currentCase, inboxes, pivotObjects] = await Promise.all([
    cases.getCase({ caseId }),
    inbox.listInboxes(),
    cases.listPivotObjects({ caseId }),
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

export default function CaseManagerIndexPage() {
  const { case: currentCase, pivotObjects } = useLoaderData<CaseManagerPageLoaderData>();
  const leftSidebarSharp = LeftSidebarSharpFactory.useSharp();
  const [drawerExpanded, setDrawerExpanded] = useState(false);

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
              <div className="border-grey-90 absolute left-3 top-3 flex gap-2 rounded border p-2">
                <PanelIcon
                  size="small"
                  active={!drawerExpanded}
                  onClick={() => setDrawerExpanded(false)}
                />
                <div className="border-grey-90 w-px border-l" />
                <PanelIcon
                  size="large"
                  active={drawerExpanded}
                  onClick={() => setDrawerExpanded(true)}
                />
              </div>
              <div className={drawerContainerVariants({ expanded: drawerExpanded })}>
                {!drawerExpanded ? (
                  <div className="w-[519px] p-8 pt-24">
                    <PivotsPanel pivotObjects={pivotObjects} />
                  </div>
                ) : (
                  <div className="min-w-[80vw] p-8 pt-24">
                    <DataModelExplorer>
                      {(tabState) => <>{JSON.stringify(tabState)}</>}
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
