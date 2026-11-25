import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { ColorSelect } from '@app-builder/components/Tags/ColorSelect';
import { tagColors } from '@app-builder/models/tags';
import {
  CreateTagPayload,
  createTagPayloadSchema,
  useCreateTagMutation,
} from '@app-builder/queries/settings/tags/create-tag';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input, MenuCommand, Modal } from 'ui-design-system';
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
        <Button variant="primary" appearance="stroked" onClick={(e) => e.stopPropagation()}>
          <Icon icon="plus" className="size-5" />
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
  const router = useRouter();

  const form = useForm({
    defaultValues: { name: '', color: tagColors[0], target: 'case' } as CreateTagPayload,
    onSubmit: async ({ value }) => {
      try {
        await createTagMutation.mutateAsync(value);
        toast.success(t('common:success.save'));
        onSuccess();
        router.invalidate();
      } catch {
        toast.error(t('common:errors.unknown'));
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
      <div className="flex flex-col gap-lg p-lg">
        <div className="flex gap-sm">
          <form.Field
            name="name"
            validators={{
              onChange: createTagPayloadSchema.shape.name,
            }}
          >
            {(field) => (
              <div className="group flex w-full flex-col gap-sm">
                <label htmlFor={field.name}>{t('settings:tags.name')}</label>
                <Input
                  id={field.name}
                  type="text"
                  name={field.name}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  defaultValue={field.state.value}
                  aria-invalid={field.state.meta.errors.length > 0 || undefined}
                  borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
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
              <div className="group flex flex-col gap-sm">
                <label htmlFor={field.name}>{t('settings:tags.color')}</label>
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
              <div className="group flex flex-col gap-sm">
                <label htmlFor={field.name}>{t('settings:tags.target')}</label>
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
      </div>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('common:cancel')} />
        <Modal.FooterButton
          label={t('settings:tags.new_tag.create')}
          type="submit"
          name="create"
          disabled={createTagMutation.isPending}
        />
      </Modal.Footer>
    </form>
  );
};
