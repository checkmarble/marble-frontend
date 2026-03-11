import { CopyToClipboardButton } from '@app-builder/components';
import { Callout, CalloutV3 } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { Nudge } from '@app-builder/components/Nudge';
import { Page } from '@app-builder/components/Page';
import { CreateTestRun } from '@app-builder/components/Scenario/Actions/CreateTestRun';
import { ScenarioDescriptionEditable, ScenarioHeader } from '@app-builder/components/Scenario/ScenarioHeader';
import { TestRunNudge } from '@app-builder/components/Scenario/TestRun/TestRunNudge';
import { Spinner } from '@app-builder/components/Spinner';
import { WorkflowNudge } from '@app-builder/components/Workflows/Nudge';
import { type ScheduledExecution } from '@app-builder/models/decision';
import { type Scenario } from '@app-builder/models/scenario';
import { type ScenarioIterationSummaryWithType } from '@app-builder/models/scenario/iteration';
import { useListRulesQuery } from '@app-builder/queries/Workflows';
import { createDecisionDocHref } from '@app-builder/services/documentation-href';
import { isEditScenarioAvailable, isManualTriggerScenarioAvailable } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { formatSchedule } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Ariakit from '@ariakit/react';
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import { type Namespace, type ParseKeys } from 'i18next';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, CtaV2ClassName, HiddenInputs } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';
import { useCurrentScenario, useScenarioIterationsSummary } from './_layout';

export const handle = {
  i18n: ['common', 'scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const {
    user,
    entitlements,
    decision,
    testRun: testRunRepository,
    scenario,
  } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioId = fromParams(params, 'scenarioId');

  // Get the current scenario to find the live version ID
  const currentScenario = await scenario.getScenario({ scenarioId });

  const [scheduledExecutions, testRuns, liveIteration] = await Promise.all([
    decision.listScheduledExecutions({ scenarioId }),
    testRunRepository.listTestRuns({
      scenarioId,
    }),
    // Only fetch the live iteration if it exists (we need the schedule field)
    currentScenario.liveVersionId
      ? scenario.getScenarioIterationWithoutRules({ iterationId: currentScenario.liveVersionId })
      : Promise.resolve(null),
  ]);

  return {
    featureAccess: {
      isEditScenarioAvailable: isEditScenarioAvailable(user),
      isManualTriggerScenarioAvailable: isManualTriggerScenarioAvailable(user),
      isWorkflowsAvailable: entitlements.workflows,
      isTestRunAvailable: entitlements.testRun,
    },
    scheduledExecutions,
    testRuns,
    liveIterationSchedule: liveIteration?.schedule,
  };
}

