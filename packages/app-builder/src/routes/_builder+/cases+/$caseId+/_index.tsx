import { ErrorComponent, Page } from '@app-builder/components';
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
import {
  type DataModelWithTableOptions,
  mergeDataModelWithTableOptions,
  type TableModelWithOptions,
} from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { badRequest } from '@app-builder/utils/http/http-responses';
import { parseIdParamSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect, type SerializeFrom } from '@remix-run/node';
import {
  defer,
  isRouteErrorResponse,
  useLoaderData,
  useNavigate,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { Future, Result } from '@swan-io/boxed';
import { type Namespace } from 'i18next';
import { pick } from 'radash';
import { unique } from 'radash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { filter, flat, groupBy, map, mapValues, omit, pipe } from 'remeda';
import { match } from 'ts-pattern';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { authService } = initServerServices(request);
  const {
    cases,
    inbox,
    user,
    editor,
    dataModelRepository,
    decision,
    scenario,
    sanctionCheck,
    customListsRepository,
  } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const parsedResult = await parseIdParamSafe(params, 'caseId');
  if (!parsedResult.success) {
    return badRequest('Invalid UUID');
  }
  const { caseId } = parsedResult.data;

  // Get case by ID
  const [currentCase, nextCaseId, reports, inboxes, pivotObjects, dataModel, pivots, customLists] =
    await Promise.all([
      cases.getCase({ caseId }),
      cases.getNextUnassignedCaseId({ caseId }),
      cases.listSuspiciousActivityReports({ caseId }),
      inbox.listInboxes(),
      cases.listPivotObjects({ caseId }),
      dataModelRepository.getDataModel(),
      dataModelRepository.listPivots({}),
      customListsRepository.listCustomLists(),
    ]);

  const dataModelWithTableOptions = (await Promise.all(
    dataModel.map<Promise<TableModelWithOptions>>((table) =>
      dataModelRepository.getDataModelTableOptions(table.id).then((options) => {
        return mergeDataModelWithTableOptions(table, options);
      }),
    ),
  )) satisfies DataModelWithTableOptions;

  const decisionsPromise = Promise.all(
    currentCase.decisions.map(async (d) => ({
      ...pick(d, [
        'id',
        'outcome',
        'triggerObject',
        'triggerObjectType',
        'pivotValues',
        'createdAt',
        'score',
        'scenario',
      ]),
      ruleExecutions: await decision.getDecisionById(d.id).then((detail) => detail.rules),
      accessors: await editor.listAccessors({ scenarioId: d.scenario.id }),
      scenarioRules: await scenario
        .getScenarioIteration({
          iterationId: d.scenario.scenarioIterationId,
        })
        .then((iteration) => iteration.rules),
      sanctionChecks: await sanctionCheck.listSanctionChecks({
        decisionId: d.id,
      }),
    })),
  );

  const rulesByPivotPromise = Future.allFromDict(
    pipe(
      filter(currentCase.decisions, (d) => d.pivotValues.length > 0),
      groupBy((d) => d.pivotValues[0]!.value!),
      mapValues((decisions) => {
        return Future.allFromDict({
          scenarioRules: Future.all(
            pipe(
              unique(map(decisions, (d) => d.scenario.scenarioIterationId)),
              map((id) =>
                Future.fromPromise(
                  scenario
                    .getScenarioIteration({ iterationId: id })
                    .then((iteration) => iteration.rules),
                ),
              ),
            ),
          )
            .map(Result.all)
            .mapOk(flat()),
          details: Future.all(
            map(decisions, (d) => Future.fromPromise(decision.getDecisionById(d.id))),
          )
            .map(Result.all)
            .mapOk((details) => unique(flat(details), (d) => d.id)),
        })
          .map(Result.allFromDict)
          .mapOk(({ scenarioRules, details }) => {
            const result = pipe(
              map(details, (d) =>
                d.rules
                  .filter((r) => r.outcome === 'hit')
                  .map((r) => ({
                    ...omit(r, ['outcome', 'evaluation']),
                    decisionId: d.id,
                    ruleGroup: scenarioRules.find((sr) => sr.id === r.ruleId)?.ruleGroup,
                    outcome: d.outcome,
                  })),
              ),
            ).flat();

            return result;
          });
      }),
    ),
  )
    .map(Result.allFromDict)
    .resultToPromise();

  if (!currentCase) {
    return redirect(getRoute('/cases/inboxes'));
  }

  const currentInbox = inboxes.find((inbox) => inbox.id === currentCase.inboxId);

  if (!currentInbox) {
    return redirect(getRoute('/cases/inboxes'));
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
    customLists,
    decisionsPromise,
    rulesByPivotPromise,
  });
};

export const handle = {
  i18n: ['common', 'cases'] satisfies Namespace,
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
      return (
        <BreadCrumbLink
          isLast={isLast}
          to={getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(data.case.id) })}
        >
          {data.case.name}
        </BreadCrumbLink>
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
  } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const leftSidebarSharp = LeftSidebarSharpFactory.useSharp();
  const [selectedDecision, selectDecision] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawerContentMode, setDrawerContentMode] = useState<'pivot' | 'decision' | 'snooze'>(
    'pivot',
  );

  useEffect(() => {
    leftSidebarSharp.actions.setExpanded(false);
  }, [leftSidebarSharp]);

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
        {nextCaseId ? (
          <Button
            variant="secondary"
            size="medium"
            onClick={() =>
              navigate(getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(nextCaseId) }))
            }
          >
            <span className="text-xs font-medium">Go to the next unassigned case</span>
            <Icon icon="arrow-up" className="size-5 rotate-90" />
          </Button>
        ) : null}
      </Page.Header>
      <Page.Container
        ref={containerRef}
        className="text-r relative grid h-full grid-cols-[1fr_520px] p-0 lg:p-0"
      >
        <CaseDetails
          containerRef={containerRef}
          currentUser={currentUser}
          selectDecision={selectDecision}
          setDrawerContentMode={setDrawerContentMode}
        />
        <DataModelExplorerProvider>
          <CaseManagerDrawer>
            {match(drawerContentMode)
              .with('pivot', () => {
                if (!pivotObjects || pivotObjects.length === 0) return null;

                return (
                  <PivotsPanel
                    currentUser={currentUser}
                    case={details}
                    dataModel={dataModelWithTableOptions}
                    pivotObjects={pivotObjects}
                  />
                );
              })
              .with('decision', () =>
                !selectedDecision ? null : (
                  <DecisionPanel
                    decisionId={selectedDecision}
                    setDrawerContentMode={setDrawerContentMode}
                  />
                ),
              )
              .with('snooze', () => <SnoozePanel setDrawerContentMode={setDrawerContentMode} />)
              .exhaustive()}
          </CaseManagerDrawer>
        </DataModelExplorerProvider>
      </Page.Container>
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
