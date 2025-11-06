import { casesI18n } from '@app-builder/components/Cases/cases-i18n';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { EditNamePayload, editNamePayloadSchema, useEditNameMutation } from '@app-builder/queries/cases/edit-name';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const EditCaseName = ({ name, id }: { name: string; id: string }) => {
  const { t } = useTranslation(casesI18n);
  const editNameMutation = useEditNameMutation();
  const [isEditing, setIsEditing] = useState(false);
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    onSubmit: ({ value }) => {
      editNameMutation.mutateAsync(value).then((res) => {
        if (res.success) {
          setIsEditing(false);
        }
        revalidate();
      });
    },
    defaultValues: { name: name, caseId: id } as EditNamePayload,
    validators: {
      onSubmit: editNamePayloadSchema,
    },
  });

  return (
    <form onSubmit={handleSubmit(form)} className="w-full">
      <form.Field
        name="name"
        validators={{
          onBlur: editNamePayloadSchema.shape.name,
          onChange: editNamePayloadSchema.shape.name,
        }}
      >
        {(field) => (
          <div className="flex w-full flex-col gap-1">
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <ButtonV2
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-fit p-0.5"
                  variant="secondary"
                  mode="icon"
                >
                  <Icon icon="edit-square" className="text-grey-50 size-3.5" />
                </ButtonV2>
              ) : (
                <div className="flex items-center gap-2">
                  <ButtonV2 type="submit" disabled={form.state.isSubmitting} variant="primary">
                    <Icon icon="save" className="size-3.5" />
                    {t('common:save')}
                  </ButtonV2>
                  <ButtonV2
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset({ name, caseId: id });
                    }}
                    variant="secondary"
                    mode="icon"
                  >
                    <Icon icon="cross" className="text-grey-50 size-3.5" />
                  </ButtonV2>
                </div>
              )}
              <input
                type="text"
                name={field.name}
                disabled={!isEditing}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                className="text-grey-00 text-h1 w-full border-none bg-transparent font-normal outline-hidden"
                placeholder={t('cases:case.name')}
              />
            </div>
            <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
          </div>
        )}
      </form.Field>
    </form>
  );
};
