import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { ColorSelect } from '@app-builder/components/Tags/ColorSelect';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  UpdateTagPayload,
  updateTagPayloadSchema,
  useUpdateTagMutation,
} from '@app-builder/queries/settings/tags/update-tag';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { type Tag } from 'marble-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function UpdateTag({ tag }: { tag: Tag }) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  const handleOnSuccess = () => {
    setOpen(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <Icon icon="edit-square" className="size-6 shrink-0" aria-label={t('settings:tags.update_tag')} />
      </Modal.Trigger>
      <Modal.Content>
        <UpdateTagContent tag={tag} onSuccess={handleOnSuccess} />
      </Modal.Content>
    </Modal.Root>
  );
}

const UpdateTagContent = ({ tag, onSuccess }: { tag: Tag; onSuccess: () => void }) => {
  const { t } = useTranslation(['common', 'settings']);
  const updateTagMutation = useUpdateTagMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: tag as UpdateTagPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateTagMutation.mutateAsync(value).then((res) => {
          if (res.success) {
            onSuccess();
          }
          revalidate();
        });
      }
    },
    validators: {
      onSubmit: updateTagPayloadSchema,
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
      <Modal.Title>{t('settings:tags.update_tag')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex gap-2">
          <form.Field
            name="name"
            validators={{
              onChange: updateTagPayloadSchema.shape.name,
            }}
          >
            {(field) => (
              <div className="group flex w-full flex-col gap-2">
                <FormLabel name={field.name}>{t('settings:tags.name')}</FormLabel>
                <FormInput
                  type="text"
                  name={field.name}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  defaultValue={field.state.value}
                  valid={field.state.meta.errors.length === 0}
                />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
          <form.Field
            name="color"
            validators={{
              onChange: updateTagPayloadSchema.shape.color,
            }}
          >
            {(field) => (
              <div className="group flex flex-col gap-2">
                <FormLabel name={field.name}>{t('settings:tags.color')}</FormLabel>
                <ColorSelect onChange={field.handleChange} value={field.state.value} />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
        </div>
        <Modal.Footer>
          <Modal.Close asChild>
            <ButtonV2 variant="secondary" appearance="stroked" type="button" name="cancel">
              {t('common:cancel')}
            </ButtonV2>
          </Modal.Close>
          <ButtonV2 variant="primary" type="submit" name="update" disabled={updateTagMutation.isPending}>
            {t('common:save')}
          </ButtonV2>
        </Modal.Footer>
      </div>
    </form>
  );
};
