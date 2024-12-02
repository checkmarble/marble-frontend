import { CopyToClipboardButton } from '@app-builder/components';
import { CalloutV2 } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { Page } from '@app-builder/components/Page';
import {
  getFormattedLive,
  getFormattedVersion,
  ScenarioIterationMenu,
} from '@app-builder/components/Scenario/Iteration/ScenarioIterationMenu';
import { TriggerObjectTag } from '@app-builder/components/Scenario/TriggerObjectTag';
import { Spinner } from '@app-builder/components/Spinner';
import { type ScheduledExecution } from '@app-builder/models/decision';
import { type Scenario } from '@app-builder/models/scenario';
import { type ScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { UpdateScenario } from '@app-builder/routes/ressources+/scenarios+/update';
import { createDecisionDocHref } from '@app-builder/services/documentation-href';
import { serverServices } from '@app-builder/services/init.server';
import {
  formatDateRelative,
  formatSchedule,
  useFormatLanguage,
} from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import * as Ariakit from '@ariakit/react';
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace, type ParseKeys } from 'i18next';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHydrated } from 'remix-utils/use-hydrated';
import { Button, CtaClassName, MenuButton } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

import { useCurrentScenario, useScenarioIterations } from './_layout';
import { CreateTestRun } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/testrun+/create';

