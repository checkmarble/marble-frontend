import { casesI18n, ErrorComponent, Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { DecisionPanel } from '@app-builder/components/CaseManager/DecisionPanel/DecisionPanel';
import { CaseManagerDrawer } from '@app-builder/components/CaseManager/Drawer/Drawer';
import { PivotsPanel } from '@app-builder/components/CaseManager/PivotsPanel/PivotsPanel';
import { SnoozePanel } from '@app-builder/components/CaseManager/SnoozePanel/SnoozePanel';
import { CaseDetails } from '@app-builder/components/Cases/CaseDetails';
import { CaseReviewsModal } from '@app-builder/components/Cases/CaseReviewsModal';
import { DataModelExplorerProvider } from '@app-builder/components/DataModelExplorer/Provider';
import { LeftSidebarSharpFactory } from '@app-builder/components/Layout/LeftSidebar';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { caseDetailMiddleware } from '@app-builder/middlewares/case-detail-middleware';
import {
  type DataModelWithTableOptions,
  isNotFoundHttpError,
  mergeDataModelWithTableOptions,
  type TableModelWithOptions,
} from '@app-builder/models';
import { type CaseReview, DetailedCaseDecision } from '@app-builder/models/cases';
import { type DataModelObject } from '@app-builder/models/data-model';
import { getNextUnassignedCaseFn } from '@app-builder/server-fns/cases';
import { getPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookie-read.server';
import { setPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookies-write';
import * as Sentry from '@sentry/react';
import { ClientOnly, createFileRoute } from '@tanstack/react-router';
import { createServerFn, useServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { match } from 'ts-pattern';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

const scenarioCaseDetailLoader = createServerFn()
  .middleware([authMiddleware, caseDetailMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function scenarioCaseDetailLoader({ context }) {
    const request = getRequest();
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

    const dataModelWithTableOptions: DataModelWithTableOptions = await Promise.all(
      dataModel.map<Promise<TableModelWithOptions>>((table) =>
        dataModelRepository.getDataModelTableOptions(table.id).then((options) => {
          return mergeDataModelWithTableOptions(table, options);
        }),
      ),
    );

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
      dataModelWithTableOptions,
      currentInbox: caseInbox,
      reports,
      currentUser: user,
      inboxes: context.inboxes,
      pivots,
      entitlements,
      isMenuExpanded: getPreferencesCookie(request, 'menuExpd'),
      mostRecentReview: review,
      isKycEnrichmentEnabled: settings.kycEnrichmentSetting.enabled,
    };
  });

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId')({
  loader: ({ params }) => scenarioCaseDetailLoader({ data: { params } }),
  errorComponent: ({ error }) => {
    const navigate = useAgnosticNavigation();
    const { t } = useTranslation(casesI18n);
    Sentry.captureException(error);

    if (isNotFoundHttpError(error)) {
      return (
        <div className="m-auto flex flex-col items-center gap-4">
          {t('common:errors.not_found')}
          <div className="mb-1">
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
    dataModelWithTableOptions,
    pivotObjects,
    currentUser,
    currentInbox,
    entitlements,
    isMenuExpanded,
    mostRecentReview,
    isKycEnrichmentEnabled,
    reports,
  } = Route.useLoaderData();
  const { caseAiAssist: aiAssistEnabled } = entitlements;
  const { t } = useTranslation(casesI18n);
  const getNextUnassignedCase = useServerFn(getNextUnassignedCaseFn);
  const leftSidebarSharp = LeftSidebarSharpFactory.useSharp();
  const [selectedDecision, selectDecision] = useState<DetailedCaseDecision | null>(null);
  const [drawerContentMode, setDrawerContentMode] = useState<'pivot' | 'decision' | 'snooze'>('pivot');

  useEffect(() => {
    if (isMenuExpanded) {
      leftSidebarSharp.actions.setExpanded(false);
      setPreferencesCookie('menuExpd', false);
    }
  }, [isMenuExpanded, leftSidebarSharp]);

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
        <div className="flex items-center gap-2">
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
          <Button variant="secondary" onClick={() => getNextUnassignedCase({ data: { caseId: details.id } })}>
            {t('cases:next_unassigned_case')}
            <Icon icon="arrow-up" className="size-3.5 rotate-90" />
          </Button>
        </div>
      </Page.Header>
      <Page.Container className="text-default relative h-full flex-row p-0 lg:p-0">
        <CaseDetails
          key={details.id}
          caseDetail={details}
          currentUser={currentUser}
          selectDecision={selectDecision}
          drawerContentMode={drawerContentMode}
          setDrawerContentMode={setDrawerContentMode}
          caseReview={mostRecentReview}
          dataModel={dataModelWithTableOptions}
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
                    dataModel={dataModelWithTableOptions}
                    pivotObjects={pivotObjects ?? []}
                    reviewProofs={mostRecentReview?.proofs ?? []}
                    isKycEnrichmentEnabled={isKycEnrichmentEnabled}
                  />
                );
              })
              .with('decision', () =>
                !selectedDecision ? null : (
                  <DecisionPanel
                    key={details.id}
                    decision={selectedDecision}
                    setDrawerContentMode={setDrawerContentMode}
                    dataModel={dataModelWithTableOptions}
                  />
                ),
              )
              .with('snooze', () => (
                <SnoozePanel
                  key={details.id}
                  setDrawerContentMode={setDrawerContentMode}
                  caseDetail={details}
                  dataModelWithTableOptions={dataModelWithTableOptions}
                  pivotObjects={pivotObjects ?? []}
                  entitlements={entitlements}
                />
              ))
              .exhaustive()}
          </CaseManagerDrawer>
        </DataModelExplorerProvider>
      </Page.Container>
    </Page.Main>
  );
}
