import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeleteListMutation } from '@app-builder/queries/lists/delete-list';
import { DeleteListPayload, deleteListPayloadSchema } from '@app-builder/schemas/lists';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { ButtonV2, HiddenInputs, Modal } from 'ui-design-system';
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
        <ButtonV2 variant="destructive" className="w-fit">
          <Icon icon="delete" className="size-5" />
          <p>{t('lists:delete_list.button')}</p>
        </ButtonV2>
      </Modal.Trigger>
      <Modal.Content>
        <form onSubmit={handleSubmit(form)}>
          <HiddenInputs listId={listId} />
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <div className="bg-red-background mb-6 box-border rounded-[90px] p-4">
                <Icon icon="delete" className="text-red-primary size-16" />
              </div>
              <h1 className="text-l font-semibold">{t('lists:delete_list.title')}</h1>
              <p className="text-center">{t('lists:delete_list.content')}</p>
            </div>
            <Modal.Footer>
              <Modal.Close asChild>
                <ButtonV2 variant="secondary" appearance="stroked">
                  {t('common:cancel')}
                </ButtonV2>
              </Modal.Close>
              <ButtonV2 variant="destructive" type="submit" name="delete">
                <Icon icon="delete" className="size-5" />
                {t('common:delete')}
              </ButtonV2>
            </Modal.Footer>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
