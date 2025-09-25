import { CopyToClipboardButton, casesI18n, ErrorComponent, Page } from '@app-builder/components';
import { AiAssist } from '@app-builder/components/AiAssist';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { DecisionPanel } from '@app-builder/components/CaseManager/DecisionPanel/DecisionPanel';
import { CaseManagerDrawer } from '@app-builder/components/CaseManager/Drawer/Drawer';
import { PivotsPanel } from '@app-builder/components/CaseManager/PivotsPanel/PivotsPanel';
import { SnoozePanel } from '@app-builder/components/CaseManager/SnoozePanel/SnoozePanel';
import { CaseDetails } from '@app-builder/components/Cases/CaseDetails';
import { DataModelExplorerProvider } from '@app-builder/components/DataModelExplorer/Provider';
import { LeftSidebarSharpFactory } from '@app-builder/components/Layout/LeftSidebar';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  type DataModelWithTableOptions,
  isNotFoundHttpError,
  mergeDataModelWithTableOptions,
  type TableModelWithOptions,
} from '@app-builder/models';
import { DetailedCaseDecision } from '@app-builder/models/cases';
import { useEnqueueCaseReviewMutation } from '@app-builder/queries/ask-case-review';
import { initServerServices } from '@app-builder/services/init.server';
import { badRequest } from '@app-builder/utils/http/http-responses';
import { parseIdParamSafe } from '@app-builder/utils/input-validation';
import { getPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookie-read.server';
import { setPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookies-write';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect, type SerializeFrom } from '@remix-run/node';
import {
  defer,
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useNavigate,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { ClientOnly } from 'remix-utils/client-only';
import { match } from 'ts-pattern';
import {
  Button,
  ButtonV2,
  CtaV2ClassName,
  cn,
  Markdown,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'ui-design-system';
import { Icon } from 'ui-icons';
import { MY_INBOX_ID } from '../_index';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);
  const { aiAssistSettings, cases, inbox, user, dataModelRepository, entitlements } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  const parsedResult = await parseIdParamSafe(params, 'caseId');
  if (!parsedResult.success) {
    return badRequest('Invalid UUID');
  }
  const { caseId } = parsedResult.data;
  const [toastSession, t] = await Promise.all([
    getSession(request),
    getFixedT(request, ['common', 'cases']),
  ]);

  const [currentCase, inboxes] = await Promise.all([
    cases.getCase({ caseId }).catch(async (err) => {
      if (isNotFoundHttpError(err)) {
        setToastMessage(toastSession, {
          type: 'error',
          message: t('cases:errors.case_not_found'),
        });

        throw redirect(getRoute('/cases/inboxes/:inboxId', { inboxId: MY_INBOX_ID }), {
          headers: { 'Set-Cookie': await commitSession(toastSession) },
        });
      }
      throw err;
    }),
    inbox.listInboxes(),
  ]);

  const currentInbox = inboxes.find((inbox) => inbox.id === currentCase.inboxId);
  if (!currentInbox) {
    return redirect(getRoute('/cases/inboxes/:inboxId', { inboxId: MY_INBOX_ID }));
  }

  const [nextCaseId, reports, pivotObjects, dataModel, pivots, mostRecentReviews, settings] =
    await Promise.all([
      cases.getNextUnassignedCaseId({ caseId }),
      cases.listSuspiciousActivityReports({ caseId }),
      cases.listPivotObjects({ caseId }),
      dataModelRepository.getDataModel(),
      dataModelRepository.listPivots({}),
      cases.getMostRecentCaseReview({ caseId }),
      aiAssistSettings.getAiAssistSettings(),
    ]);

  const dataModelWithTableOptions: DataModelWithTableOptions = await Promise.all(
    dataModel.map<Promise<TableModelWithOptions>>((table) =>
      dataModelRepository.getDataModelTableOptions(table.id).then((options) => {
        return mergeDataModelWithTableOptions(table, options);
      }),
    ),
  );

  let review: any = null;
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

  return defer({
    case: currentCase,
    pivotObjects,
    dataModelWithTableOptions,
    currentInbox,
    reports,
    currentUser: user,
    nextCaseId,
    inboxes,
    pivots,
    entitlements,
    isMenuExpanded: getPreferencesCookie(request, 'menuExpd'),
    mostRecentReview: review,
    isKycEnrichmentEnabled: settings.kycEnrichmentSetting.enabled,
  });
};

export const handle = {
  i18n: ['common', 'cases', 'decisions'] satisfies Namespace,
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
    ({ isLast, data }: BreadCrumbProps<SerializeFrom<typeof loader>>) => {
      return (
        <BreadCrumbLink
          to={getRoute('/cases/inboxes/:inboxId', {
            inboxId: fromUUIDtoSUUID(data.currentInbox.id),
          })}
          isLast={isLast}
        >
          {data.currentInbox.name}
        </BreadCrumbLink>
      );
    },
    ({ isLast, data }: BreadCrumbProps<SerializeFrom<typeof loader>>) => {
      const caseDetail = data.case; // Safely access caseDetail from the loader data

      return (
        <div className="flex items-center gap-4">
          <BreadCrumbLink
            to={getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(caseDetail.id) })}
            isLast={isLast}
          >
            <span className="line-clamp-2 text-start">{caseDetail.name}</span>
          </BreadCrumbLink>
          <CopyToClipboardButton toCopy={caseDetail.id}>
            <span className="text-small flex max-w-40 gap-1 font-normal">
              <span className="shrink-0 font-medium">ID</span>{' '}
              <span className="text-rtl truncate">{caseDetail.id}</span>
            </span>
          </CopyToClipboardButton>
        </div>
      );
    },
  ],
};

