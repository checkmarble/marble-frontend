import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeleteListMutation } from '@app-builder/queries/lists/delete-list';
import { DeleteListPayload, deleteListPayloadSchema } from '@app-builder/schemas/lists';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { Button, HiddenInputs, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DeleteListModal({ listId }: { listId: string }) {
  const { t } = useTranslation(['lists', 'navigation', 'common']);
  const deleteListMutation = useDeleteListMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      listId,
    } as DeleteListPayload,
    validators: {
      onSubmit: deleteListPayloadSchema,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        deleteListMutation.mutateAsync(value).then(() => {
          revalidate();
        });
      }
    },
  });

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button color="red" className="w-fit">
          <Icon icon="delete" className="size-6" />
          <p>{t('lists:delete_list.button')}</p>
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <form onSubmit={handleSubmit(form)}>
          <HiddenInputs listId={listId} />
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <div className="bg-red-95 mb-6 box-border rounded-[90px] p-4">
                <Icon icon="delete" className="text-red-47 size-16" />
              </div>
              <h1 className="text-l font-semibold">{t('lists:delete_list.title')}</h1>
              <p className="text-center">{t('lists:delete_list.content')}</p>
            </div>
            <div className="flex flex-1 flex-row gap-2">
              <Modal.Close asChild>
                <Button className="flex-1" variant="secondary">
                  {t('common:cancel')}
                </Button>
              </Modal.Close>
              <Button color="red" className="flex-1" variant="primary" type="submit" name="delete">
                <Icon icon="delete" className="size-6" />
                {t('common:delete')}
              </Button>
            </div>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
