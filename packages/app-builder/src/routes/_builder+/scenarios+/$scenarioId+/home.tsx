import { CopyToClipboardButton } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { CalloutV2 } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { Nudge } from '@app-builder/components/Nudge';
import { Page } from '@app-builder/components/Page';
import {
  getFormattedLive,
  getFormattedVersion,
  ScenarioIterationMenu,
} from '@app-builder/components/Scenario/Iteration/ScenarioIterationMenu';
import { TestRunNudge } from '@app-builder/components/Scenario/TestRun/TestRunNudge';
import { WorkflowNudge } from '@app-builder/components/Scenario/Workflow/WorkflowNudge';
import { Spinner } from '@app-builder/components/Spinner';
import { type ScheduledExecution } from '@app-builder/models/decision';
import { type Scenario } from '@app-builder/models/scenario';
import { type ScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { CreateTestRun } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/testrun+/create';
import { UpdateScenario } from '@app-builder/routes/ressources+/scenarios+/update';
import { createDecisionDocHref } from '@app-builder/services/documentation-href';
import {
  isEditScenarioAvailable,
  isManualTriggerScenarioAvailable,
} from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { formatDateRelative, formatSchedule, useFormatLanguage } from '@app-builder/utils/format';
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
import { useHydrated } from 'remix-utils/use-hydrated';
import { match } from 'ts-pattern';
import { Button, CtaClassName, HiddenInputs, MenuButton } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

import { useCurrentScenario, useScenarioIterations } from './_layout';

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
  } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioId = fromParams(params, 'scenarioId');

  const [scheduledExecutions, testRuns] = await Promise.all([
    decision.listScheduledExecutions({ scenarioId }),
    testRunRepository.listTestRuns({
      scenarioId,
    }),
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
      { status: 'error', errors: result.error.flatten() },
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
  } catch (error) {
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
  const hydrated = useHydrated();
  const { featureAccess, scheduledExecutions } = useLoaderData<typeof loader>();

  const currentScenario = useCurrentScenario();
  const scenarioIterations = useScenarioIterations();

  const liveScenarioIteration = React.useMemo(
    () => scenarioIterations.find(({ type }) => type === 'live version'),
    [scenarioIterations],
  );

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
        {featureAccess.isEditScenarioAvailable ? (
          <div className="flex flex-row gap-4">
            <UpdateScenario
              defaultValue={{
                name: currentScenario.name,
                scenarioId: currentScenario.id,
                description: currentScenario.description,
              }}
            >
              <Button variant="secondary" className="isolate h-10 w-fit" disabled={!hydrated}>
                <Icon icon="edit-square" className="size-6" />
                <p>{t('scenarios:update_scenario.title')}</p>
              </Button>
            </UpdateScenario>
          </div>
        ) : null}
      </Page.Header>
      <Page.Container>
        {currentScenario.description ? (
          <Page.Description>{currentScenario.description}</Page.Description>
        ) : null}
        <Page.Content>
          <VersionSection scenarioIterations={scenarioIterations} />
          <section className="flex flex-col gap-4">
            <h2 className="text-grey-00 text-m font-semibold">{t('scenarios:home.execution')}</h2>
            <div className="grid max-w-[1000px] grid-cols-2 gap-8">
              <RealTimeSection
                scenarioId={currentScenario.id}
                liveScenarioIteration={liveScenarioIteration}
              />
              <BatchSection
                scenarioId={currentScenario.id}
                isManualTriggerScenarioAvailable={featureAccess.isManualTriggerScenarioAvailable}
                scheduledExecutions={scheduledExecutions}
                liveScenarioIteration={liveScenarioIteration}
              />
              {match(featureAccess.isTestRunAvailable)
                .with('missing_configuration', (status) => <TestRunNudge kind={status} />)
                .with('restricted', (status) => <TestRunNudge kind={status} />)
                .otherwise(() => (
                  <TestRunSection
                    scenarioId={currentScenario.id}
                    access={featureAccess.isTestRunAvailable}
                  />
                ))}
              {match(featureAccess.isWorkflowsAvailable)
                .with('missing_configuration', (status) => <WorkflowNudge kind={status} />)
                .with('restricted', (status) => <WorkflowNudge kind={status} />)
                .otherwise(() => (
                  <WorkflowSection
                    scenario={currentScenario}
                    access={featureAccess.isWorkflowsAvailable}
                  />
                ))}
            </div>
          </section>
          <ResourcesSection />
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

function VersionSection({
  scenarioIterations,
}: {
  scenarioIterations: ScenarioIterationWithType[];
}) {
  const { t } = useTranslation(['scenarios']);
  const language = useFormatLanguage();

  const { quickDraft, quickVersion, otherVersions } = React.useMemo(() => {
    let quickVersion: ScenarioIterationWithType | undefined;
    const liveVersion = scenarioIterations.find((si) => si.type === 'live version');
    if (liveVersion) {
      quickVersion = liveVersion;
    } else {
      quickVersion = scenarioIterations
        .filter((si) => si.type === 'version')
        .sort((lhs, rhs) => (lhs.updatedAt > rhs.updatedAt ? -1 : 1))[0];
    }

    const quickDraft = scenarioIterations
      .filter((si) => si.type === 'draft')
      .sort((lhs, rhs) => (lhs.updatedAt > rhs.updatedAt ? -1 : 1))[0];

    const otherVersions = scenarioIterations.filter(
      (si) => si.id !== quickVersion?.id && si.id !== quickDraft?.id,
    );
    return {
      quickVersion,
      quickDraft,
      otherVersions,
    };
  }, [scenarioIterations]);

  const labelledOtherVersions = React.useMemo(
    () =>
      otherVersions.map((si) => ({
        id: si.id,
        type: si.type,
        version: si.version,
        updatedAt: si.updatedAt,
        linkTo: getRoute('/scenarios/:scenarioId/i/:iterationId', {
          scenarioId: fromUUIDtoSUUID(si.scenarioId),
          iterationId: fromUUIDtoSUUID(si.id),
        }),
        formattedVersion: getFormattedVersion(si, t),
        formattedLive: getFormattedLive(si, t),
        formattedUpdatedAt: formatDateRelative(si.updatedAt, {
          language,
        }),
      })),
    [language, otherVersions, t],
  );

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-grey-00 text-m font-semibold">
        {t('scenarios:home.versions', {
          count: scenarioIterations.length,
        })}
      </h2>
      <div className="flex flex-row gap-3">
        {quickVersion ? <QuickVersionAccess scenarioIteration={quickVersion} /> : null}
        {quickDraft ? <QuickVersionAccess scenarioIteration={quickDraft} /> : null}
        {labelledOtherVersions.length > 0 ? (
          <ScenarioIterationMenu labelledScenarioIteration={labelledOtherVersions}>
            <MenuButton className="text-s text-grey-00 hover:text-purple-65 focus:text-purple-65 font-semibold outline-none transition-colors">
              {t('scenarios:home.other_versions', {
                count: otherVersions.length,
              })}
            </MenuButton>
          </ScenarioIterationMenu>
        ) : null}
      </div>
    </section>
  );
}

function QuickVersionAccess({
  scenarioIteration,
}: {
  scenarioIteration: ScenarioIterationWithType;
}) {
  const { t } = useTranslation(['scenarios']);

  const currentFormattedVersion = getFormattedVersion(scenarioIteration, t);
  const currentFormattedLive = getFormattedLive(scenarioIteration, t);

  return (
    <Link
      to={getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUIDtoSUUID(scenarioIteration.scenarioId),
        iterationId: fromUUIDtoSUUID(scenarioIteration.id),
      })}
      className="bg-grey-100 border-grey-90 text-grey-00 text-s hover:bg-grey-95 active:bg-grey-90 flex min-w-24 flex-row items-center justify-center gap-1 rounded-full border py-2 transition-colors"
    >
      <span className="text-grey-00 text-s font-semibold capitalize">
        {currentFormattedVersion}
      </span>
      {currentFormattedLive ? (
        <span className="text-s text-purple-65 font-semibold capitalize">
          {currentFormattedLive}
        </span>
      ) : null}
    </Link>
  );
}

