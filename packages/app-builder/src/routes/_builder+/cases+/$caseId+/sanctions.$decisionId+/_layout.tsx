import { ErrorComponent, Page, TabLink } from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { casesI18n, caseStatusMapping } from '@app-builder/components/Cases';
import { CaseHistory } from '@app-builder/components/Cases/CaseHistory/CaseHistory';
import {
  RightSidebar,
  RightSidebarDisclosureContent,
  RightSidebarProvider,
  RightSidebarTab,
  RightSidebarTabContent,
} from '@app-builder/components/Cases/CaseHistory/RightSidebar';
import { SanctionStatusTag } from '@app-builder/components/Sanctions/SanctionStatusTag';
import { isForbiddenHttpError, isNotFoundHttpError } from '@app-builder/models';
import { UploadFile } from '@app-builder/routes/ressources+/files+/upload-file';
import { initServerServices } from '@app-builder/services/init.server';
import { getSanctionCheckFileUploadEndpoint } from '@app-builder/utils/files';
import { getRoute, type RouteID } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { defer, type LoaderFunctionArgs, type SerializeFrom } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Outlet,
  useLoaderData,
  useNavigate,
  useRouteError,
  useRouteLoaderData,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'navigation', ...casesI18n] satisfies Namespace,
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
    ({ isLast }: BreadCrumbProps) => {
      const { inbox } = useLoaderData<typeof loader>();

      return (
        <BreadCrumbLink
          to={getRoute('/cases/inboxes/:inboxId', {
            inboxId: fromUUIDtoSUUID(inbox.id),
          })}
          isLast={isLast}
        >
          {inbox.name}
        </BreadCrumbLink>
      );
    },
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['cases']);
      const { caseDetail } = useLoaderData<typeof loader>();
      const caseStatus = caseStatusMapping[caseDetail.status];

      return (
        <div className="flex items-center gap-2">
          <BreadCrumbLink
            to={getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(caseDetail.id) })}
            isLast={isLast}
          >
            <span className="line-clamp-2 text-start">{t('cases:case.page_title')}</span>
          </BreadCrumbLink>
          <span className="text-s border-grey-90 text-grey-50 inline-flex gap-2 rounded border px-2 font-normal">
            <span className="font-medium">ID</span>
            <span className="text-rtl max-w-20 truncate">{caseDetail.id}</span>
          </span>
          <Tag color={caseStatus.color!}>{t(caseStatus.tKey)}</Tag>
        </div>
      );
    },
    ({ isLast }: BreadCrumbProps) => {
      const { caseDetail, decision, sanctionCheck } = useLoaderData<typeof loader>();

      return (
        <div className="flex items-center gap-2">
          <BreadCrumbLink
            to={getRoute('/cases/:caseId/sanctions/:decisionId', {
              caseId: fromUUIDtoSUUID(caseDetail.id),
              decisionId: fromUUIDtoSUUID(decision.id),
            })}
            isLast={isLast}
          >
            <span className="line-clamp-2 text-start">Sanction check</span>
          </BreadCrumbLink>
          <SanctionStatusTag status={sanctionCheck.status} />
        </div>
      );
    },
  ],
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const {
    user,
    entitlements,
    cases,
    dataModelRepository,
    inbox,
    sanctionCheck: sanctionCheckRepository,
  } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const caseId = fromParams(params, 'caseId');
  const decisionId = fromParams(params, 'decisionId');

  try {
    const caseDetail = await cases.getCase({ caseId });
    const decision = caseDetail.decisions.find((d) => d.id === decisionId);
    const sanctionCheck = (await sanctionCheckRepository.listSanctionChecks({ decisionId }))[0];
    const currentInbox = await inbox.getInbox(caseDetail.inboxId);

    if (!decision || !sanctionCheck) {
      throw new Response(null, { status: 404, statusText: 'Not Found' });
    }

    return defer({
      inbox: currentInbox,
      caseDetail,
      decision,
      user,
      entitlements,
      sanctionCheck,
      dataModel: await dataModelRepository.getDataModel(),
      pivots: await dataModelRepository.listPivots({}),
    });
  } catch (error) {
    // On purpuse catch 403 errors to display a 404 page
    if (isNotFoundHttpError(error) || isForbiddenHttpError(error)) {
      throw new Response(null, { status: 404, statusText: 'Not Found' });
    } else {
      throw error;
    }
  }
}

export function useCurrentCase() {
  return useRouteLoaderData(
    'routes/_builder+/cases+/$caseId+/sanctions.$decisionId+/_layout' satisfies RouteID,
  ) as SerializeFrom<typeof loader>;
}

export default function CaseSanctionReviewPage() {
  const { t } = useTranslation(handle.i18n);
  const { caseDetail, sanctionCheck } = useLoaderData<typeof loader>();

  return (
    <Page.Main>
      <Page.Header className="justify-between gap-8">
        <div className="flex gap-4">
          <Page.BackLink
            to={getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(caseDetail.id) })}
          />
          <BreadCrumbs />
        </div>
      </Page.Header>
      <div className="flex size-full flex-col overflow-hidden">
        <div className="flex flex-1 flex-row overflow-hidden">
          <Page.Container>
            <Page.Content className="max-w-screen-xl">
              <nav>
                <ul className="bg-grey-100 border-grey-90 inline-flex flex-row gap-2 rounded-lg border p-1">
                  <li>
                    <TabLink
                      labelTKey="navigation:case_manager.hits"
                      to="./hits"
                      Icon={(props) => <Icon {...props} icon="tip" />}
                    />
                  </li>
                  <li>
                    <TabLink
                      labelTKey="navigation:case_manager.files"
                      to="./files"
                      Icon={(props) => <Icon {...props} icon="attachment" />}
                    />
                  </li>
                </ul>
              </nav>
              <Outlet />
            </Page.Content>
          </Page.Container>

          <RightSidebarProvider>
            <RightSidebar>
              <RightSidebarTab
                activeId="history"
                icon="history"
                label={t('cases:case_detail.history')}
              />
            </RightSidebar>
            <RightSidebarDisclosureContent>
              <RightSidebarTabContent activeId="history">
                <CaseHistory events={caseDetail.events} />
              </RightSidebarTabContent>
            </RightSidebarDisclosureContent>
          </RightSidebarProvider>
        </div>
        <div className="bg-grey-100 border-t-grey-90 flex shrink-0 flex-row items-center justify-end gap-4 border-t p-4">
          <UploadFile uploadFileEndpoint={getSanctionCheckFileUploadEndpoint(sanctionCheck)}>
            <Button className="h-14 w-fit whitespace-nowrap" variant="secondary">
              <Icon icon="attachment" className="size-5" />
              {t('cases:add_file')}
            </Button>
          </UploadFile>
        </div>
      </div>
    </Page.Main>
  );
}

export function ErrorBoundary() {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="m-auto flex flex-col items-center gap-4">
        {t('common:errors.not_found')}
        <div className="mb-1">
          <Button onClick={() => navigate(-1)}>{t('common:go_back')}</Button>
        </div>
      </div>
    );
  }

  return <ErrorComponent error={error} />;
}
