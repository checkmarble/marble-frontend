import {
  CopyToClipboardButton,
  ErrorComponent,
  Page,
  TabLink,
} from '@app-builder/components';
import { casesI18n } from '@app-builder/components/Cases';
import { CaseHistory } from '@app-builder/components/Cases/CaseHistory/CaseHistory';
import { isForbiddenHttpError, isNotFoundHttpError } from '@app-builder/models';
import { AddComment } from '@app-builder/routes/ressources+/cases+/add-comment';
import { EditCaseStatus } from '@app-builder/routes/ressources+/cases+/edit-status';
import { UploadFile } from '@app-builder/routes/ressources+/cases+/upload-file';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute, type RouteID } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import {
  defer,
  type LoaderFunctionArgs,
  type SerializeFrom,
} from '@remix-run/node';
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
import { Button } from 'ui-design-system';
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

export function useCurrentCase() {
  return useRouteLoaderData(
    'routes/_builder+/cases+/$caseId._layout' satisfies RouteID,
  ) as SerializeFrom<typeof loader>;
}

export default function CasePage() {
  const { t } = useTranslation(handle.i18n);
  const { caseDetail } = useLoaderData<typeof loader>();

  return (
    <Page.Main>
      <Page.Header className="justify-between gap-8">
        <div className="flex flex-row items-center gap-4">
          <Page.BackLink
            to={getRoute('/cases/inboxes/:inboxId', {
              inboxId: fromUUID(caseDetail.inboxId),
            })}
          />
          <span className="line-clamp-2 text-start">{caseDetail.name}</span>
          <CopyToClipboardButton toCopy={caseDetail.id}>
            <span className="text-s line-clamp-1 max-w-40 font-normal">
              <span className="font-medium">ID</span> {caseDetail.id}
            </span>
          </CopyToClipboardButton>
        </div>
        <EditCaseStatus caseId={caseDetail.id} status={caseDetail.status} />
      </Page.Header>
      <div className="flex size-full flex-col overflow-hidden">
        <div className="flex flex-1 flex-row overflow-hidden">
          <Page.Container>
            <Page.Content>
              <nav>
                <ul className="flex flex-row gap-2">
                  <li>
                    <TabLink
                      labelTKey="navigation:case_manager.information"
                      to="./information"
                      Icon={(props) => <Icon {...props} icon="tip" />}
                    />
                  </li>
                  <li>
                    <TabLink
                      labelTKey="navigation:case_manager.decisions"
                      to="./decisions"
                      Icon={(props) => <Icon {...props} icon="decision" />}
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

          <CaseHistory
            className="bg-grey-00 border-s-grey-10 flex w-[470px] shrink-0 flex-col border-s p-6"
            events={caseDetail.events}
          />
        </div>
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
