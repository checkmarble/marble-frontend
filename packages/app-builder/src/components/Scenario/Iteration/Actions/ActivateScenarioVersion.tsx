import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { Spinner } from '@app-builder/components/Spinner';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  activateIterationPayloadSchema,
  useActivateIterationMutation,
} from '@app-builder/queries/scenarios/activate-iteration';
import { useRuleSnoozesQuery } from '@app-builder/queries/scenarios/rule-snoozes';
import { useScenarioIterationRulesMetadata } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_layout';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, CollapsibleV2, Modal, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

type ActivateScenarioVersionProps = {
  scenario: { id: string; isLive: boolean };
  iteration: { id: string; isValid: boolean };
};

export function ActivateScenarioVersion({ scenario, iteration }: ActivateScenarioVersionProps) {
  const { t } = useTranslation(['common', 'scenarios']);
  const [open, setOpen] = React.useState(false);

  const button = (
    <Button className="flex-1" variant="primary" disabled={!iteration.isValid}>
      <Icon icon="pushtolive" className="size-6" />
      {t('scenarios:deployment_modal.activate.button')}
    </Button>
  );

  if (!iteration.isValid) {
    return (
      <Tooltip.Default className="text-xs" content={t('scenarios:deployment_modal.activate.validation_error')}>
        {button}
      </Tooltip.Default>
    );
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{button}</Modal.Trigger>
      <Modal.Content>
        <ActivateScenarioVersionContent scenario={scenario} iterationId={iteration.id} />
      </Modal.Content>
    </Modal.Root>
  );
}

function ActivateScenarioVersionContent({
  scenario,
  iterationId,
}: {
  scenario: {
    id: string;
    isLive: boolean;
  };
  iterationId: string;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const activateIterationMutation = useActivateIterationMutation(scenario.id, iterationId);
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      changeIsImmediate: false,
      willBeLive: false,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        const activateIterationPayload = activateIterationPayloadSchema.safeParse(value);
        if (activateIterationPayload.success) {
          activateIterationMutation.mutateAsync(activateIterationPayload.data).then(() => {
            revalidate();
          });
        }
      }
    },
    validators: {
      onSubmit: activateIterationPayloadSchema,
    },
  });

  return (
    <form onSubmit={handleSubmit(form)}>
      <Modal.Title>{t('scenarios:deployment_modal.activate.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-col gap-4 font-medium">
          <p className="font-semibold">{t('scenarios:deployment_modal.activate.confirm')}</p>
          <form.Field
            name="willBeLive"
            validators={{
              onBlur: activateIterationPayloadSchema.shape.willBeLive,
              onChange: activateIterationPayloadSchema.shape.willBeLive,
            }}
          >
            {(field) => (
              <div className="group flex flex-row items-center gap-2">
                <Checkbox
                  name={field.name}
                  defaultChecked={field.state.value}
                  onCheckedChange={(state) => state !== 'indeterminate' && field.handleChange(state)}
                />
                <FormLabel name={field.name}>
                  {scenario.isLive
                    ? t('scenarios:deployment_modal.activate.replace_current_live_version')
                    : t('scenarios:deployment_modal.activate.will_be_live')}
                </FormLabel>
                <Tooltip.Default
                  content={<p className="max-w-60">{t('scenarios:deployment_modal.activate.live_version.tooltip')}</p>}
                >
                  <Icon icon="tip" className="hover:text-purple-primary text-purple-disabled size-6" />
                </Tooltip.Default>
              </div>
            )}
          </form.Field>
          <form.Field
            name="changeIsImmediate"
            validators={{
              onBlur: activateIterationPayloadSchema.shape.changeIsImmediate,
              onChange: activateIterationPayloadSchema.shape.changeIsImmediate,
            }}
          >
            {(field) => (
              <div className="group flex flex-row items-center gap-2">
                <Checkbox
                  name={field.name}
                  defaultChecked={field.state.value}
                  onCheckedChange={(state) => state !== 'indeterminate' && field.handleChange(state)}
                />
                <FormLabel name={field.name}>{t('scenarios:deployment_modal.activate.change_is_immediate')}</FormLabel>
              </div>
            )}
          </form.Field>
          <div className="min-h-6 w-full">
            <RuleSnoozeDetail scenarioId={scenario.id} iterationId={iterationId} />
          </div>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button className="flex-1" variant="primary" type="submit">
            <Icon icon="pushtolive" className="size-6" />
            {t('scenarios:deployment_modal.activate.button')}
          </Button>
        </div>
      </div>
    </form>
  );
}

function RuleSnoozeDetail({ scenarioId, iterationId }: { scenarioId: string; iterationId: string }) {
  const { t } = useTranslation(['common', 'scenarios']);
  const rulesMetadata = useScenarioIterationRulesMetadata();
  const ruleSnoozesQuery = useRuleSnoozesQuery(scenarioId, iterationId);

  if (ruleSnoozesQuery.isPending) return <Spinner className="size-5 shrink-0" />;

  if (ruleSnoozesQuery.isError) {
    return <div className="text-s text-red-primary">{t('common:errors.unknown')}</div>;
  }

  const ruleSnoozes = ruleSnoozesQuery.data.ruleSnoozes;
  const hasSnoozesActive = ruleSnoozes.some((snooze) => snooze.hasSnoozesActive);

  if (!hasSnoozesActive) {
    return (
      <p className="text-grey-secondary text-s first-letter:capitalize">
        {t('scenarios:deployment_modal.activate.without_rule_snooze')}
      </p>
    );
  }

  return (
    <CollapsibleV2.Provider>
      <CollapsibleV2.Title className="text-grey-secondary group flex flex-row items-center">
        <Icon
          icon="arrow-2-up"
          aria-hidden
          className="-ml-2 size-5 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 group-data-initial:rotate-180"
        />
        <span className="text-s mr-1 first-letter:capitalize">
          {t('scenarios:deployment_modal.activate.with_rule_snooze')}
        </span>
      </CollapsibleV2.Title>
      <CollapsibleV2.Content>
        <div className="max-h-40 overflow-y-auto p-1">
          <ul className="list-none">
            {rulesMetadata.map((rule) => {
              const hasSnoozesActive = ruleSnoozes.find((snooze) => snooze.ruleId === rule.id)?.hasSnoozesActive;
              return (
                <li key={rule.id} className="flex flex-row">
                  <Icon
                    className={clsx(
                      'size-5 shrink-0',
                      hasSnoozesActive === true && 'text-green-primary',
                      hasSnoozesActive === false && 'text-red-primary',
                    )}
                    icon={hasSnoozesActive ? 'tick' : 'cross'}
                  />
                  <span className="text-s text-grey-primary font-normal">{rule.name}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </CollapsibleV2.Content>
    </CollapsibleV2.Provider>
  );
}
