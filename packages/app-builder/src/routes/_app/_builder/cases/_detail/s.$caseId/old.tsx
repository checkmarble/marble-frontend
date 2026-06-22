import { casesI18n, ErrorComponent, Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { CaseManagerDrawer } from '@app-builder/components/CaseManager/Drawer/Drawer';
import { PivotsPanel } from '@app-builder/components/CaseManager/PivotsPanel/PivotsPanel';
import { SnoozePanel } from '@app-builder/components/CaseManager/SnoozePanel/SnoozePanel';
import { CaseDetails } from '@app-builder/components/Cases/CaseDetails';
import { CaseReviewsModal } from '@app-builder/components/Cases/CaseReviewsModal';
import { DataModelExplorerProvider } from '@app-builder/components/DataModelExplorer/Provider';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { caseDetailMiddleware } from '@app-builder/middlewares/case-detail-middleware';
import { isNotFoundHttpError } from '@app-builder/models';
import { type CaseReview } from '@app-builder/models/cases';
import { type DataModelObject } from '@app-builder/models/data-model';
import { getNextUnassignedCaseFn } from '@app-builder/server-fns/cases';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/react';
import { ClientOnly, createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn, useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { match } from 'ts-pattern';
import { Button, CtaV2ClassName, cn, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import z from 'zod';

const scenarioCaseDetailLoader = createServerFn()
  .middleware([authMiddleware, caseDetailMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function scenarioCaseDetailLoader({ context }) {
    const { cases: caseRepository, dataModelRepository, aiAssistSettings, user, entitlements } = context.authInfo;
    const { detail: caseDetail, inbox: caseInbox } = context.case;
    const caseId = caseDetail.id;

    const [reports, pivotObjects, dataModel, pivots, mostRecentReviews, settings] = await Promise.all([
      caseRepository.listSuspiciousActivityReports({ caseId }),
      caseRepository.listPivotObjects({ caseId }),
      dataModelRepository.getDataModel(),
      dataModelRepository.listPivots({}),
      caseRepository.getMostRecentCaseReview({ caseId }),
      aiAssistSettings.getAiAssistSettings(),
    ]);

    let review: (CaseReview & { proofs: { type: string; object: DataModelObject }[] }) | null = null;
    if (mostRecentReviews.length > 0 && mostRecentReviews[0]) {
      const mostRecentReview = mostRecentReviews[0];

      const fetchedProofs = R.pipe(
        mostRecentReview.review.proofs,
        R.filter((proof) => proof.origin === 'data_model'),
        R.map((proof) =>
          dataModelRepository
            .getIngestedObject(proof.type, proof.id)
            .then((dataModelObject) => ({ type: proof.type, object: dataModelObject })),
        ),
      );

      const proofsSettled = await Promise.allSettled(fetchedProofs);
      const proofs = R.pipe(
        proofsSettled,
        R.filter((result) => result.status === 'fulfilled'),
        R.map((result) => result.value),
      );

      review = {
        ...mostRecentReview,
        proofs,
      };
    }

    return {
      case: caseDetail,
      pivotObjects,
      dataModel,
      currentInbox: caseInbox,
      reports,
      currentUser: user,
      inboxes: context.inboxes,
      pivots,
      entitlements,
      mostRecentReview: review,
      isKycEnrichmentEnabled: settings.kycEnrichmentSetting.enabled,
    };
  });

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/old')({
  validateSearch: z.object({ fromInbox: z.string().optional() }),
  loaderDeps: ({ search: { fromInbox } }) => ({ fromInbox }),
  loader: ({ params }) => scenarioCaseDetailLoader({ data: { params } }),
  errorComponent: ({ error }) => {
    const navigate = useAgnosticNavigation();
    const { t } = useTranslation(casesI18n);
    Sentry.captureException(error);

    if (isNotFoundHttpError(error)) {
      return (
        <div className="m-auto flex flex-col items-center gap-md">
          {t('common:errors.not_found')}
          <div className="mb-xs">
            <Button variant="primary" onClick={() => navigate(-1)}>
              {t('common:go_back')}
            </Button>
          </div>
        </div>
      );
    }

    return <ErrorComponent error={error} />;
  },
  component: CaseManagerIndexPage,
});

function CaseManagerIndexPage() {
  const {
    case: details,
    dataModel,
    pivotObjects,
    currentUser,
    currentInbox,
    entitlements,
    mostRecentReview,
    isKycEnrichmentEnabled,
    reports,
  } = Route.useLoaderData();
  const { fromInbox } = Route.useSearch();
  const { caseAiAssist: aiAssistEnabled } = entitlements;
  const { t } = useTranslation(casesI18n);
  const getNextUnassignedCase = useServerFn(getNextUnassignedCaseFn);
  const router = useRouter();
  const nextUnassignedCaseHref = router.buildLocation({
    to: '/ressources/cases/next-unassigned/$caseId',
    params: { caseId: fromUUIDtoSUUID(details.id) },
  }).href;
  const [drawerContentMode, setDrawerContentMode] = useState<'pivot' | 'snooze'>('pivot');

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs back={`/cases/inboxes/${fromInbox ?? MY_INBOX_ID}`} />
        <div className="flex items-center gap-sm">
          <Modal.Root>
            {aiAssistEnabled === 'allowed' ? (
              <Modal.Trigger asChild>
                <Button variant="secondary">
                  <Icon icon="case-manager" className="size-3.5" />
                  AI assist
                </Button>
              </Modal.Trigger>
            ) : null}

            <ClientOnly>
              <Modal.Content size="large" className="max-h-[80vh]">
                <Modal.Title className="sr-only">{t('cases:case.ai_reviews.title')}</Modal.Title>
                <CaseReviewsModal caseId={details.id} canManuallyReview={currentInbox.caseReviewManual} />
              </Modal.Content>
            </ClientOnly>
          </Modal.Root>
          <a
            href={nextUnassignedCaseHref}
            className={cn(CtaV2ClassName({ variant: 'secondary' }), 'hover:bg-grey-background')}
            onClick={(e) => {
              // let modified clicks (cmd/ctrl/shift/alt) reach the browser to open a new tab
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              getNextUnassignedCase({ data: { caseId: details.id } });
            }}
          >
            {t('cases:next_unassigned_case')}
            <Icon icon="arrow-up" className="size-3.5 rotate-90" />
          </a>
        </div>
      </Page.Header>
      <div className="relative text-default h-full flex flex-row p-0 lg:p-0 z-0">
        <CaseDetails
          key={details.id}
          caseDetail={details}
          currentUser={currentUser}
          setDrawerContentMode={setDrawerContentMode}
          caseReview={mostRecentReview}
          dataModel={dataModel}
          reports={reports}
        />
        <DataModelExplorerProvider>
          <CaseManagerDrawer>
            {match(drawerContentMode)
              .with('pivot', () => {
                if (!pivotObjects && !mostRecentReview?.proofs.length) return null;

                return (
                  <PivotsPanel
                    key={details.id}
                    currentUser={currentUser}
                    case={details}
                    dataModel={dataModel}
                    pivotObjects={pivotObjects ?? []}
                    reviewProofs={mostRecentReview?.proofs ?? []}
                    isKycEnrichmentEnabled={isKycEnrichmentEnabled}
                  />
                );
              })
              .with('snooze', () => (
                <SnoozePanel
                  key={details.id}
                  setDrawerContentMode={setDrawerContentMode}
                  caseDetail={details}
                  dataModel={dataModel}
                  pivotObjects={pivotObjects ?? []}
                  entitlements={entitlements}
                />
              ))
              .exhaustive()}
          </CaseManagerDrawer>
        </DataModelExplorerProvider>
      </div>
    </Page.Main>
  );
}
