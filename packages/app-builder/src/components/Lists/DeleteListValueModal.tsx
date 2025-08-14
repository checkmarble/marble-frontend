import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeleteListValueMutation } from '@app-builder/queries/lists/delete-value';
import { DeleteValuePayload, deleteValuePayloadSchema } from '@app-builder/schemas/lists';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, HiddenInputs, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DeleteListValueModal({
  listId,
  listValueId,
  value,
  children,
}: {
  listId: string;
  listValueId: string;
  value: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation(['lists', 'navigation', 'common']);
  const deleteListValueMutation = useDeleteListValueMutation();
  const revalidate = useLoaderRevalidator();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      listId,
      listValueId,
    } as DeleteValuePayload,
    validators: {
      onSubmit: deleteValuePayloadSchema,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        deleteListValueMutation.mutateAsync(value).then((result) => {
          revalidate();
          if (result.success) {
            setIsOpen(false);
            form.reset();
          }
        });
      }
    },
  });

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <form onSubmit={handleSubmit(form)}>
          <HiddenInputs listId={listId} listValueId={listValueId} />
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <div className="bg-red-95 mb-6 box-border rounded-[90px] p-4">
                <Icon icon="delete" className="text-red-47 size-16" />
              </div>
              <h1 className="text-l font-semibold">{t('lists:delete_value.title')}</h1>
              <p className="pb-4 text-center">
                {t('lists:delete_value.value_content')} <br />
                <b>{value}</b>
              </p>
              <p className="text-center">{t('lists:delete_value.no_return')}</p>
            </div>
            <div className="flex flex-1 flex-row gap-2">
              <Modal.Close asChild>
                <Button className="flex-1" variant="secondary">
                  {t('common:cancel')}
                </Button>
              </Modal.Close>
              <Button color="red" className="flex-1" variant="primary" type="submit" name="delete">
                <Icon icon="delete" className="size-6" />
                <p>{t('common:delete')}</p>
              </Button>
            </div>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