export const handle = {
  i18n: ['common', 'scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;
  const {
    user,
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

  return json({
    featureAccess: {
      isEditScenarioAvailable:
        featureAccessService.isEditScenarioAvailable(user),
      isManualTriggerScenarioAvailable:
        featureAccessService.isManualTriggerScenarioAvailable(user),
      isWorkflowsAvailable: await featureAccessService.isWorkflowsAvailable(),
      //isTestRunAvailable: await featureAccessService.isTestRunAvailable(),
      isTestRunAvailable: true,
    },
    scheduledExecutions,
    testRuns,
  });
}

const schema = z.object({
  iterationId: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const session = await getSession(request);

  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    await scenario.scheduleScenarioExecution({
      iterationId: submission.value.iterationId,
    });

    return json(submission.reply({ resetForm: true }));
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(submission, {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
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
      <Page.Header className="justify-between gap-4">
        <div className="flex w-full flex-row items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-4">
            <Page.BackLink to={getRoute('/scenarios/')} />
            <p className="line-clamp-2 text-start">{currentScenario.name}</p>
            <TriggerObjectTag>
              {currentScenario.triggerObjectType}
            </TriggerObjectTag>
            {featureAccess.isEditScenarioAvailable ? (
              <div className="flex flex-row gap-4">
                <UpdateScenario
                  defaultValue={{
                    name: currentScenario.name,
                    scenarioId: currentScenario.id,
                    description: currentScenario.description,
                  }}
                >
                  <Button
                    variant="secondary"
                    className="isolate h-10 w-fit"
                    disabled={!hydrated}
                  >
                    <Icon icon="edit-square" className="size-6" />
                    <p>{t('scenarios:update_scenario.title')}</p>
                  </Button>
                </UpdateScenario>
              </div>
            ) : null}
          </div>
        </div>
      </Page.Header>
      <Page.Container>
        {currentScenario.description ? (
          <Page.Description>{currentScenario.description}</Page.Description>
        ) : null}
        <Page.Content>
          <VersionSection scenarioIterations={scenarioIterations} />
          <ExecutionSection
            scenarioId={currentScenario.id}
            isManualTriggerScenarioAvailable={
              featureAccess.isManualTriggerScenarioAvailable
            }
            scheduledExecutions={scheduledExecutions}
            liveScenarioIteration={liveScenarioIteration}
          />
          {featureAccess.isTestRunAvailable ? (
            <TestRunSection scenarioId={currentScenario.id} />
          ) : null}
          {featureAccess.isWorkflowsAvailable ? (
            <WorkflowSection scenario={currentScenario} />
          ) : null}
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
    const liveVersion = scenarioIterations.find(
      (si) => si.type === 'live version',
    );
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
          scenarioId: fromUUID(si.scenarioId),
          iterationId: fromUUID(si.id),
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
      <h2 className="text-grey-100 text-m font-semibold">
        {t('scenarios:home.versions', {
          count: scenarioIterations.length,
        })}
      </h2>
      <div className="flex flex-row gap-3">
        {quickVersion ? (
          <QuickVersionAccess scenarioIteration={quickVersion} />
        ) : null}
        {quickDraft ? (
          <QuickVersionAccess scenarioIteration={quickDraft} />
        ) : null}
        {labelledOtherVersions.length > 0 ? (
          <ScenarioIterationMenu
            labelledScenarioIteration={labelledOtherVersions}
          >
            <MenuButton className="text-s text-grey-100 font-semibold outline-none transition-colors hover:text-purple-100 focus:text-purple-100">
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
        scenarioId: fromUUID(scenarioIteration.scenarioId),
        iterationId: fromUUID(scenarioIteration.id),
      })}
      className="bg-grey-00 border-grey-10 text-grey-100 text-s hover:bg-grey-05 active:bg-grey-10 flex min-w-24 flex-row items-center justify-center gap-1 rounded-full border py-2 transition-colors"
    >
      <span className="text-grey-100 text-s font-semibold capitalize">
        {currentFormattedVersion}
      </span>
      {currentFormattedLive ? (
        <span className="text-s font-semibold capitalize text-purple-100">
          {currentFormattedLive}
        </span>
      ) : null}
    </Link>
  );
}

function TestRunSection({ scenarioId }: { scenarioId: string }) {
  const { t } = useTranslation();
  const { testRuns } = useLoaderData<typeof loader>();

  const currentTestRun = React.useMemo(
    () => testRuns.filter((r) => r.status === 'up'),
    [testRuns],
  );

  const isExecutionOngoing = React.useMemo(
    () => currentTestRun.length > 0,
    [currentTestRun],
  );

  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-grey-100 text-m font-semibold">
        {t('scenarios:home.testrun')}
      </h2>
      <div className="flex max-w-[500px] flex-row gap-4">
        <div
          className={clsx(
            'bg-grey-00 border-grey-10 relative flex h-fit flex-col gap-4 rounded-lg border p-8',
            isExecutionOngoing && 'border-purple-100',
          )}
        >
          {isExecutionOngoing ? (
            <div className="text-grey-00 text-s absolute -top-6 start-8 flex h-6 w-fit flex-row items-center gap-1 rounded-t bg-purple-100 px-2 font-semibold">
              <Spinner className="size-3" />
              {t('scenarios:home.execution.batch.ongoing')}
            </div>
          ) : null}
          <CalloutV2>
            <div className="flex flex-col gap-4">
              <span>{t('scenarios:testrun.description')}</span>
            </div>
          </CalloutV2>

          <div className="flex flex-row gap-4">
            <CreateTestRun>
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
                  scenarioId: fromUUID(scenarioId),
                  testRunId: fromUUID(currentTestRun[0]!.id),
                })}
              >
                {t('scenarios:testrun.current_run')}
              </Link>
            ) : null}
            {testRuns.length > 1 ? (
              <Link
                className={CtaClassName({
                  variant: 'secondary',
                  color: 'grey',
                })}
                to={getRoute('/scenarios/:scenarioId/test-run', {
                  scenarioId: fromUUID(scenarioId),
                })}
              >
                {t('scenarios:home.other_versions_other', {
                  count: testRuns.length - 1,
                })}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExecutionSection({
  scenarioId,
  isManualTriggerScenarioAvailable,
  scheduledExecutions,
  liveScenarioIteration,
}: {
  scenarioId: string;
  isManualTriggerScenarioAvailable: boolean;
  scheduledExecutions: ScheduledExecution[];
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
    <section className="flex flex-col gap-4">
      <h2 className="text-grey-100 text-m font-semibold">
        {t('scenarios:home.execution')}
      </h2>
      <div className="flex max-w-5xl flex-row gap-4">
        <div className="bg-grey-00 border-grey-10 flex h-fit flex-1 flex-col gap-4 rounded-lg border p-8">
          <h3 className="text-grey-100 text-l font-bold">
            {t('scenarios:home.execution.real_time')}
          </h3>
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
              <span className="text-grey-100 text-s inline-flex items-center whitespace-pre font-semibold">
                {isLive ? (
                  <Trans
                    t={t}
                    i18nKey="scenarios:home.execution.real_time.callout.scenario_id"
                    components={{
                      CopyScenarioId: (
                        <CopyToClipboardButton toCopy={scenarioId}>
                          <code>scenario_id</code>
                        </CopyToClipboardButton>
                      ),
                    }}
                  />
                ) : (
                  t(
                    'scenarios:home.execution.real_time.callout.no_live_version',
                  )
                )}
              </span>
            </div>
          </CalloutV2>
        </div>
        <div
          className={clsx(
            'bg-grey-00 border-grey-10 relative flex h-fit flex-1 flex-col gap-4 rounded-lg border p-8',
            isExecutionOngoing && 'border-purple-100',
          )}
        >
          {isExecutionOngoing ? (
            <div className="text-grey-00 text-s absolute -top-6 start-8 flex h-6 w-fit flex-row items-center gap-1 rounded-t bg-purple-100 px-2 font-semibold">
              <Spinner className="size-3" />
              {t('scenarios:home.execution.batch.ongoing')}
            </div>
          ) : null}
          <h3 className="text-grey-100 text-l font-bold">
            {t('scenarios:home.execution.batch')}
          </h3>
          <CalloutV2>
            <div className="flex flex-col gap-4">
              <span>{t('scenarios:home.execution.batch.callout')}</span>
              {formattedSchedule ? (
                <span className="text-grey-100 text-s text-balance font-semibold">
                  <Trans
                    t={t}
                    i18nKey="scenarios:scheduled"
                    components={{
                      ScheduleLocale: <span className="text-purple-100" />,
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
                scenarioId: fromUUID(scenarioId),
              })}
            >
              {t('scenarios:home.execution.batch.scheduled_execution', {
                count: scheduledExecutions.length,
              })}
            </Link>
          </div>
        </div>
      </div>
    </section>
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
  const lastResult = useActionData<typeof action>();

  const [form, fields] = useForm({
    defaultValue: { iterationId },
    lastResult,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema,
      });
    },
  });

  return (
    <FormProvider context={form.context}>
      <Form method="post" {...getFormProps(form)}>
        <input
          {...getInputProps(fields.iterationId, { type: 'hidden' })}
          key={fields.iterationId.key}
        />
        <Button type="submit" disabled={disabled}>
          <Icon icon="play" className="size-6 shrink-0" aria-hidden />
          {t('scenarios:home.execution.batch.trigger_manual_execution')}
        </Button>
      </Form>
    </FormProvider>
  );
}

function WorkflowSection({ scenario }: { scenario: Scenario }) {
  const { t } = useTranslation(handle.i18n);

  const isEdit = scenario.decisionToCaseWorkflowType !== 'DISABLED';

  let tag: string | undefined;
  let tooltip: string | undefined;
  if (scenario.decisionToCaseWorkflowType === 'CREATE_CASE') {
    tag = t('scenarios:home.workflow_type.create_case');
    tooltip = t('scenarios:home.workflow_type.create_case.tooltip');
  } else if (
    scenario.decisionToCaseWorkflowType === 'ADD_TO_CASE_IF_POSSIBLE'
  ) {
    tag = t('scenarios:home.workflow_type.add_to_case_if_possible');
    tooltip = t('scenarios:home.workflow_type.add_to_case_if_possible.tooltip');
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-grey-100 text-m flex flex-row items-center gap-2 font-semibold">
        {t('scenarios:home.workflow')}

        <Ariakit.HovercardProvider
          showTimeout={0}
          hideTimeout={0}
          placement="right"
        >
          <Ariakit.HovercardAnchor
            tabIndex={-1}
            className="cursor-pointer text-purple-50 transition-colors hover:text-purple-100"
          >
            <Icon icon="tip" className="size-5" />
          </Ariakit.HovercardAnchor>
          <Ariakit.Hovercard
            portal
            gutter={8}
            className="bg-grey-00 border-grey-10 flex w-fit max-w-80 rounded border p-2 shadow-md"
          >
            {t('scenarios:home.workflow_description')}
          </Ariakit.Hovercard>
        </Ariakit.HovercardProvider>
      </h2>
      <div className="flex flex-row gap-3">
        {tag ? (
          <div className="bg-purple-05 text-s flex h-10 flex-row items-center gap-2 rounded px-2 uppercase text-purple-100">
            {tag}
            {tooltip ? (
              <Ariakit.HovercardProvider
                showTimeout={0}
                hideTimeout={0}
                placement="right"
              >
                <Ariakit.HovercardAnchor
                  tabIndex={-1}
                  className="cursor-pointer text-purple-50 transition-colors hover:text-purple-100"
                >
                  <Icon icon="tip" className="size-5" />
                </Ariakit.HovercardAnchor>
                <Ariakit.Hovercard
                  portal
                  gutter={8}
                  className="bg-grey-00 border-grey-10 flex w-fit max-w-80 rounded border p-2 shadow-md"
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
            scenarioId: fromUUID(scenario.id),
          })}
        >
          <Icon icon={isEdit ? 'edit-square' : 'plus'} className="size-6" />
          <p>
            {t(
              isEdit
                ? 'scenarios:home.workflow.edit'
                : 'scenarios:home.workflow.create',
            )}
          </p>
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
      <h2 className="text-grey-100 text-m font-semibold">
        {t('scenarios:home.resources')}
      </h2>
      <div className="flex flex-row gap-4">
        {resources.map(({ tKey, href, src }) => (
          <a
            key={tKey}
            href={href}
            className="border-grey-10 group flex flex-col overflow-hidden rounded border outline-none transition-colors hover:border-purple-100 focus:border-purple-100"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={src} alt="" />
            <span className="border-grey-10 bg-grey-00 text-s flex flex-row items-center justify-between border-t p-4 font-semibold transition-colors group-hover:border-purple-100 group-focus:border-purple-100">
              {t(tKey)}
              <Icon aria-hidden icon="arrow-right" className="size-6" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
