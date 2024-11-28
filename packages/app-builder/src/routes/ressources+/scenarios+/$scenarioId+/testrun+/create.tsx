import { Callout } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormDateSelector } from '@app-builder/components/Form/FormDateSelector';
import { FormErrorOrDescription } from '@app-builder/components/Form/FormErrorOrDescription';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import {
  useCurrentScenario,
  useScenarioIterations,
} from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { scenarioObjectDocHref } from '@app-builder/services/documentation-href';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { FormProvider, getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHydrated } from 'remix-utils/use-hydrated';
import { Button, ModalV2 } from 'ui-design-system';
import { z } from 'zod';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
};

const createTestRunFormSchema = z.object({
  refIterationId: z.string(),
  phantomIterationId: z.string(),
  endDate: z.string(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const scenarioId = fromParams(params, 'scenarioId');
  const { testRunRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: createTestRunFormSchema,
  });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    const createdTestRun = await testRunRepository.launchTestRun({
      ...submission.value,
      scenarioId: fromUUID(scenarioId),
    });
    return redirect(
      getRoute('/scenarios/:scenarioId/test-run', {
        scenarioId: fromUUID(createdTestRun.id),
      }),
    );
  } catch (error) {
    return json(submission.reply());
  }
}

export function CreateTestRun({ children }: { children: React.ReactElement }) {
  const hydrated = useHydrated();
  return (
    <ModalV2.Root>
      <ModalV2.Trigger render={children} disabled={!hydrated} />
      <ModalV2.Content className="overflow-visible">
        <CreateTestRunToContent />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

function CreateTestRunToContent() {
  const { t } = useTranslation(handle.i18n);

  const createTestRunFetcher = useFetcher<typeof action>();
  const scenarioIterations = useScenarioIterations();
  const currentScenario = useCurrentScenario();
  const refIterations = React.useMemo(
    () => scenarioIterations.filter(({ type }) => type === 'live version'),
    [scenarioIterations],
  );
  const phantomIterations = React.useMemo(
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

  const phantomIterationsOptions = React.useMemo(
    () => phantomIterations.map(({ id }) => id),
    [phantomIterations],
  );

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    lastResult: createTestRunFetcher.data,
    constraint: getZodConstraint(createTestRunFormSchema),
    defaultValue: {
      refIterationId: refIterationsOptions[0],
    },
    onValidate({ formData }) {
      console.log('Form data', formData);
      return parseWithZod(formData, {
        schema: createTestRunFormSchema,
      });
    },
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
                name={fields.phantomIterationId.name}
                className="group flex w-full flex-col gap-2"
              >
                <FormLabel>{t('scenarios:create_testrun.phantom')}</FormLabel>
                <FormSelect.Default
                  placeholder={t(
                    'scenarios:create_testrun.phantom_placeholder',
                  )}
                  options={phantomIterationsOptions}
                >
                  {phantomIterations.map(({ id }) => (
                    <FormSelect.DefaultItem key={id} value={id}>
                      {`V${
                        phantomIterations.find(
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
            <ModalV2.Close
              render={
                <Button className="flex-1" variant="primary" type="submit" />
              }
            >
              {t('common:save')}
            </ModalV2.Close>
          </div>
        </div>
      </createTestRunFetcher.Form>
    </FormProvider>
  );
}
