import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  commitIterationPayloadSchema,
  useCommitIterationMutation,
} from '@app-builder/queries/scenarios/commit-iteration';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Modal, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CommitIterationDraft({
  scenarioId,
  iteration,
}: {
  scenarioId: string;
  iteration: {
    id: string;
    isValid: boolean;
  };
}) {
  const { t } = useTranslation(['scenarios']);
  const [open, setOpen] = React.useState(false);

  const button = (
    <Button className="flex-1" variant="primary" disabled={!iteration.isValid}>
      <Icon icon="commit" className="size-6" />
      {t('scenarios:deployment_modal.commit.button')}
    </Button>
  );

  if (!iteration.isValid) {
    return (
      <Tooltip.Default
        className="text-xs"
        content={t('scenarios:deployment_modal.commit.validation_error')}
      >
        {button}
      </Tooltip.Default>
    );
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{button}</Modal.Trigger>
      <Modal.Content>
        <CommitScenarioDraftContent scenarioId={scenarioId} iterationId={iteration.id} />
      </Modal.Content>
    </Modal.Root>
  );
}

function CommitScenarioDraftContent({
  scenarioId,
  iterationId,
}: {
  scenarioId: string;
  iterationId: string;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const commitIterationMutation = useCommitIterationMutation(scenarioId, iterationId);
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      activateToGoInProd: false,
      draftIsReadOnly: false,
      changeIsImmediate: false,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        const payload = commitIterationPayloadSchema.safeParse(value);
        if (payload.success) {
          commitIterationMutation.mutateAsync(payload.data).then(() => {
            revalidate();
          });
        }
      }
    },
    validators: {
      onSubmitAsync: commitIterationPayloadSchema,
    },
  });

  return (
    <form onSubmit={handleSubmit(form)}>
      <Modal.Title>{t('scenarios:deployment_modal.commit.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-col gap-4 font-medium">
          <p className="font-semibold">{t('scenarios:deployment_modal.commit.confirm')}</p>
          <form.Field
            name="draftIsReadOnly"
            validators={{
              onBlur: commitIterationPayloadSchema.shape.draftIsReadOnly,
              onChange: commitIterationPayloadSchema.shape.draftIsReadOnly,
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
                  {t('scenarios:deployment_modal.commit.draft_is_readonly')}
                </FormLabel>
                <Tooltip.Default
                  content={
                    <p className="max-w-60">
                      {t('scenarios:deployment_modal.commit.draft_is_readonly.tooltip')}
                    </p>
                  }
                >
                  <Icon icon="tip" className="hover:text-purple-65 text-purple-82 size-6" />
                </Tooltip.Default>
              </div>
            )}
          </form.Field>
          <form.Field
            name="activateToGoInProd"
            validators={{
              onBlur: commitIterationPayloadSchema.shape.activateToGoInProd,
              onChange: commitIterationPayloadSchema.shape.activateToGoInProd,
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
                  {t('scenarios:deployment_modal.commit.activate_to_go_in_prod')}
                </FormLabel>
                <Tooltip.Default
                  content={
                    <p className="max-w-60">
                      {t('scenarios:deployment_modal.commit.activate_to_go_in_prod.tooltip')}
                    </p>
                  }
                >
                  <Icon icon="tip" className="hover:text-purple-65 text-purple-82 size-6" />
                </Tooltip.Default>
              </div>
            )}
          </form.Field>
          <form.Field
            name="changeIsImmediate"
            validators={{
              onBlur: commitIterationPayloadSchema.shape.changeIsImmediate,
              onChange: commitIterationPayloadSchema.shape.changeIsImmediate,
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
                  {t('scenarios:deployment_modal.commit.change_is_immediate')}
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
            <Icon icon="commit" className="size-6" />
            {t('scenarios:deployment_modal.commit.button')}
          </Button>
        </div>
      </div>
    </form>
  );
}
