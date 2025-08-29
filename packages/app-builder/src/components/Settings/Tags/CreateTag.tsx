import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { ColorSelect } from '@app-builder/components/Tags/ColorSelect';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { tagColors } from '@app-builder/models/tags';
import {
  CreateTagPayload,
  createTagPayloadSchema,
  useCreateTagMutation,
} from '@app-builder/queries/settings/tags/create-tag';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateTag() {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  const handleOnSuccess = () => {
    setOpen(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button onClick={(e) => e.stopPropagation()}>
          <Icon icon="plus" className="size-6" />
          {t('settings:tags.new_tag')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <CreateTagContent onSuccess={handleOnSuccess} />
      </Modal.Content>
    </Modal.Root>
  );
}

const CreateTagContent = ({ onSuccess }: { onSuccess: () => void }) => {
  const { t } = useTranslation(['common', 'settings']);
  const createTagMutation = useCreateTagMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: { name: '', color: tagColors[0], target: 'case' } as CreateTagPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createTagMutation.mutateAsync(value).then((res) => {
          if (res.success) {
            onSuccess();
          }
          revalidate();
        });
      }
    },
    validators: {
      onSubmit: createTagPayloadSchema,
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
      <Modal.Title>{t('settings:tags.new_tag')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex gap-2">
          <form.Field
            name="name"
            validators={{
              onChange: createTagPayloadSchema.shape.name,
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
              onChange: createTagPayloadSchema.shape.color,
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
          <form.Field
            name="target"
            validators={{
              onChange: createTagPayloadSchema.shape.target,
            }}
          >
            {(field) => (
              <div className="group flex flex-col gap-2">
                <FormLabel name={field.name}>{t('settings:tags.target')}</FormLabel>
                <MenuCommand.Menu>
                  <MenuCommand.Trigger>
                    <MenuCommand.SelectButton>
                      {t(`settings:tags.target.${field.state.value}`)}
                    </MenuCommand.SelectButton>
                  </MenuCommand.Trigger>
                  <MenuCommand.Content sideOffset={4} align="start">
                    <MenuCommand.List>
                      <MenuCommand.Item onSelect={() => field.handleChange('case')}>
                        {t('settings:tags.target.case')}
                      </MenuCommand.Item>
                      <MenuCommand.Item onSelect={() => field.handleChange('object')}>
                        {t('settings:tags.target.object')}
                      </MenuCommand.Item>
                    </MenuCommand.List>
                  </MenuCommand.Content>
                </MenuCommand.Menu>
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" type="button" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            className="flex-1"
            variant="primary"
            type="submit"
            name="create"
            disabled={createTagMutation.isPending}
          >
            {t('settings:tags.new_tag.create')}
          </Button>
        </div>
      </div>
    </form>
  );
};
