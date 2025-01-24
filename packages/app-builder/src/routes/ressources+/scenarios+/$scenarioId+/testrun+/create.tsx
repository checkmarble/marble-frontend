import { Callout } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormDateSelector } from '@app-builder/components/Form/FormDateSelector';
import { FormErrorOrDescription } from '@app-builder/components/Form/FormErrorOrDescription';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { type Scenario } from '@app-builder/models/scenario';
import { type ScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { scenarioObjectDocHref } from '@app-builder/services/documentation-href';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { FormProvider, getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHydrated } from 'remix-utils/use-hydrated';
import { Button, ModalV2, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
};

const createTestRunFormSchema = z.object({
  refIterationId: z.string(),
  testIterationId: z.string(),
  endDate: z.string(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const scenarioId = fromParams(params, 'scenarioId');
  const { testRun } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: createTestRunFormSchema,
  });

  if (submission.status !== 'success') {
    return json({ success: false as const, ...submission.reply() });
  }

  try {
    await testRun.launchTestRun({ ...submission.value, scenarioId });
    return redirect(
      getRoute('/scenarios/:scenarioId/test-run', {
        scenarioId: fromUUID(scenarioId),
      }),
    );
  } catch (error) {
    const errMessage = isStatusConflictHttpError(error)
      ? 'common:errors.data.duplicate_test_run'
      : 'common:errors.unknown';

    const { getSession, commitSession } = serverServices.toastSessionService;
    const session = await getSession(request);
    setToastMessage(session, {
      type: 'error',
      messageKey: errMessage,
    });
    return json(
      {
        success: false as const,
        ...submission.reply(),
      },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}

export function CreateTestRun({
  children,
  currentScenario,
  scenarioIterations,
  atLeastOneActiveTestRun,
}: {
  children: React.ReactElement;
  currentScenario: Scenario;
  scenarioIterations: ScenarioIterationWithType[];
  atLeastOneActiveTestRun: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();
  const navigation = useNavigation();
  const { t } = useTranslation(handle.i18n);

  React.useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  const shouldAllowCreate = React.useMemo(
    () =>
      scenarioIterations.length > 1 &&
      scenarioIterations.some((i) => i.type === 'live version') &&
      !atLeastOneActiveTestRun,
    [scenarioIterations, atLeastOneActiveTestRun],
  );

  if (shouldAllowCreate)
    return (
      <ModalV2.Root open={open} setOpen={setOpen}>
        <ModalV2.Trigger render={children} disabled={!hydrated} />
        <ModalV2.Content className="overflow-visible">
          <CreateTestRunToContent
            currentScenario={currentScenario}
            scenarioIterations={scenarioIterations}
          />
        </ModalV2.Content>
      </ModalV2.Root>
    );

  return (
    <Tooltip.Default content={t('scenarios:testrun.not_allowed')}>
      <Button
        disabled
        variant="primary"
        className="isolate h-10 w-fit cursor-not-allowed"
      >
        <Icon icon="plus" className="size-6" aria-hidden />
        {t('scenarios:create_testrun.title')}
      </Button>
    </Tooltip.Default>
  );
}

function CreateTestRunToContent({
  currentScenario,
  scenarioIterations,
}: {
  currentScenario: Scenario;
  scenarioIterations: ScenarioIterationWithType[];
}) {
  const { t } = useTranslation(handle.i18n);

  const createTestRunFetcher = useFetcher<typeof action>();
  const refIterations = React.useMemo(
    () => scenarioIterations.filter(({ type }) => type === 'live version'),
    [scenarioIterations],
  );

  const testIterations = React.useMemo(
    () =>
      scenarioIterations.filter(
        ({ type }) => type !== 'live version' && type !== 'draft',
      ),
    [scenarioIterations],
  );

  const refIterationsOptions = React.useMemo(
    () => refIterations.map(({ id }) => id),
    [refIterations],
  );

  const testIterationsOptions = React.useMemo(
    () => testIterations.map(({ id }) => id),
    [testIterations],
  );

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    lastResult: createTestRunFetcher.data,
    constraint: getZodConstraint(createTestRunFormSchema),
    defaultValue: {
      refIterationId: refIterationsOptions[0],
    },
    onValidate: ({ formData }) =>
      parseWithZod(formData, {
        schema: createTestRunFormSchema,
      }),
  });

  return (
    <FormProvider context={form.context}>
      <createTestRunFetcher.Form
        method="POST"
        action={getRoute('/ressources/scenarios/:scenarioId/testrun/create', {
          scenarioId: fromUUID(currentScenario.id),
        })}
        {...getFormProps(form)}
      >
        <ModalV2.Title>{t('scenarios:create_testrun.title')}</ModalV2.Title>
        <div className="flex flex-col gap-6 p-6">
          <ModalV2.Description render={<Callout variant="outlined" />}>
            <p className="whitespace-pre text-wrap">
              <Trans
                t={t}
                i18nKey="scenarios:create_testrun.callout"
                components={{
                  DocLink: <ExternalLink href={scenarioObjectDocHref} />,
                }}
              />
            </p>
          </ModalV2.Description>
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-row items-start gap-2">
              <FormField
                name={fields.refIterationId.name}
                className="group flex w-full flex-col gap-2"
              >
                <FormLabel>{t('scenarios:create_testrun.ref')}</FormLabel>
                <FormSelect.Default options={refIterationsOptions} disabled>
                  {refIterations.map(({ id }) => {
                    const iteration = refIterations.find(
                      ({ id: iterationId }) => iterationId === id,
                    );
                    return (
                      <FormSelect.DefaultItem key={id} value={id}>
                        {`V${iteration?.version} ${
                          iteration?.type === 'live version'
                            ? t('scenarios:live')
                            : ''
                        }`}
                      </FormSelect.DefaultItem>
                    );
                  })}
                </FormSelect.Default>
                <FormErrorOrDescription />
              </FormField>
              <FormField
                name={fields.testIterationId.name}
                className="group flex w-full flex-col gap-2"
              >
                <FormLabel>{t('scenarios:create_testrun.phantom')}</FormLabel>
                <FormSelect.Default
                  placeholder={t(
                    'scenarios:create_testrun.phantom_placeholder',
                  )}
                  options={testIterationsOptions}
                >
                  {testIterations.map(({ id }) => (
                    <FormSelect.DefaultItem key={id} value={id}>
                      {`V${
                        testIterations.find(
                          ({ id: iterationId }) => iterationId === id,
                        )?.version
                      }`}
                    </FormSelect.DefaultItem>
                  ))}
                </FormSelect.Default>
                <FormErrorOrDescription />
              </FormField>
            </div>
            <FormField
              name={fields.endDate.name}
              className="group flex w-full flex-col gap-2"
            >
              <FormLabel className="flex flex-row items-center gap-1">
                {t('scenarios:create_testrun.end_date')}
              </FormLabel>
              <FormDateSelector
                name={fields.endDate.name}
                placeholder={t('scenarios:create_testrun.end_date_placeholder')}
              />
              <FormErrorOrDescription />
            </FormField>
          </div>
          <div className="flex flex-1 flex-row gap-2">
            <ModalV2.Close
              render={<Button className="flex-1" variant="secondary" />}
            >
              {t('common:cancel')}
            </ModalV2.Close>
            <Button className="flex-1" variant="primary" type="submit">
              {t('common:save')}
            </Button>
          </div>
        </div>
      </createTestRunFetcher.Form>
    </FormProvider>
  );
}
