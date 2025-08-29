import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  UpdateScenarioPayload,
  updateScenarioPayloadSchema,
  useUpdateScenarioMutation,
} from '@app-builder/queries/scenarios/update-scenario';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2 } from 'ui-design-system';

export function UpdateScenario({
  children,
  defaultValue,
}: {
  children: React.ReactElement;
  defaultValue: UpdateScenarioPayload;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content>
        <UpdateScenarioContent defaultValue={defaultValue} onUpdateSuccess={() => setOpen(false)} />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

function UpdateScenarioContent({
  defaultValue,
  onUpdateSuccess,
}: {
  defaultValue: UpdateScenarioPayload;
  onUpdateSuccess: () => void;
}) {
  const { t } = useTranslation(['scenarios', 'common']);
  const updateScenarioMutation = useUpdateScenarioMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: defaultValue,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateScenarioMutation.mutateAsync(value).then((res) => {
          if (res.success) {
            onUpdateSuccess();
          }
          revalidate();
        });
      }
    },
    validators: {
      onSubmitAsync: updateScenarioPayloadSchema,
    },
  });

  return (
    <form onSubmit={handleSubmit(form)}>
      <ModalV2.Title>{t('scenarios:update_scenario.title')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <form.Field
          name="name"
          validators={{
            onBlur: updateScenarioPayloadSchema.shape.name,
            onChange: updateScenarioPayloadSchema.shape.name,
          }}
        >
          {(field) => (
            <div className="group flex w-full flex-col gap-2">
              <FormLabel name={field.name}>{t('scenarios:create_scenario.name')}</FormLabel>
              <FormInput
                type="text"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                valid={field.state.meta.errors.length === 0}
                placeholder={t('scenarios:create_scenario.name_placeholder')}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field
          name="description"
          validators={{
            onBlur: updateScenarioPayloadSchema.shape.description,
            onChange: updateScenarioPayloadSchema.shape.description,
          }}
        >
          {(field) => (
            <div className="group flex w-full flex-col gap-2">
              <FormLabel name={field.name}>{t('scenarios:create_scenario.description')}</FormLabel>
              <FormInput
                type="text"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                valid={field.state.meta.errors.length === 0}
                placeholder={t('scenarios:create_scenario.description_placeholder')}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close render={<Button className="flex-1" variant="secondary" />}>
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
