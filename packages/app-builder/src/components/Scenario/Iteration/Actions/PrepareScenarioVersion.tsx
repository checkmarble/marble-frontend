import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  prepareIterationPayloadSchema,
  usePrepareIterationMutation,
} from '@app-builder/queries/scenarios/prepare-iteration';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Modal, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function PrepareScenarioVersion({
  scenarioId,
  iteration,
  isPreparationServiceOccupied,
}: {
  scenarioId: string;
  iteration: {
    id: string;
    isValid: boolean;
  };
  isPreparationServiceOccupied: boolean;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const [open, setOpen] = React.useState(false);
  const handleSuccess = () => {
    setOpen(false);
  };

  const button = (
    <Button className="flex-1" variant="primary" disabled={!iteration.isValid}>
      <Icon icon="queue-list" className="size-6" />
      {t('scenarios:deployment_modal.prepare.button')}
    </Button>
  );

  if (!iteration.isValid) {
    return (
      <Tooltip.Default
        className="text-xs"
        content={t('scenarios:deployment_modal.prepare.validation_error')}
      >
        {button}
      </Tooltip.Default>
    );
  }
  if (isPreparationServiceOccupied) {
    return (
      <Tooltip.Default
        className="text-xs"
        content={t('scenarios:deployment_modal.prepare.preparation_service_occupied')}
      >
        {button}
      </Tooltip.Default>
    );
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{button}</Modal.Trigger>
      <Modal.Content>
        <PrepareScenarioVersionContent
          scenarioId={scenarioId}
          iterationId={iteration.id}
          onSuccess={handleSuccess}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

//TODO: customise to Prepare
function PrepareScenarioVersionContent({
  scenarioId,
  iterationId,
  onSuccess,
}: {
  scenarioId: string;
  iterationId: string;
  onSuccess: () => void;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const prepareIterationMutation = usePrepareIterationMutation(scenarioId, iterationId);
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      activateToGoInProd: false,
      preparationIsAsync: false,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        const payload = prepareIterationPayloadSchema.safeParse(value);
        if (payload.success) {
          prepareIterationMutation.mutateAsync(payload.data).then((res) => {
            if (!res) {
              onSuccess();
            }
            revalidate();
          });
        }
      }
    },
    validators: {
      onSubmitAsync: prepareIterationPayloadSchema,
    },
  });

  return (
    <form onSubmit={handleSubmit(form)}>
      <Modal.Title>{t('scenarios:deployment_modal.prepare.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-col gap-4 font-medium">
          <p className="font-semibold">{t('scenarios:deployment_modal.prepare.confirm')}</p>
          <form.Field
            name="activateToGoInProd"
            validators={{
              onBlur: prepareIterationPayloadSchema.shape.activateToGoInProd,
              onChange: prepareIterationPayloadSchema.shape.activateToGoInProd,
            }}
          >
            {(field) => (
              <div className="group flex flex-row items-center gap-2">
                <Checkbox
                  name={field.name}
                  defaultChecked={field.state.value}
                  onCheckedChange={(state) =>
                    state !== 'indeterminate' && field.handleChange(state)
                  }
                />
                <FormLabel name={field.name}>
                  {t('scenarios:deployment_modal.prepare.activate_to_go_in_prod')}
                </FormLabel>
                <Tooltip.Default
                  content={
                    <p className="max-w-60">
                      {t('scenarios:deployment_modal.prepare.activate_to_go_in_prod.tooltip')}
                    </p>
                  }
                >
                  <Icon icon="tip" className="hover:text-purple-65 text-purple-82 size-6" />
                </Tooltip.Default>
              </div>
            )}
          </form.Field>
          <form.Field
            name="preparationIsAsync"
            validators={{
              onBlur: prepareIterationPayloadSchema.shape.preparationIsAsync,
              onChange: prepareIterationPayloadSchema.shape.preparationIsAsync,
            }}
          >
            {(field) => (
              <div className="group flex flex-row items-center gap-2">
                <Checkbox
                  name={field.name}
                  defaultChecked={field.state.value}
                  onCheckedChange={(state) =>
                    state !== 'indeterminate' && field.handleChange(state)
                  }
                />
                <FormLabel name={field.name}>
                  {t('scenarios:deployment_modal.prepare.preparation_is_async')}
                </FormLabel>
              </div>
            )}
          </form.Field>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button className="flex-1" variant="primary" type="submit">
            <Icon icon="queue-list" className="size-6" />
            {t('scenarios:deployment_modal.prepare.button')}
          </Button>
        </div>
      </div>
    </form>
  );
}
