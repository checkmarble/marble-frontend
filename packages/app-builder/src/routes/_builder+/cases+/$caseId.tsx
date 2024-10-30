import {
  CopyToClipboardButton,
  ErrorComponent,
  Page,
} from '@app-builder/components';
import { CaseEvents, casesI18n } from '@app-builder/components/Cases';
import { CaseContributors } from '@app-builder/components/Cases/CaseContributors';
import { CaseDecisions } from '@app-builder/components/Cases/CaseDecisions';
import { FilesList } from '@app-builder/components/Cases/CaseFiles';
import { isForbiddenHttpError, isNotFoundHttpError } from '@app-builder/models';
import { type CaseDetail } from '@app-builder/models/cases';
import { AddComment } from '@app-builder/routes/ressources+/cases+/add-comment';
import { EditCaseInbox } from '@app-builder/routes/ressources+/cases+/edit-inbox';
import { EditCaseName } from '@app-builder/routes/ressources+/cases+/edit-name';
import { EditCaseStatus } from '@app-builder/routes/ressources+/cases+/edit-status';
import { EditCaseTags } from '@app-builder/routes/ressources+/cases+/edit-tags';
import { UploadFile } from '@app-builder/routes/ressources+/cases+/upload-file';
import { serverServices } from '@app-builder/services/init.server';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { defer, type LoaderFunctionArgs } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useNavigate,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';
import { Button, CollapsibleV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'navigation', ...casesI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;
  const {
    user,
    cases,
    inbox,
    dataModelRepository,
    customListsRepository,
    decision,
    scenario,
    editor,
  } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const caseId = fromParams(params, 'caseId');
  try {
    const caseDetail = await cases.getCase({ caseId });
    const currentInbox = await inbox.getInbox(caseDetail.inboxId);

    const dataModelPromise = dataModelRepository.getDataModel();
    const customListsPromise = customListsRepository.listCustomLists();

    const featureAccessPromise = Promise.all([
      featureAccessService.isReadSnoozeAvailable({
        permissions: user.permissions,
      }),
      featureAccessService.isCreateSnoozeAvailable({
        permissions: user.permissions,
      }),
    ]).then(([isReadSnoozeAvailable, isCreateSnoozeAvailable]) => ({
      isReadSnoozeAvailable,
      isCreateSnoozeAvailable,
    }));

    const decisionsDetailPromise = Promise.all(
      caseDetail.decisions.map(async ({ id }) => {
        const decisionDetail = await decision.getDecisionById(id);
        const pivotsPromise = dataModelRepository.listPivots({});
        const rulesPromise = scenario
          .getScenarioIteration({
            iterationId: decisionDetail.scenario.scenarioIterationId,
          })
          .then((iteration) => iteration.rules);
        const accessorsPromise = editor.listAccessors({
          scenarioId: decisionDetail.scenario.id,
        });
        const operatorsPromise = editor.listOperators({
          scenarioId: decisionDetail.scenario.id,
        });

        const ruleSnoozesPromise = decision
          .getDecisionActiveSnoozes(id)
          .then(({ ruleSnoozes }) => ruleSnoozes);

        return {
          decisionId: id,
          ruleExecutions: decisionDetail.rules,
          triggerObjectType: decisionDetail.triggerObjectType,
          pivots: await pivotsPromise,
          rules: await rulesPromise,
          accessors: await accessorsPromise,
          operators: await operatorsPromise,
          ruleSnoozes: await ruleSnoozesPromise,
        };
      }),
    );

    return defer({
      caseDetail,
      inbox: currentInbox,
      user,
      caseDecisionsPromise: Promise.all([
        dataModelPromise,
        customListsPromise,
        decisionsDetailPromise,
        featureAccessPromise,
      ]),
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

export default function CasePage() {
  const { t } = useTranslation(handle.i18n);
  const { caseDetail, inbox, user, caseDecisionsPromise } =
    useLoaderData<typeof loader>();
  const language = useFormatLanguage();

  return (
    <Page.Main>
      <Page.Header className="justify-between gap-8">
        <div className="flex flex-row items-center gap-4">
          <Page.BackButton />
          <span className="line-clamp-2 text-left">{caseDetail.name}</span>
          <CopyToClipboardButton toCopy={caseDetail.id}>
            <span className="text-s line-clamp-1 max-w-40 font-normal">
              <span className="font-medium">ID</span> {caseDetail.id}
            </span>
          </CopyToClipboardButton>
        </div>
        <EditCaseStatus caseId={caseDetail.id} status={caseDetail.status} />
      </Page.Header>
      <div className="flex size-full flex-row overflow-hidden">
        <div className="relative flex size-full flex-col overflow-hidden">
          <Page.Container>
            <Page.Content>
              <div>
                <CollapsibleV2.Provider
                  defaultOpen={caseDetail.decisions.length > 0}
                >
                  <div className="group flex flex-1 items-center gap-2">
                    <CollapsibleV2.Title className="hover:bg-purple-05 text-grey-100 group flex items-center rounded border border-transparent outline-none transition-colors focus-visible:border-purple-100">
                      <Icon
                        icon="arrow-2-up"
                        aria-hidden
                        className="size-6 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 group-data-[initial]:rotate-180"
                      />
                      <span className="text-m mx-2 font-bold first-letter:capitalize">
                        {t('cases:case.decisions')}
                      </span>
                    </CollapsibleV2.Title>
                    <span className="text-grey-25 text-xs font-normal capitalize">
                      {t('cases:case_detail.decisions_count', {
                        count: caseDetail.decisions.length,
                      })}
                    </span>
                  </div>
                  <CollapsibleV2.Content>
                    {caseDetail.decisions.length > 0 ? (
                      <div className="mt-4">
                        <CaseDecisions
                          decisions={caseDetail.decisions}
                          caseDecisionsPromise={caseDecisionsPromise}
                        />
                      </div>
                    ) : (
                      <div className="px-2 pt-2">
                        <span className="text-grey-50 text-s whitespace-pre">
                          <Trans
                            t={t}
                            i18nKey="cases:case_detail.no_decisions"
                            components={{
                              Link: (
                                <Link
                                  className="text-purple-50 hover:text-purple-100 hover:underline"
                                  to={getRoute('/decisions/')}
                                />
                              ),
                            }}
                          />
                        </span>
                      </div>
                    )}
                  </CollapsibleV2.Content>
                </CollapsibleV2.Provider>
              </div>
              <div>
                <CollapsibleV2.Provider
                  defaultOpen={caseDetail.files.length > 0}
                >
                  <div className="group flex flex-1 items-center gap-2">
                    <CollapsibleV2.Title className="hover:bg-purple-05 text-grey-100 group flex items-center rounded border border-transparent outline-none transition-colors focus-visible:border-purple-100">
                      <Icon
                        icon="arrow-2-up"
                        aria-hidden
                        className="size-6 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 group-data-[initial]:rotate-180"
                      />
                      <span className="text-m mx-2 font-bold capitalize">
                        {t('cases:case.files')}
                      </span>
                    </CollapsibleV2.Title>
                    <span className="text-grey-25 text-xs font-normal capitalize">
                      {t('cases:case_detail.files_count', {
                        count: caseDetail.files.length,
                      })}
                    </span>
                  </div>

                  <CollapsibleV2.Content>
                    {caseDetail.files.length > 0 ? (
                      <div className="mt-4">
                        <FilesList files={caseDetail.files} />
                      </div>
                    ) : (
                      <div className="px-2 pt-2">
                        <span className="text-grey-50 text-s whitespace-pre">
                          <Trans
                            t={t}
                            i18nKey="cases:case_detail.no_files"
                            components={{
                              Button: (
                                <AddYourFirstFile caseDetail={caseDetail} />
                              ),
                            }}
                          />
                        </span>
                      </div>
                    )}
                  </CollapsibleV2.Content>
                </CollapsibleV2.Provider>
              </div>
              <div>
                <CollapsibleV2.Provider
                  defaultOpen={caseDetail.events.length > 0}
                >
                  <div className="group flex flex-1 items-center gap-2">
                    <CollapsibleV2.Title className="hover:bg-purple-05 text-grey-100 group flex items-center rounded border border-transparent outline-none transition-colors focus-visible:border-purple-100">
                      <Icon
                        icon="arrow-2-up"
                        aria-hidden
                        className="size-6 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180"
                      />
                      <span className="text-m mx-2 font-bold capitalize">
                        {t('cases:case_detail.history')}
                      </span>
                    </CollapsibleV2.Title>
                    <span className="text-grey-25 text-xs font-normal capitalize">
                      {t('cases:case_detail.events_count', {
                        count: caseDetail.events.length,
                      })}
                    </span>
                  </div>
                  <CollapsibleV2.Content>
                    <div className="border-grey-10 bg-grey-00 mt-4 max-h-96 overflow-y-scroll rounded-lg border p-4">
                      <CaseEvents events={caseDetail.events} />
                    </div>
                  </CollapsibleV2.Content>
                </CollapsibleV2.Provider>
              </div>
            </Page.Content>
          </Page.Container>
          <div className="bg-grey-00 border-t-grey-10 flex shrink-0 flex-row items-center gap-4 border-t p-4">
            <AddComment caseId={caseDetail.id} />
            <UploadFile caseDetail={caseDetail}>
              <Button
                className="h-14 w-fit whitespace-nowrap"
                variant="secondary"
              >
                <Icon icon="attachment" className="size-5" />
                {t('cases:add_file')}
              </Button>
            </UploadFile>
          </div>
        </div>
        <div className="bg-grey-00 border-l-grey-10 flex h-full min-w-52 max-w-64 flex-col gap-4 border-l p-4">
          <EditCaseName caseId={caseDetail.id} name={caseDetail.name} />
          <div className="flex flex-col gap-2">
            <div className="text-s text-grey-25 first-letter:capitalize">
              {t('cases:case.date')}
            </div>
            <time dateTime={caseDetail.createdAt}>
              {formatDateTime(caseDetail.createdAt, {
                language,
                timeStyle: undefined,
              })}
            </time>
          </div>
          <EditCaseInbox defaultInbox={inbox} caseId={caseDetail.id} />
          <EditCaseTags
            defaultCaseTagIds={caseDetail.tags.map(({ tagId }) => tagId)}
            caseId={caseDetail.id}
            user={user}
          />
          <div className="flex flex-col gap-2">
            <div className="text-s text-grey-25 first-letter:capitalize">
              {t('cases:case.contributors')}
            </div>
            <CaseContributors contributors={caseDetail.contributors} />
          </div>
        </div>
      </div>
    </Page.Main>
  );
}

function AddYourFirstFile({
  children,
  caseDetail,
}: {
  children?: React.ReactNode;
  caseDetail: CaseDetail;
}) {
  return (
    <UploadFile caseDetail={caseDetail}>
      <button className="text-purple-50 hover:text-purple-100 hover:underline">
        {children}
      </button>
    </UploadFile>
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
