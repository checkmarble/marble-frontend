import { Callout } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { DateSelector } from '@app-builder/components/Form/DateSelector';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { type Scenario } from '@app-builder/models/scenario';
import { type ScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { scenarioObjectDocHref } from '@app-builder/services/documentation-href';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHydrated } from 'remix-utils/use-hydrated';
import { Button, ModalV2, Select, Tooltip } from 'ui-design-system';
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
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const scenarioId = fromParams(params, 'scenarioId');

  const [t, session, rawData, { testRun }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = createTestRunFormSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await testRun.launchTestRun({ ...data, scenarioId });

    return redirect(
      getRoute('/scenarios/:scenarioId/test-run', {
        scenarioId: fromUUID(scenarioId),
      }),
    );
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: isStatusConflictHttpError(error)
        ? t('common:errors.data.duplicate_test_run')
        : t('common:errors.unknown'),
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
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

  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  const shouldAllowCreate = useMemo(
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
      <Button disabled variant="primary" className="isolate h-10 w-fit cursor-not-allowed">
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
  const fetcher = useFetcher<typeof action>();

  const refIterations = useMemo(
    () => scenarioIterations.filter(({ type }) => type === 'live version'),
    [scenarioIterations],
  );
  const testIterations = useMemo(
    () => scenarioIterations.filter(({ type }) => type !== 'live version' && type !== 'draft'),
    [scenarioIterations],
  );
  const refIterationsOptions = useMemo(() => refIterations.map(({ id }) => id), [refIterations]);
  const testIterationsOptions = useMemo(() => testIterations.map(({ id }) => id), [testIterations]);

  const form = useForm({
    defaultValues: {
      refIterationId: refIterationsOptions[0] as string,
      testIterationId: testIterationsOptions[0] as string,
      endDate: new Date().toISOString(),
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/scenarios/:scenarioId/testrun/create', {
            scenarioId: fromUUID(currentScenario.id),
          }),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChangeAsync: createTestRunFormSchema,
      onBlurAsync: createTestRunFormSchema,
      onSubmitAsync: createTestRunFormSchema,
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
            <form.Field name="refIterationId">
              {(field) => (
                <div className="group flex w-full flex-col gap-2">
                  <FormLabel name={field.name}>{t('scenarios:create_testrun.ref')}</FormLabel>
                  <Select.Default name={field.name} defaultValue={field.state.value} disabled>
                    {refIterations.map(({ id }) => {
                      const iteration = refIterations.find(
                        ({ id: iterationId }) => iterationId === id,
                      );
                      return (
                        <Select.DefaultItem key={id} value={id}>
                          {`V${iteration?.version} ${
                            iteration?.type === 'live version' ? t('scenarios:live') : ''
                          }`}
                        </Select.DefaultItem>
                      );
                    })}
                  </Select.Default>
                  <FormErrorOrDescription errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
            <form.Field name="testIterationId">
              {(field) => (
                <div className="group flex w-full flex-col gap-2">
                  <FormLabel name={field.name}>{t('scenarios:create_testrun.phantom')}</FormLabel>
                  <Select.Default
                    placeholder={t('scenarios:create_testrun.phantom_placeholder')}
                    defaultValue={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    {testIterations.map(({ id }) => (
                      <Select.DefaultItem key={id} value={id}>
                        {`V${
                          testIterations.find(({ id: iterationId }) => iterationId === id)?.version
                        }`}
                      </Select.DefaultItem>
                    ))}
                  </Select.Default>
                  <FormErrorOrDescription />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="endDate">
            {(field) => (
              <div className="group flex w-full flex-col gap-2">
                <FormLabel name={field.name} className="flex flex-row items-center gap-1">
                  {t('scenarios:create_testrun.end_date')}
                </FormLabel>
                <DateSelector
                  name={field.name}
                  placeholder={t('scenarios:create_testrun.end_date_placeholder')}
                  onChange={(d) => field.handleChange(d.toISOString())}
                  defaultValue={new Date(field.state.value)}
                />
                <FormErrorOrDescription errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close render={<Button className="flex-1" type="button" variant="secondary" />}>
            {t('common:cancel')}
          </ModalV2.Close>
          <Button className="flex-1" variant="primary" type="submit">
            {t('common:save')}
          </Button>
        </div>
      </div>
    </form>
  );
}
