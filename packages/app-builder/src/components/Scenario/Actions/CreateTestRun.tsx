import { Callout } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { DateSelector } from '@app-builder/components/Form/DateSelector';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type Scenario } from '@app-builder/models/scenario';
import { type ScenarioIterationSummaryWithType } from '@app-builder/models/scenario/iteration';
import { createTestRunPayloadSchema, useCreateTestRunMutation } from '@app-builder/queries/scenarios/create-testrun';
import { scenarioObjectDocHref } from '@app-builder/services/documentation-href';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { Button, MenuCommand, Modal, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateTestRun({
  children,
  currentScenario,
  scenarioIterations,
  atLeastOneActiveTestRun,
}: {
  children: React.ReactElement;
  currentScenario: Scenario;
  scenarioIterations: ScenarioIterationSummaryWithType[];
  atLeastOneActiveTestRun: boolean;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const [open, setOpen] = useState(false);

  const hasLiveVersion = useMemo(() => scenarioIterations.some((i) => i.type === 'live version'), [scenarioIterations]);

  const hasTestableVersions = useMemo(
    () => scenarioIterations.some(({ type, archived }) => type !== 'live version' && type !== 'draft' && !archived),
    [scenarioIterations],
  );

  const shouldAllowCreate = hasLiveVersion && hasTestableVersions && !atLeastOneActiveTestRun;

  if (shouldAllowCreate)
    return (
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Trigger asChild>{children}</Modal.Trigger>
        <Modal.Content className="overflow-visible">
          <CreateTestRunToContent currentScenario={currentScenario} scenarioIterations={scenarioIterations} />
        </Modal.Content>
      </Modal.Root>
    );

  return (
    <Tooltip.Default content={t('scenarios:testrun.not_allowed')}>
      <Button disabled variant="primary" className="isolate cursor-not-allowed" appearance="stroked">
        <Icon icon="plus" className="size-4" aria-hidden />
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
  scenarioIterations: ScenarioIterationSummaryWithType[];
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const createTestRunMutation = useCreateTestRunMutation(currentScenario.id);
  const revalidate = useLoaderRevalidator();

  const refIterations = useMemo(
    () => scenarioIterations.filter(({ type }) => type === 'live version'),
    [scenarioIterations],
  );
  const testIterations = useMemo(
    () => scenarioIterations.filter(({ type, archived }) => type !== 'live version' && type !== 'draft' && !archived),
    [scenarioIterations],
  );

  const refIterationsOptions = useMemo(() => refIterations.map(({ id }) => id), [refIterations]);
  const testIterationsOptions = useMemo(() => testIterations.map(({ id }) => id), [testIterations]);

  const [testIterationMenuOpen, setTestIterationMenuOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      refIterationId: refIterationsOptions[0] as string,
      testIterationId: testIterationsOptions[0] as string,
      endDate: new Date().toISOString(),
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createTestRunMutation
          .mutateAsync(value)
          .then((res) => {
            if (res?.error === 'duplicate_test_run') {
              toast.error(t('common:errors.data.duplicate_test_run'));
            } else if (res?.error) {
              toast.error(t('common:errors.unknown'));
            } else {
              revalidate();
            }
          })
          .catch(() => {
            toast.error(t('common:errors.unknown'));
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
      <Modal.Title>{t('scenarios:create_testrun.title')}</Modal.Title>
      <div className="flex flex-col gap-lg p-lg">
        <Modal.Description asChild>
          <Callout variant="outlined">
            <p className="whitespace-pre-wrap">
              <Trans
                t={t}
                i18nKey="scenarios:create_testrun.callout"
                components={{
                  DocLink: <ExternalLink href={scenarioObjectDocHref} />,
                }}
              />
            </p>
          </Callout>
        </Modal.Description>
        <div className="flex flex-1 flex-col gap-md">
          <div className="flex flex-row items-start gap-sm">
            <form.Field
              name="refIterationId"
              validators={{
                onBlur: createTestRunPayloadSchema.shape.refIterationId,
                onChange: createTestRunPayloadSchema.shape.refIterationId,
              }}
            >
              {(field) => {
                const selectedRefIteration = refIterations.find(({ id }) => id === field.state.value);
                return (
                  <div className="group flex w-full flex-col gap-sm">
                    <FormLabel name={field.name}>{t('scenarios:create_testrun.ref')}</FormLabel>
                    <MenuCommand.SelectButton name={field.name} disabled>
                      {selectedRefIteration
                        ? `V${selectedRefIteration.version} ${selectedRefIteration.type === 'live version' ? t('scenarios:live') : ''}`
                        : null}
                    </MenuCommand.SelectButton>
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                );
              }}
            </form.Field>
            <form.Field
              name="testIterationId"
              validators={{
                onBlur: createTestRunPayloadSchema.shape.testIterationId,
                onChange: createTestRunPayloadSchema.shape.testIterationId,
              }}
            >
              {(field) => {
                const selectedTestIteration = testIterations.find(({ id }) => id === field.state.value);
                return (
                  <div className="group flex w-full flex-col gap-sm">
                    <FormLabel name={field.name}>{t('scenarios:create_testrun.phantom')}</FormLabel>
                    <MenuCommand.Menu open={testIterationMenuOpen} onOpenChange={setTestIterationMenuOpen}>
                      <MenuCommand.Trigger>
                        <MenuCommand.SelectButton name={field.name}>
                          {selectedTestIteration
                            ? `V${selectedTestIteration.version}`
                            : t('scenarios:create_testrun.phantom_placeholder')}
                        </MenuCommand.SelectButton>
                      </MenuCommand.Trigger>
                      <MenuCommand.Content sameWidth>
                        <MenuCommand.List>
                          {testIterations.map(({ id, version }) => (
                            <MenuCommand.Item
                              key={id}
                              value={id}
                              selected={id === field.state.value}
                              onSelect={() => {
                                field.handleChange(id);
                                setTestIterationMenuOpen(false);
                              }}
                            >
                              {`V${version}`}
                            </MenuCommand.Item>
                          ))}
                        </MenuCommand.List>
                      </MenuCommand.Content>
                    </MenuCommand.Menu>
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                );
              }}
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
              <div className="group flex w-full flex-col gap-sm">
                <FormLabel name={field.name} className="flex flex-row items-center gap-xs">
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
      </div>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton label={t('common:save')} type="submit" isLoading={createTestRunMutation.isPending} />
      </Modal.Footer>
    </form>
  );
}
