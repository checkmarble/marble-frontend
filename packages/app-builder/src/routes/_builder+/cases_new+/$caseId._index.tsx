import { Page } from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { LeftSidebarSharpFactory } from '@app-builder/components/Layout/LeftSidebar';
import { type CaseDetail } from '@app-builder/models/cases';
import { type Inbox } from '@app-builder/models/inbox';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

type CaseManagerPageLoaderData = {
  case: CaseDetail;
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
  const [currentCase, inboxes] = await Promise.all([
    cases.getCase({ caseId }),
    inbox.listInboxes(),
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

export default function CaseManagerIndexPage() {
  const { case: currentCase } = useLoaderData<CaseManagerPageLoaderData>();
  const leftSidebarSharp = LeftSidebarSharpFactory.useSharp();

  useEffect(() => {
    leftSidebarSharp.actions.setExpanded(false);
  }, [leftSidebarSharp]);

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
      </Page.Header>
      <Page.Container>
        <Page.Content className="grid h-full grid-cols-[1fr_520px] p-0 lg:p-0">
          <main className="px-12 py-8">
            <h1 className="text-l">{currentCase.name}</h1>
          </main>
          <aside className="border-grey-90 bg-grey-100 sticky top-0 border-l p-8"></aside>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