export default function CaseManagerIndexPage() {
  const {
    case: details,
    dataModelWithTableOptions,
    pivotObjects,
    currentUser,
    nextCaseId,
    entitlements: { AiAssist: aiAssistEnabled },
    isMenuExpanded,
    mostRecentReview,
    isKycEnrichmentEnabled,
  } = useLoaderData<typeof loader>();
  const { t } = useTranslation(casesI18n);
  const navigate = useNavigate();
  const leftSidebarSharp = LeftSidebarSharpFactory.useSharp();
  const [selectedDecision, selectDecision] = useState<DetailedCaseDecision | null>(null);
  const [drawerContentMode, setDrawerContentMode] = useState<'pivot' | 'decision' | 'snooze'>(
    'pivot',
  );
  const enqueueReviewMutation = useEnqueueCaseReviewMutation();
  const [hasRequestedReview, setHasRequestedReview] = useState(false);

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
          <AiAssist.Root>
            {aiAssistEnabled === 'allowed' ? (
              <AiAssist.Trigger>
                <ButtonV2 variant="secondary">
                  <Icon icon="case-manager" className="size-3.5" />
                  AI assist
                </ButtonV2>
              </AiAssist.Trigger>
            ) : null}

            <ClientOnly>
              {() => (
                <AiAssist.Content>
                  <div className="p-4 h-full flex flex-col gap-2 justify-between">
                    <div className="border border-grey-90 rounded-md p-2 grow min-h-0">
                      {mostRecentReview
                        ? (() => {
                            return (
                              <div className="flex flex-col gap-2 h-full text-default">
                                <Tabs defaultValue="review" className="flex flex-col h-full gap-2">
                                  <TabsList className="self-start">
                                    <TabsTrigger value="review" className="flex items-center gap-2">
                                      {t('cases:case.ai_assist.review')}
                                      <Icon
                                        icon={mostRecentReview.review.ok ? 'tick' : 'cross'}
                                        className={cn(
                                          'size-5',
                                          mostRecentReview.review.ok
                                            ? 'text-green-34'
                                            : 'text-red-47',
                                        )}
                                      />
                                    </TabsTrigger>
                                    {!mostRecentReview.review.ok ? (
                                      <TabsTrigger value="sanityCheck">
                                        {t('cases:case.ai_assist.sanity_check')}
                                      </TabsTrigger>
                                    ) : null}
                                  </TabsList>
                                  <TabsContent
                                    value="review"
                                    className="min-h-0 p-2 overflow-scroll"
                                  >
                                    <Markdown>{mostRecentReview.review.output}</Markdown>
                                  </TabsContent>
                                  {!mostRecentReview.ok ? (
                                    <TabsContent
                                      value="sanityCheck"
                                      className="min-h-0 p-2 overflow-scroll"
                                    >
                                      <Markdown>{mostRecentReview.review.sanityCheck}</Markdown>
                                    </TabsContent>
                                  ) : null}
                                </Tabs>
                              </div>
                            );
                          })()
                        : null}
                    </div>
                    <div className="flex gap-2">
                      <ButtonV2
                        variant="secondary"
                        onClick={() => {
                          enqueueReviewMutation.mutate(details.id);
                          setHasRequestedReview(true);
                        }}
                        disabled={hasRequestedReview}
                      >
                        <Icon icon="case-manager" className="size-5" />
                        {hasRequestedReview
                          ? 'Review will be ready in a few minutes, refresh to see it'
                          : 'Generate Review'}
                      </ButtonV2>
                      <Link
                        className={CtaV2ClassName({ variant: 'secondary', mode: 'normal' })}
                        reloadDocument
                        to={getRoute('/ressources/cases/download-data/:caseId', {
                          caseId: details.id,
                        })}
                      >
                        <Icon icon="download" className="size-5" />
                        {t('cases:case.file.download')}
                      </Link>
                    </div>
                  </div>
                </AiAssist.Content>
              )}
            </ClientOnly>
          </AiAssist.Root>
          {nextCaseId ? (
            <ButtonV2
              variant="secondary"
              onClick={() =>
                navigate(getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(nextCaseId) }))
              }
            >
              {t('cases:next_unassigned_case')}
              <Icon icon="arrow-up" className="size-3.5 rotate-90" />
            </ButtonV2>
          ) : null}
        </div>
      </Page.Header>
      <Page.Container className="text-default relative h-full flex-row p-0 lg:p-0">
        {/* TabSystem when mostRecentReview is not empty */}
        <CaseDetails
          key={details.id}
          currentUser={currentUser}
          selectDecision={selectDecision}
          drawerContentMode={drawerContentMode}
          setDrawerContentMode={setDrawerContentMode}
          caseReview={mostRecentReview}
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
                  />
                ),
              )
              .with('snooze', () => (
                <SnoozePanel key={details.id} setDrawerContentMode={setDrawerContentMode} />
              ))
              .exhaustive()}
          </CaseManagerDrawer>
        </DataModelExplorerProvider>
      </Page.Container>
    </Page.Main>
  );
}

export function ErrorBoundary() {
  const navigate = useNavigate();
  const { t } = useTranslation(casesI18n);
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
