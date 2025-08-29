import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  deactivateIterationPayloadSchema,
  useDeactivateIterationMutation,
} from '@app-builder/queries/scenarios/deactivate-iteration';
import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DeactivateScenarioVersion({
  scenarioId,
  iterationId,
}: {
  scenarioId: string;
  iterationId: string;
}) {
  const { t } = useTranslation(['scenarios']);
  const [open, setOpen] = React.useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button className="flex-1" variant="primary" color="red">
          <Icon icon="stop" className="size-6" />
          {t('scenarios:deployment_modal.deactivate.button')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <DeactivateScenarioVersionContent scenarioId={scenarioId} iterationId={iterationId} />
      </Modal.Content>
    </Modal.Root>
  );
}

function DeactivateScenarioVersionContent({
  scenarioId,
  iterationId,
}: {
  scenarioId: string;
  iterationId: string;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const deactivateIterationMutation = useDeactivateIterationMutation(scenarioId, iterationId);
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      stopOperating: false,
      changeIsImmediate: false,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        const payload = deactivateIterationPayloadSchema.safeParse(value);
        if (payload.success) {
          deactivateIterationMutation.mutateAsync(payload.data).then(() => {
            revalidate();
          });
        }
      }
    },
    validators: {
      onSubmitAsync: deactivateIterationPayloadSchema,
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
      <Modal.Title>{t('scenarios:deployment_modal.deactivate.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-col gap-4 font-medium">
          <p className="font-semibold">{t('scenarios:deployment_modal.deactivate.confirm')}</p>
          <form.Field
            name="stopOperating"
            validators={{
              onBlur: deactivateIterationPayloadSchema.shape.stopOperating,
              onChange: deactivateIterationPayloadSchema.shape.stopOperating,
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
                  {t('scenarios:deployment_modal.deactivate.stop_operating')}
                </FormLabel>
              </div>
            )}
          </form.Field>
          <form.Field
            name="changeIsImmediate"
            validators={{
              onBlur: deactivateIterationPayloadSchema.shape.changeIsImmediate,
              onChange: deactivateIterationPayloadSchema.shape.changeIsImmediate,
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
                  {t('scenarios:deployment_modal.deactivate.change_is_immediate')}
                </FormLabel>
              </div>
            )}
          </form.Field>
          <p className="text-grey-80 text-xs font-medium">
            {t('scenarios:deployment_modal.deactivate.helper')}
          </p>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button className="flex-1" variant="primary" type="submit" color="red">
            <Icon icon="stop" className="size-6" />
            {t('scenarios:deployment_modal.deactivate.button')}
          </Button>
        </div>
      </div>
    </form>
  );
}