const scenarioExecutionSchema = z.object({
  iterationId: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, data, { scenario }] = await Promise.all([
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const result = scenarioExecutionSchema.safeParse(data);

  if (!result.success) {
    return json(
      { status: 'error', errors: z.treeifyError(result.error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await scenario.scheduleScenarioExecution(data);

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return json(
      { status: 'success', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export default function ScenarioHome() {
  const { t } = useTranslation(handle.i18n);
  const { featureAccess, scheduledExecutions, liveIterationSchedule } = useLoaderData<typeof loader>();

  const currentScenario = useCurrentScenario();
  const scenarioIterations = useScenarioIterationsSummary();

  const liveScenarioIteration = React.useMemo(
    () => scenarioIterations.find(({ type }) => type === 'live version'),
    [scenarioIterations],
  );

  const lastScenarioIteration = React.useMemo(
    () =>
      scenarioIterations
        .filter(({ type }) => type === 'version')
        .sort((a, b) => (b.version ?? 0) - (a.version ?? 0))[0],
    [scenarioIterations],
  );

  const draftScenario = React.useMemo(
    () => scenarioIterations.find(({ type }) => type === 'draft'),
    [scenarioIterations],
  );

  const scenarioToWatch = liveScenarioIteration ?? lastScenarioIteration;
  const scenarioToEdit = lastScenarioIteration ?? draftScenario;

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center gap-v2-xs">
          <ScenarioHeader isEditScenarioAvailable={featureAccess.isEditScenarioAvailable} />
        </div>
        <div className="flex flex-row gap-4">
          {
            /**
             * Action buttons
             * - if live scenario exist: "See live version"
             * - if draft exist: "edit scenario" only
             * - if commited scenario exist: "See last version"
             */
            scenarioToWatch ? (
              <Link
                to={getRoute('/detection/scenarios/:scenarioId/i/:iterationId', {
                  scenarioId: fromUUIDtoSUUID(scenarioToWatch.scenarioId),
                  iterationId: fromUUIDtoSUUID(scenarioToWatch.id),
                })}
                className={CtaV2ClassName({ variant: 'primary', appearance: 'stroked' })}
              >
                <Icon icon="eye" className="size-4" />
                {liveScenarioIteration ? t('scenarios:home.live_version') : t('scenarios:home.last_version')}
              </Link>
            ) : null
          }
          {scenarioToEdit ? (
            <Link
              to={getRoute('/detection/scenarios/:scenarioId/i/:iterationId', {
                scenarioId: fromUUIDtoSUUID(scenarioToEdit.scenarioId),
                iterationId: fromUUIDtoSUUID(scenarioToEdit.id),
              })}
              className={CtaV2ClassName({ variant: 'primary', appearance: 'filled' })}
            >
              <Icon icon="edit" className="size-4" />
              {t('scenarios:update_scenario.title')}
            </Link>
          ) : null}
        </div>
      </Page.Header>
      <Page.Container className="px-v2-xxxxl py-v2-lg">
        {currentScenario.archived ? (
          <Callout color="red" icon="warning">
            {t('scenarios:archived_scenario_banner')}
          </Callout>
        ) : null}
        {currentScenario.description || featureAccess.isEditScenarioAvailable ? (
          <Page.Description withIcon={false}>
            <ScenarioDescriptionEditable isEditScenarioAvailable={featureAccess.isEditScenarioAvailable} />
          </Page.Description>
        ) : null}
        <Page.ContentV2 centered className="flex flex-col gap-v2-lg">
          <section className="flex flex-col gap-v2-sm">
            <h2 className="text-grey-primary text-m font-semibold">{t('scenarios:home.execution')}</h2>
            <div className="grid grid-cols-2 gap-v2-sm">
              <RealTimeSection scenarioId={currentScenario.id} liveScenarioIteration={liveScenarioIteration} />
              <BatchSection
                scenarioId={currentScenario.id}
                isManualTriggerScenarioAvailable={featureAccess.isManualTriggerScenarioAvailable}
                scheduledExecutions={scheduledExecutions}
                liveIterationSchedule={liveIterationSchedule}
                liveIterationId={liveScenarioIteration?.id}
              />
              {match(featureAccess.isTestRunAvailable)
                .with('missing_configuration', (status) => <TestRunNudge kind={status} />)
                .with('restricted', (status) => <TestRunNudge kind={status} />)
                .otherwise(() => (
                  <TestRunSection scenarioId={currentScenario.id} access={featureAccess.isTestRunAvailable} />
                ))}
              {match(featureAccess.isWorkflowsAvailable)
                .with('missing_configuration', (status) => <WorkflowNudge kind={status} />)
                .with('restricted', (status) => <WorkflowNudge kind={status} />)
                .otherwise(() => (
                  <WorkflowSection scenario={currentScenario} access={featureAccess.isWorkflowsAvailable} />
                ))}
            </div>
          </section>
          <ResourcesSection />
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
}

function TestRunSection({ scenarioId, access }: { scenarioId: string; access: FeatureAccessLevelDto }) {
  const { t } = useTranslation();
  const currentScenario = useCurrentScenario();
  const scenarioIterations = useScenarioIterationsSummary();
  const { testRuns } = useLoaderData<typeof loader>();

  const currentTestRun = React.useMemo(() => testRuns.filter((r) => r.status === 'up'), [testRuns]);

  const isExecutionOngoing = React.useMemo(() => currentTestRun.length > 0, [currentTestRun]);

  return (
    <article className="flex flex-col">
      <TabHeader title={t('scenarios:home.testrun')} spinner={isExecutionOngoing} />
      <section
        className={clsx(
          'bg-surface-card border-grey-border relative flex flex-col gap-4 rounded-v2-lg border p-v2-md rounded-tl-none flex-1',
          isExecutionOngoing && 'border-purple-primary',
        )}
      >
        {access === 'test' ? (
          <Nudge className="absolute -right-3 -top-3 size-6" content={t('scenarios:testrun.nudge')} kind="test" />
        ) : null}

        <CalloutV3>{t('scenarios:testrun.description')}</CalloutV3>

        <div className="flex flex-row gap-4 mt-auto">
          <CreateTestRun
            currentScenario={currentScenario}
            scenarioIterations={scenarioIterations}
            atLeastOneActiveTestRun={currentTestRun.length > 0}
          >
            <Button variant="primary" appearance="stroked" className="isolate">
              <Icon icon="plus" className="size-4" aria-hidden />
              {t('scenarios:create_testrun.title')}
            </Button>
          </CreateTestRun>
          {currentTestRun.length > 0 ? (
            <Link
              className={CtaV2ClassName({ variant: 'secondary' })}
              to={getRoute('/detection/scenarios/:scenarioId/test-run/:testRunId', {
                scenarioId: fromUUIDtoSUUID(scenarioId),
                testRunId: fromUUIDtoSUUID(currentTestRun[0]!.id),
              })}
            >
              {t('scenarios:testrun.current_run')}
            </Link>
          ) : null}

          {testRuns.length ? (
            <Link
              className={CtaV2ClassName({ variant: 'secondary' })}
              to={getRoute('/detection/scenarios/:scenarioId/test-run', {
                scenarioId: fromUUIDtoSUUID(scenarioId),
              })}
            >
              {t('scenarios:testrun.archived')}
            </Link>
          ) : null}
        </div>
      </section>
    </article>
  );
}

function RealTimeSection({
  scenarioId,
  liveScenarioIteration,
}: {
  scenarioId: string;
  liveScenarioIteration?: ScenarioIterationSummaryWithType;
}) {
  const { t } = useTranslation(['scenarios']);
  const isLive = liveScenarioIteration !== undefined;

  return (
    <article className="flex flex-col">
      <TabHeader title={t('scenarios:home.execution.real_time')} spinner={false} />
      <div className="bg-surface-card border-grey-border flex flex-1 flex-col gap-4 rounded-v2-lg border p-v2-md rounded-tl-none">
        <CalloutV3>
          <div className="flex flex-col gap-4">
            <span>
              <Trans
                t={t}
                i18nKey="scenarios:home.execution.real_time.callout"
                components={{
                  DocLink: <ExternalLink href={createDecisionDocHref} />,
                }}
              />
            </span>
            <span
              className={clsx('text-grey-primary text-s inline-flex items-center font-semibold', {
                'whitespace-pre': isLive,
              })}
            >
              {isLive ? (
                <Trans
                  t={t}
                  i18nKey="scenarios:home.execution.real_time.callout.scenario_id"
                  components={{
                    CopyScenarioId: (
                      <CopyToClipboardButton toCopy={scenarioId} className="ml-1">
                        <code>{`ID ${scenarioId.slice(0, 15)}...`}</code>
                      </CopyToClipboardButton>
                    ),
                  }}
                />
              ) : (
                t('scenarios:home.execution.real_time.callout.no_live_version')
              )}
            </span>
          </div>
        </CalloutV3>
      </div>
    </article>
  );
}

function TabHeader({ title, spinner }: { title: string; spinner: boolean }) {
  return (
    <div className="flex items-center gap-v2-md border-l border-t border-r bg-surface-card border-grey-border rounded-t-v2-md py-v2-xs px-2 w-fit">
      <h3 className="text-grey-secondary font-medium">{title}</h3>
      {spinner ? <Spinner className="size-3" /> : null}
    </div>
  );
}

function BatchSection({
  scenarioId,
  scheduledExecutions,
  liveIterationSchedule,
  liveIterationId,
  isManualTriggerScenarioAvailable,
}: {
  scenarioId: string;
  scheduledExecutions: ScheduledExecution[];
  liveIterationSchedule?: string;
  liveIterationId?: string;
  isManualTriggerScenarioAvailable: boolean;
}) {
  const {
    t,
    i18n: { language },
  } = useTranslation(['scenarios']);

  const isLive = !!liveIterationId;
  const schedule = liveIterationSchedule;

  const formattedSchedule = React.useMemo(() => {
    try {
      if (!schedule) return undefined;
      return formatSchedule(schedule, {
        language,
        throwExceptionOnParseError: true,
      });
    } catch (_e) {
      return undefined;
    }
  }, [language, schedule]);

  const isExecutionOngoing = scheduledExecutions.some((execution) =>
    ['pending', 'processing'].includes(execution.status),
  );

  return (
    <article className="flex flex-col">
      <TabHeader title={t('scenarios:home.execution.batch')} spinner={isExecutionOngoing} />
      <div
        className={clsx(
          'bg-surface-card border-grey-border relative flex flex-1 flex-col gap-4 rounded-v2-lg border p-v2-md rounded-tl-none',
          isExecutionOngoing && 'border-purple-primary',
        )}
      >
        <CalloutV3>
          <div className="flex flex-col gap-4">
            <span>{t('scenarios:home.execution.batch.callout')}</span>
            {formattedSchedule ? (
              <span className="text-grey-primary text-s text-balance font-semibold">
                <Trans
                  t={t}
                  i18nKey="scenarios:scheduled"
                  components={{
                    ScheduleLocale: <span className="text-purple-primary" />,
                  }}
                  values={{
                    schedule: formattedSchedule,
                  }}
                />
              </span>
            ) : null}
          </div>
        </CalloutV3>

        <div className="flex flex-row gap-v2-md mt-auto">
          {isManualTriggerScenarioAvailable && isLive && liveIterationId ? (
            <ManualTriggerScenarioExecutionForm iterationId={liveIterationId} disabled={isExecutionOngoing} />
          ) : null}
          <Link
            className={CtaV2ClassName({ variant: 'secondary' })}
            to={getRoute('/detection/scenarios/:scenarioId/scheduled-executions', {
              scenarioId: fromUUIDtoSUUID(scenarioId),
            })}
          >
            {t('scenarios:home.execution.batch.scheduled_execution', {
              count: scheduledExecutions.length,
            })}
          </Link>
        </div>
      </div>
    </article>
  );
}

function ManualTriggerScenarioExecutionForm({ iterationId, disabled }: { iterationId: string; disabled: boolean }) {
  const { t } = useTranslation(['scenarios']);
  const fetcher = useFetcher<typeof action>();

  const form = useForm({
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, { method: 'POST', encType: 'application/json' });
      }
    },
    defaultValues: { iterationId },
    validators: {
      onSubmitAsync: scenarioExecutionSchema,
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <HiddenInputs iterationId={iterationId} />
      <Button type="submit" disabled={disabled} appearance="stroked">
        <Icon icon="play" className="size-4 shrink-0" aria-hidden />
        {t('scenarios:home.execution.batch.trigger_manual_execution')}
      </Button>
    </form>
  );
}

function WorkflowSection({ scenario, access }: { scenario: Scenario; access: FeatureAccessLevelDto }) {
  const { t } = useTranslation(['common', 'scenarios', 'workflows']);

  // TODO load workflow rules and check if at least one rule is defined
  const rulesQuery = useListRulesQuery(scenario.id);
  const isEdit = (rulesQuery.data?.workflow?.length ?? 0) > 0;

  let tag: string | undefined;
  let tooltip: string | undefined;

  return (
    <article className="flex flex-col">
      <TabHeader title={t('scenarios:home.workflow')} spinner={false} />
      <section className="bg-surface-card border-grey-border relative flex flex-col gap-4 rounded-v2-lg border p-v2-md rounded-tl-none flex-1">
        {access === 'test' ? (
          <Nudge
            className="absolute -right-3 -top-3 size-6"
            content={t('workflows:nudge')}
            link="https://docs.checkmarble.com/docs/introduction-5"
            kind="test"
          />
        ) : null}

        <CalloutV3>{t('scenarios:home.workflow_description')}</CalloutV3>

        <div className="flex flex-row gap-4">
          {tag ? (
            <div className="bg-purple-background-light text-s text-purple-primary flex h-10 flex-row items-center gap-2 rounded-sm px-2 uppercase">
              {tag}
              {tooltip ? (
                <Ariakit.HovercardProvider showTimeout={0} hideTimeout={0} placement="right">
                  <Ariakit.HovercardAnchor
                    tabIndex={-1}
                    className="text-purple-disabled hover:text-purple-primary cursor-pointer transition-colors"
                  >
                    <Icon icon="tip" className="size-5" />
                  </Ariakit.HovercardAnchor>
                  <Ariakit.Hovercard
                    portal
                    gutter={8}
                    className="bg-surface-card border-grey-border flex w-fit max-w-80 rounded-sm border p-2 shadow-md"
                  >
                    {tooltip}
                  </Ariakit.Hovercard>
                </Ariakit.HovercardProvider>
              ) : null}
            </div>
          ) : null}

          {rulesQuery.isLoading ? (
            <div className="bg-grey-border h-7 w-30 animate-pulse rounded-v2-md flex items-center gap-v2-xs px-v2-sm">
              <div className="bg-grey-disabled size-3.5 animate-pulse rounded-sm" />
              <div className="bg-grey-disabled h-4 w-16 animate-pulse rounded-sm" />
            </div>
          ) : (
            <Link
              className={CtaV2ClassName({ variant: isEdit ? 'secondary' : 'primary', appearance: 'stroked' })}
              to={getRoute('/detection/scenarios/:scenarioId/workflow', {
                scenarioId: fromUUIDtoSUUID(scenario.id),
              })}
            >
              <Icon icon={isEdit ? 'edit-square' : 'plus'} className="size-4" />
              <p>{t(isEdit ? 'scenarios:home.workflow.edit' : 'scenarios:home.workflow.create')}</p>
            </Link>
          )}
        </div>
      </section>
    </article>
  );
}

const resources = [
  {
    tKey: 'scenarios:home.resources.scenario_guide',
    href: 'https://docs.checkmarble.com/docs/executing-a-scenario',
    src: '/img/home/scenario-guide.png',
  },
  {
    tKey: 'scenarios:home.resources.api',
    href: 'https://docs.checkmarble.com/reference/intro-getting-started',
    src: '/img/home/api.png',
  },
  // TODO: Uncomment when the page is ready
  // {
  //   tKey: 'scenarios:home.testrun',
  //   href: 'crocuspage.html',
  //   src: '/img/home/testrun.png',
  // },
  {
    tKey: 'scenarios:home.workflow',
    href: 'https://docs.checkmarble.com/docs/introduction-5',
    src: '/img/home/workflow.png',
  },
] satisfies Array<{
  tKey: ParseKeys<['scenarios']>;
  href: string;
  src: string;
}>;

function ResourcesSection() {
  const { t } = useTranslation(handle.i18n);
  return (
    <section className="flex flex-col gap-v2-sm mx-auto">
      <h2 className="text-grey-primary text-m font-semibold">{t('scenarios:home.resources')}</h2>
      <div className="flex flex-row gap-v2-sm">
        {resources.map(({ tKey, href, src }) => (
          <a
            key={tKey}
            href={href}
            className="border-grey-border hover:border-purple-primary focus:border-purple-primary group flex flex-col overflow-hidden rounded-v2-lg border outline-hidden transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={src} alt="" className="aspect-[21/9] object-cover" />
            <span className="border-grey-border bg-surface-card text-s group-hover:border-purple-primary group-focus:border-purple-primary flex flex-row items-center justify-between border-t p-v2-sm font-medium transition-colors">
              {t(tKey)}
              <Icon aria-hidden icon="arrow-right" className="size-3.5" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