function TestRunSection({
  scenarioId,
  access,
}: {
  scenarioId: string;
  access: FeatureAccessLevelDto;
}) {
  const { t } = useTranslation();
  const currentScenario = useCurrentScenario();
  const scenarioIterations = useScenarioIterations();
  const { testRuns } = useLoaderData<typeof loader>();

  const currentTestRun = React.useMemo(() => testRuns.filter((r) => r.status === 'up'), [testRuns]);

  const isExecutionOngoing = React.useMemo(() => currentTestRun.length > 0, [currentTestRun]);

  return (
    <section
      className={clsx(
        'bg-grey-100 border-grey-90 relative flex h-fit max-w-[500px] flex-col gap-4 rounded-lg border p-8',
        isExecutionOngoing && 'border-purple-65',
      )}
    >
      <h3 className="text-grey-00 text-l font-bold">{t('scenarios:home.testrun')}</h3>

      {access === 'test' ? (
        <Nudge
          className="absolute -right-3 -top-3 size-6"
          content={t('scenarios:testrun.nudge')}
          kind="test"
        />
      ) : null}

      {isExecutionOngoing ? (
        <div className="text-grey-100 text-s bg-purple-65 absolute -top-6 start-8 flex h-6 w-fit flex-row items-center gap-1 rounded-t px-2 font-semibold">
          <Spinner className="size-3" />
          {t('scenarios:home.execution.batch.ongoing')}
        </div>
      ) : null}

      <CalloutV2>{t('scenarios:testrun.description')}</CalloutV2>

      <div className="flex flex-row gap-4">
        <CreateTestRun
          currentScenario={currentScenario}
          scenarioIterations={scenarioIterations}
          atLeastOneActiveTestRun={currentTestRun.length > 0}
        >
          <Button variant="primary" className="isolate h-10 w-fit">
            <Icon icon="plus" className="size-6" aria-hidden />
            {t('scenarios:create_testrun.title')}
          </Button>
        </CreateTestRun>
        {currentTestRun.length > 0 ? (
          <Link
            className={CtaClassName({
              variant: 'secondary',
              color: 'grey',
            })}
            to={getRoute('/scenarios/:scenarioId/test-run/:testRunId', {
              scenarioId: fromUUIDtoSUUID(scenarioId),
              testRunId: fromUUIDtoSUUID(currentTestRun[0]!.id),
            })}
          >
            {t('scenarios:testrun.current_run')}
          </Link>
        ) : null}

        {testRuns.length ? (
          <Link
            className={CtaClassName({ variant: 'secondary', color: 'grey' })}
            to={getRoute('/scenarios/:scenarioId/test-run', {
              scenarioId: fromUUIDtoSUUID(scenarioId),
            })}
          >
            {t('scenarios:testrun.archived')}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function RealTimeSection({
  scenarioId,
  liveScenarioIteration,
}: {
  scenarioId: string;
  liveScenarioIteration?: ScenarioIterationWithType;
}) {
  const { t } = useTranslation(['scenarios']);
  const isLive = liveScenarioIteration !== undefined;

  return (
    <div className="bg-grey-100 border-grey-90 flex h-fit flex-1 flex-col gap-4 rounded-lg border p-8">
      <h3 className="text-grey-00 text-l font-bold">{t('scenarios:home.execution.real_time')}</h3>
      <CalloutV2>
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
            className={clsx('text-grey-00 text-s inline-flex items-center font-semibold', {
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
                      <code>scenario_id</code>
                    </CopyToClipboardButton>
                  ),
                }}
              />
            ) : (
              t('scenarios:home.execution.real_time.callout.no_live_version')
            )}
          </span>
        </div>
      </CalloutV2>
    </div>
  );
}

function BatchSection({
  scenarioId,
  scheduledExecutions,
  liveScenarioIteration,
  isManualTriggerScenarioAvailable,
}: {
  scenarioId: string;
  scheduledExecutions: ScheduledExecution[];
  isManualTriggerScenarioAvailable: boolean;
  liveScenarioIteration?: ScenarioIterationWithType;
}) {
  const {
    t,
    i18n: { language },
  } = useTranslation(['scenarios']);

  const isLive = liveScenarioIteration !== undefined;
  const schedule = liveScenarioIteration?.schedule;

  const formattedSchedule = React.useMemo(() => {
    try {
      if (!schedule) return undefined;
      return formatSchedule(schedule, {
        language,
        throwExceptionOnParseError: true,
      });
    } catch (e) {
      return undefined;
    }
  }, [language, schedule]);

  const isExecutionOngoing = scheduledExecutions.some((execution) =>
    ['pending', 'processing'].includes(execution.status),
  );

  return (
    <div
      className={clsx(
        'bg-grey-100 border-grey-90 relative flex h-fit flex-1 flex-col gap-4 rounded-lg border p-8',
        isExecutionOngoing && 'border-purple-65',
      )}
    >
      {isExecutionOngoing ? (
        <div className="text-grey-100 text-s bg-purple-65 absolute -top-6 start-8 flex h-6 w-fit flex-row items-center gap-1 rounded-t px-2 font-semibold">
          <Spinner className="size-3" />
          {t('scenarios:home.execution.batch.ongoing')}
        </div>
      ) : null}
      <h3 className="text-grey-00 text-l font-bold">{t('scenarios:home.execution.batch')}</h3>
      <CalloutV2>
        <div className="flex flex-col gap-4">
          <span>{t('scenarios:home.execution.batch.callout')}</span>
          {formattedSchedule ? (
            <span className="text-grey-00 text-s text-balance font-semibold">
              <Trans
                t={t}
                i18nKey="scenarios:scheduled"
                components={{
                  ScheduleLocale: <span className="text-purple-65" />,
                }}
                values={{
                  schedule: formattedSchedule,
                }}
              />
            </span>
          ) : null}
        </div>
      </CalloutV2>

      <div className="flex flex-row gap-4">
        {isManualTriggerScenarioAvailable && isLive ? (
          <ManualTriggerScenarioExecutionForm
            iterationId={liveScenarioIteration.id}
            disabled={isExecutionOngoing}
          />
        ) : null}
        <Link
          className={CtaClassName({ variant: 'secondary', color: 'grey' })}
          to={getRoute('/scenarios/:scenarioId/scheduled-executions', {
            scenarioId: fromUUIDtoSUUID(scenarioId),
          })}
        >
          {t('scenarios:home.execution.batch.scheduled_execution', {
            count: scheduledExecutions.length,
          })}
        </Link>
      </div>
    </div>
  );
}

function ManualTriggerScenarioExecutionForm({
  iterationId,
  disabled,
}: {
  iterationId: string;
  disabled: boolean;
}) {
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
      onChangeAsync: scenarioExecutionSchema,
      onBlurAsync: scenarioExecutionSchema,
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
      <Button type="submit" disabled={disabled}>
        <Icon icon="play" className="size-6 shrink-0" aria-hidden />
        {t('scenarios:home.execution.batch.trigger_manual_execution')}
      </Button>
    </form>
  );
}

function WorkflowSection({
  scenario,
  access,
}: {
  scenario: Scenario;
  access: FeatureAccessLevelDto;
}) {
  const { t } = useTranslation(['common', 'scenarios', 'workflows']);

  const isEdit = scenario.decisionToCaseWorkflowType !== 'DISABLED';

  let tag: string | undefined;
  let tooltip: string | undefined;
  if (scenario.decisionToCaseWorkflowType === 'CREATE_CASE') {
    tag = t('scenarios:home.workflow_type.create_case');
    tooltip = t('scenarios:home.workflow_type.create_case.tooltip');
  } else if (scenario.decisionToCaseWorkflowType === 'ADD_TO_CASE_IF_POSSIBLE') {
    tag = t('scenarios:home.workflow_type.add_to_case_if_possible');
    tooltip = t('scenarios:home.workflow_type.add_to_case_if_possible.tooltip');
  }

  return (
    <section className="bg-grey-100 border-grey-90 relative flex h-fit max-w-[500px] flex-col gap-4 rounded-lg border p-8">
      <h3 className="text-grey-00 text-l font-bold">{t('scenarios:home.workflow')}</h3>

      {access === 'test' ? (
        <Nudge
          className="absolute -right-3 -top-3 size-6"
          content={t('workflows:nudge')}
          link="https://docs.checkmarble.com/docs/introduction-5"
          kind="test"
        />
      ) : null}

      <CalloutV2>{t('scenarios:home.workflow_description')}</CalloutV2>

      <div className="flex flex-row gap-4">
        {tag ? (
          <div className="bg-purple-98 text-s text-purple-65 flex h-10 flex-row items-center gap-2 rounded px-2 uppercase">
            {tag}
            {tooltip ? (
              <Ariakit.HovercardProvider showTimeout={0} hideTimeout={0} placement="right">
                <Ariakit.HovercardAnchor
                  tabIndex={-1}
                  className="text-purple-82 hover:text-purple-65 cursor-pointer transition-colors"
                >
                  <Icon icon="tip" className="size-5" />
                </Ariakit.HovercardAnchor>
                <Ariakit.Hovercard
                  portal
                  gutter={8}
                  className="bg-grey-100 border-grey-90 flex w-fit max-w-80 rounded border p-2 shadow-md"
                >
                  {tooltip}
                </Ariakit.Hovercard>
              </Ariakit.HovercardProvider>
            ) : null}
          </div>
        ) : null}

        <Link
          className={CtaClassName({
            variant: isEdit ? 'secondary' : 'primary',
            color: isEdit ? 'grey' : 'purple',
          })}
          to={getRoute('/scenarios/:scenarioId/workflow', {
            scenarioId: fromUUIDtoSUUID(scenario.id),
          })}
        >
          <Icon icon={isEdit ? 'edit-square' : 'plus'} className="size-6" />
          <p>{t(isEdit ? 'scenarios:home.workflow.edit' : 'scenarios:home.workflow.create')}</p>
        </Link>
      </div>
    </section>
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
    <section className="flex flex-col gap-4">
      <h2 className="text-grey-00 text-m font-semibold">{t('scenarios:home.resources')}</h2>
      <div className="flex flex-row gap-4">
        {resources.map(({ tKey, href, src }) => (
          <a
            key={tKey}
            href={href}
            className="border-grey-90 hover:border-purple-65 focus:border-purple-65 group flex flex-col overflow-hidden rounded border outline-none transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={src} alt="" />
            <span className="border-grey-90 bg-grey-100 text-s group-hover:border-purple-65 group-focus:border-purple-65 flex flex-row items-center justify-between border-t p-4 font-semibold transition-colors">
              {t(tKey)}
              <Icon aria-hidden icon="arrow-right" className="size-6" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
