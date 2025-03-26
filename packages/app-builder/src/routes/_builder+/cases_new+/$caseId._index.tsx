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
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useEffect } from 'react';
import { Button, Select } from 'ui-design-system';
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
    ({ data }: BreadCrumbProps<CaseManagerPageLoaderData>) => {
      const navigate = useNavigate();

      return (
        <Select.Root
          value={data.currentInbox.id}
          onValueChange={(id) =>
            navigate(getRoute('/cases/inboxes/:inboxId', { inboxId: fromUUID(id) }))
          }
        >
          <Select.Trigger>
            <span className="text-s text-grey-00 inline-flex w-full items-center gap-2 text-center font-medium">
              <span>{data.currentInbox.name}</span>
              <Icon icon="arrow-left" className="size-5 -rotate-90" />
            </span>
          </Select.Trigger>
          <Select.Content className="max-h-60">
            <Select.Viewport>
              {data.inboxes.map(({ id, name }) => (
                <Select.Item className="flex min-w-[110px] flex-col gap-1" key={id} value={id}>
                  {name}
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Root>
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
