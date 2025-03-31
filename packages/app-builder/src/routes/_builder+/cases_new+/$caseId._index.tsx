import { Page } from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { CaseDetails } from '@app-builder/components/Cases/New/CaseDetails';
import { LeftSidebarSharpFactory } from '@app-builder/components/Layout/LeftSidebar';
import { type CurrentUser } from '@app-builder/models';
import { type CaseDetail } from '@app-builder/models/cases';
import { type Inbox } from '@app-builder/models/inbox';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

type CaseManagerPageLoaderData = {
  case: CaseDetail;
  currentInbox: Inbox;
  currentUser: CurrentUser;
  inboxes: Inbox[];
};

export const loader = async ({
  request,
  params,
}: LoaderFunctionArgs): Promise<CaseManagerPageLoaderData | Response> => {
  const { authService } = initServerServices(request);
  const { cases, inbox, user } = await authService.isAuthenticated(request, {
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
    currentUser: user,
    inboxes,
  };
};

export const handle = {
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);

      return (
        <BreadCrumbLink to={getRoute('/cases')} isLast={isLast}>
          <Icon icon="case-manager" className="me-2 size-6" />
          {t('navigation:case_manager')}
        </BreadCrumbLink>
      );
    },
    ({ isLast, data }: BreadCrumbProps<CaseManagerPageLoaderData>) => {
      return (
        <BreadCrumbLink
          to={getRoute('/cases/inboxes/:inboxId', {
            inboxId: fromUUID(data.currentInbox.id),
          })}
          isLast={isLast}
        >
          {data.currentInbox.name}
        </BreadCrumbLink>
      );
    },
    ({ isLast, data }: BreadCrumbProps<CaseManagerPageLoaderData>) => {
      return (
        <BreadCrumbLink
          isLast={isLast}
          to={getRoute('/cases_new/:caseId', { caseId: fromUUID(data.case.id) })}
        >
          {data.case.name}
        </BreadCrumbLink>
      );
    },
  ],
};

export default function CaseManagerIndexPage() {
  const { case: details, inboxes, currentUser } = useLoaderData<CaseManagerPageLoaderData>();
  const leftSidebarSharp = LeftSidebarSharpFactory.useSharp();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    leftSidebarSharp.actions.setExpanded(false);
  }, [leftSidebarSharp]);

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
        <Button variant="secondary" size="medium">
          <span className="text-xs font-medium">Go to the next unassigned case</span>
          <Icon icon="arrow-up" className="size-5 rotate-90" />
        </Button>
      </Page.Header>
      <Page.Container ref={containerRef}>
        <Page.Content className="grid h-full grid-cols-[1fr_520px] p-0 lg:p-0">
          <CaseDetails
            detail={details}
            containerRef={containerRef}
            inboxes={inboxes}
            currentUser={currentUser}
          />
          <aside className="border-grey-90 bg-grey-100 sticky top-0 border-l p-8"></aside>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
