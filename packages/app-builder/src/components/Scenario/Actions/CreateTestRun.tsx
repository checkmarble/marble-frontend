import { Callout } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { DateSelector } from '@app-builder/components/Form/DateSelector';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type Scenario } from '@app-builder/models/scenario';
import { type ScenarioIterationWithType } from '@app-builder/models/scenario/iteration';
import { createTestRunPayloadSchema, useCreateTestRunMutation } from '@app-builder/queries/scenarios/create-testrun';
import { scenarioObjectDocHref } from '@app-builder/services/documentation-href';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, ButtonV2, ModalV2, Select, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

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
  const { t } = useTranslation(['common', 'scenarios']);
  const [open, setOpen] = useState(false);

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
        <ModalV2.Trigger render={children} />
        <ModalV2.Content className="overflow-visible">
          <CreateTestRunToContent currentScenario={currentScenario} scenarioIterations={scenarioIterations} />
        </ModalV2.Content>
      </ModalV2.Root>
    );

  return (
    <Tooltip.Default content={t('scenarios:testrun.not_allowed')}>
      <ButtonV2 disabled variant="primary" className="isolate cursor-not-allowed">
        <Icon icon="plus" className="size-3.5" aria-hidden />
        {t('scenarios:create_testrun.title')}
      </ButtonV2>
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
  const { t } = useTranslation(['common', 'scenarios']);
  const createTestRunMutation = useCreateTestRunMutation(currentScenario.id);
  const revalidate = useLoaderRevalidator();

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
        createTestRunMutation.mutateAsync(value).then(() => {
          revalidate();
        });
      }
    },
    validators: {
      onSubmitAsync: createTestRunPayloadSchema,
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
          <p className="whitespace-pre-wrap">
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
            <form.Field
              name="refIterationId"
              validators={{
                onBlur: createTestRunPayloadSchema.shape.refIterationId,
                onChange: createTestRunPayloadSchema.shape.refIterationId,
              }}
            >
              {(field) => (
                <div className="group flex w-full flex-col gap-2">
                  <FormLabel name={field.name}>{t('scenarios:create_testrun.ref')}</FormLabel>
                  <Select.Default name={field.name} defaultValue={field.state.value} disabled>
                    {refIterations.map(({ id }) => {
                      const iteration = refIterations.find(({ id: iterationId }) => iterationId === id);
                      return (
                        <Select.DefaultItem key={id} value={id}>
                          {`V${iteration?.version} ${iteration?.type === 'live version' ? t('scenarios:live') : ''}`}
                        </Select.DefaultItem>
                      );
                    })}
                  </Select.Default>
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
            <form.Field
              name="testIterationId"
              validators={{
                onBlur: createTestRunPayloadSchema.shape.testIterationId,
                onChange: createTestRunPayloadSchema.shape.testIterationId,
              }}
            >
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
                        {`V${testIterations.find(({ id: iterationId }) => iterationId === id)?.version}`}
                      </Select.DefaultItem>
                    ))}
                  </Select.Default>
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field
            name="endDate"
            validators={{
              onBlur: createTestRunPayloadSchema.shape.endDate,
              onChange: createTestRunPayloadSchema.shape.endDate,
            }}
          >
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
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
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
