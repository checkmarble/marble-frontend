import { Page, TabLink } from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { CaseStatusBadge, casesI18n } from '@app-builder/components/Cases';
import { UploadFile } from '@app-builder/components/Files/UploadFile';
import { SanctionStatusTag } from '@app-builder/components/Sanctions/SanctionStatusTag';
import { isForbiddenHttpError, isNotFoundHttpError } from '@app-builder/models';
import { useUploadScreeningFile } from '@app-builder/queries/upload-screening-file';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute, type RouteID } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { defer, type LoaderFunctionArgs, type SerializeFrom } from '@remix-run/node';
import { Outlet, useLoaderData, useRouteLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
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

      return (
        <div className="flex items-center gap-2">
          <BreadCrumbLink
            to={getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(caseDetail.id) })}
            isLast={isLast}
          >
            <span className="line-clamp-2 text-start">{t('cases:case.page_title')}</span>
          </BreadCrumbLink>
          <span className="text-s border-grey-90 text-grey-50 inline-flex gap-2 rounded-sm border px-2 font-normal">
            <span className="font-medium">ID</span>
            <span className="text-rtl max-w-20 truncate">{caseDetail.id}</span>
          </span>
          <CaseStatusBadge status={caseDetail.status} outcome={caseDetail.outcome} />
        </div>
      );
    },
    ({ isLast }: BreadCrumbProps) => {
      const { caseDetail, decision, sanctionCheck } = useLoaderData<typeof loader>();

      return (
        <div className="flex items-center gap-2">
          <BreadCrumbLink
            to={getRoute('/cases/:caseId/d/:decisionId/screenings/:screeningId', {
              caseId: fromUUIDtoSUUID(caseDetail.id),
              decisionId: fromUUIDtoSUUID(decision.id),
              screeningId: fromUUIDtoSUUID(sanctionCheck.id),
            })}
            isLast={isLast}
          >
            <span className="line-clamp-2 text-start">{sanctionCheck.config.name}</span>
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
  const screeningId = fromParams(params, 'screeningId');

  try {
    const caseDetail = await cases.getCase({ caseId });
    const decision = caseDetail.decisions.find((d) => d.id === decisionId);
    const sanctionChecks = await sanctionCheckRepository.listSanctionChecks({ decisionId });
    const currentInbox = await inbox.getInbox(caseDetail.inboxId);
    const sanctionCheck = sanctionChecks.find((s) => s.id === screeningId);

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
    'routes/_builder+/cases+/$caseId+/d+/$decisionId+/screenings+/$screeningId+/_layout' satisfies RouteID,
  ) as SerializeFrom<typeof loader>;
}

export default function CaseSanctionReviewPage() {
  const { t } = useTranslation(handle.i18n);
  const { caseDetail, sanctionCheck } = useLoaderData<typeof loader>();
  const { mutateAsync: uploadScreeningFile } = useUploadScreeningFile(sanctionCheck.id);

  return (
    <Page.Main>
      <Page.Header className="justify-between gap-8">
        <BreadCrumbs
          back={getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(caseDetail.id) })}
        />
      </Page.Header>
      <div className="flex size-full flex-col overflow-hidden">
        <Page.Container>
          <Page.Content className="max-w-(--breakpoint-xl)">
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
        <div className="bg-grey-100 border-t-grey-90 flex shrink-0 flex-row items-center justify-end gap-4 border-t p-4">
          <UploadFile uploadFileEndpoint={uploadScreeningFile}>
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
