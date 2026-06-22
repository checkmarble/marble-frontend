import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeleteListMutation } from '@app-builder/queries/lists/delete-list';
import { DeleteListPayload, deleteListPayloadSchema } from '@app-builder/schemas/lists';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { Button, HiddenInputs, Modal, Typo } from 'ui-design-system';
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
        <Button variant="destructive" className="w-fit">
          <Icon icon="delete" className="size-5" />
          <p>{t('lists:delete_list.button')}</p>
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <form onSubmit={handleSubmit(form)}>
          <HiddenInputs listId={listId} />
          <div className="flex flex-col gap-lg p-lg">
            <div className="flex flex-1 flex-col items-center justify-center gap-sm">
              <div className="bg-red-background mb-lg box-border rounded-[90px] p-md">
                <Icon icon="delete" className="text-red-primary size-16" />
              </div>
              <Typo variant="title1">{t('lists:delete_list.title')}</Typo>
              <p className="text-center">{t('lists:delete_list.content')}</p>
            </div>
          </div>
          <Modal.Footer>
            <Modal.FooterButton isCloseButton label={t('common:cancel')} />
            <Modal.FooterButton
              label={t('common:delete')}
              type="submit"
              name="delete"
              variant="destructive"
              leadingIcon="delete"
            />
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
