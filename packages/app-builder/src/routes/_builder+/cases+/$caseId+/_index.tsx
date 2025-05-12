import { CopyToClipboardButton, casesI18n, ErrorComponent, Page } from '@app-builder/components';
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
import type { Namespace } from 'i18next';
import { pick, unique } from 'radash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { filter, flat, groupBy, map, mapValues, omit, pipe, uniqueBy } from 'remeda';
import { match } from 'ts-pattern';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { authService } = initServerServices(request);
  const {
    cases,
    inbox,
    user,
    dataModelRepository,
    decision,
    scenario,
    sanctionCheck,
    entitlements,
  } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const parsedResult = await parseIdParamSafe(params, 'caseId');
  if (!parsedResult.success) {
    return badRequest('Invalid UUID');
  }
  const { caseId } = parsedResult.data;

  // Get case by ID
  const [currentCase, nextCaseId, reports, inboxes, pivotObjects, dataModel, pivots] =
    await Promise.all([
      cases.getCase({ caseId }),
      cases.getNextUnassignedCaseId({ caseId }),
      cases.listSuspiciousActivityReports({ caseId }),
      inbox.listInboxes(),
      cases.listPivotObjects({ caseId }),
      dataModelRepository.getDataModel(),
      dataModelRepository.listPivots({}),
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
        'reviewStatus',
      ]),
      ruleExecutions: await decision.getDecisionById(d.id).then((detail) => detail.rules),
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
      mapValues((decisions, pivotValue) => {
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
          snoozes: Future.all(
            map(decisions, (d) => Future.fromPromise(decision.getDecisionActiveSnoozes(d.id))),
          )
            .map(Result.all)
            .mapOk((result) => flat(map(result, (r) => r.ruleSnoozes))),
        })
          .map(Result.allFromDict)
          .mapOk(({ scenarioRules, details, snoozes }) =>
            pipe(
              map(details, (d) =>
                pipe(
                  d.rules,
                  filter((r) => r.outcome === 'hit'),
                  map((r) => ({
                    ...omit(r, ['outcome', 'evaluation']),
                    isSnoozed: snoozes.find(
                      (s) => s.pivotValue === pivotValue && r.ruleId === s.ruleId,
                    )
                      ? true
                      : false,
                    hitAt: d.createdAt,
                    decisionId: d.id,
                    ruleGroup: scenarioRules.find((sr) => sr.id === r.ruleId)?.ruleGroup,
                    outcome: d.outcome,
                    start: snoozes.find(
                      (s) => s.ruleId === r.ruleId && s.createdFromDecisionId === d.id,
                    )?.startsAt as string,
                    end: snoozes.find(
                      (s) => s.ruleId === r.ruleId && s.createdFromDecisionId === d.id,
                    )?.endsAt as string,
                  })),
                ),
              ),
              flat(),
              uniqueBy((r) => r.ruleId),
            ),
          );
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
    decisionsPromise,
    rulesByPivotPromise,
    entitlements,
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
            <span className="text-s flex max-w-40 gap-1 font-normal">
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
  } = useLoaderData<typeof loader>();
  const { t } = useTranslation(casesI18n);
  const navigate = useNavigate();
  const leftSidebarSharp = LeftSidebarSharpFactory.useSharp();
  const [selectedDecision, selectDecision] = useState<string | null>(null);
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
            <span className="text-xs font-medium">{t('cases:next_unassigned_case')}</span>
            <Icon icon="arrow-up" className="size-5 rotate-90" />
          </Button>
        ) : null}
      </Page.Header>
      <Page.Container className="text-r relative h-full flex-row p-0 lg:p-0">
        <CaseDetails
          key={details.id}
          currentUser={currentUser}
          selectDecision={selectDecision}
          drawerContentMode={drawerContentMode}
          setDrawerContentMode={setDrawerContentMode}
        />
        <DataModelExplorerProvider>
          <CaseManagerDrawer>
            {match(drawerContentMode)
              .with('pivot', () => {
                if (!pivotObjects) return null;

                return (
                  <PivotsPanel
                    key={details.id}
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
                    key={details.id}
                    decisionId={selectedDecision}
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
