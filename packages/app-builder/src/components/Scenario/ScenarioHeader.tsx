import { BackButton } from '@app-builder/components/Breadcrumbs';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { Scenario } from '@app-builder/models/scenario';
import {
  type UpdateScenarioPayload,
  updateScenarioPayloadSchema,
  useUpdateScenarioMutation,
} from '@app-builder/queries/scenarios/update-scenario';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useHydrated } from '@tanstack/react-router';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'scenarios'] satisfies Namespace,
};

type ScenarioHeaderProps = {
  isEditScenarioAvailable: boolean;
  scenario: Scenario;
};

export function ScenarioHeader({ isEditScenarioAvailable, scenario }: ScenarioHeaderProps) {
  const hydrated = useHydrated();
  const { t } = useTranslation(handle.i18n);

  return (
    <div className="flex flex-row items-center gap-v2-xs">
      <BackButton />
      <EditableScenarioField
        scenarioId={scenario.id}
        name={scenario.name}
        description={scenario.description ?? ''}
        fieldName="name"
        placeholder={t('scenarios:create_scenario.name')}
        editLabel={t('scenarios:update_scenario.title')}
        disabled={!isEditScenarioAvailable || !hydrated}
        displayValueClassName="text-h2 truncate"
        inputClassName="text-h2 min-w-0 flex-1 border-none bg-transparent font-normal outline-hidden"
      />
      <Tag size="small" color="grey" className="flex items-center gap-2">
        {scenario.triggerObjectType}
        <Icon icon="tip" className="size-4" />
      </Tag>
    </div>
  );
}

export function ScenarioDescriptionEditable({
  isEditScenarioAvailable,
  scenario,
}: {
  isEditScenarioAvailable: boolean;
  scenario: Scenario;
}) {
  const hydrated = useHydrated();
  const { t } = useTranslation(handle.i18n);

  return (
    <EditableScenarioField
      scenarioId={scenario.id}
      name={scenario.name}
      description={scenario.description ?? ''}
      fieldName="description"
      placeholder={t('scenarios:create_scenario.description_placeholder')}
      editLabel={t('scenarios:update_scenario.title')}
      disabled={!isEditScenarioAvailable || !hydrated}
      formClassName="w-full"
      containerClassName="w-full items-center gap-3"
      displayValueClassName="min-w-0"
      emptyValueClassName="text-grey-placeholder"
      inputClassName="text-s text-grey-secondary min-w-0 flex-1 border-none bg-transparent font-normal outline-hidden"
    />
  );
}

export function EditableScenarioField({
  scenarioId,
  name,
  description,
  fieldName,
  placeholder,
  editLabel,
  disabled,
  formClassName,
  containerClassName,
  displayValueClassName,
  emptyValueClassName,
  inputClassName,
}: {
  scenarioId: string;
  name: string;
  description: string;
  fieldName: 'name' | 'description';
  placeholder: string;
  editLabel: string;
  disabled: boolean;
  formClassName?: string;
  containerClassName?: string;
  displayValueClassName?: string;
  emptyValueClassName?: string;
  inputClassName?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const updateScenarioMutation = useUpdateScenarioMutation();
  const revalidate = useLoaderRevalidator();
  const fieldSchema =
    fieldName === 'name' ? updateScenarioPayloadSchema.shape.name : updateScenarioPayloadSchema.shape.description;

  const form = useForm({
    defaultValues: {
      scenarioId,
      name,
      description,
    } satisfies UpdateScenarioPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateScenarioMutation.mutateAsync(value).then(() => {
          setIsEditing(false);
          revalidate();
        });
      }
    },
    validators: {
      onSubmitAsync: updateScenarioPayloadSchema,
    },
  });

  useEffect(() => {
    form.reset({
      scenarioId,
      name,
      description,
    });
  }, [description, form, name, scenarioId]);

  return (
    <form onSubmit={handleSubmit(form)} className={clsx('min-w-0', formClassName)}>
      <form.Field
        name={fieldName}
        validators={{
          onBlur: fieldSchema,
          onChange: fieldSchema,
        }}
      >
        {(field) => (
          <div className="flex min-w-0 flex-col gap-1">
            <div className={clsx('flex min-w-0 items-center gap-2', containerClassName)}>
              {isEditing ? (
                <input
                  type="text"
                  name={field.name}
                  autoFocus
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      form.handleSubmit();
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setIsEditing(false);
                      form.reset({ scenarioId, name, description });
                    }
                  }}
                  className={inputClassName}
                  placeholder={placeholder}
                  aria-label={placeholder}
                />
              ) : (
                <>
                  <p className={clsx(displayValueClassName, !field.state.value && emptyValueClassName)}>
                    {field.state.value || placeholder}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    mode="icon"
                    disabled={disabled}
                    aria-label={editLabel}
                    title={editLabel}
                    onClick={() => setIsEditing(true)}
                    className="text-grey-secondary"
                  >
                    <Icon icon="edit" className="size-4" />
                  </Button>
                </>
              )}
            </div>
            {isEditing ? <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} /> : null}
          </div>
        )}
      </form.Field>
    </form>
  );
}
