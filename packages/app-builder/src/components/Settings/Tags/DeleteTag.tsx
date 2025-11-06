import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeleteTagMutation } from '@app-builder/queries/settings/tags/delete-tag';
import { type Tag } from 'marble-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DeleteTag({ tag }: { tag: Tag }) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);

  const handleOnSuccess = () => {
    setOpen(false);
  };

  if (tag.cases_count !== 0 && tag.cases_count !== null) {
    return (
      <Icon
        icon="delete"
        className="group-hover:text-grey-80 size-6 shrink-0 cursor-not-allowed"
        aria-label={t('settings:tags.delete_tag')}
      />
    );
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <Icon icon="delete" className="size-6 shrink-0" aria-label={t('settings:tags.delete_tag')} />
      </Modal.Trigger>
      <Modal.Content>
        <DeleteTagContent tagId={tag.id} onSuccess={handleOnSuccess} />
      </Modal.Content>
    </Modal.Root>
  );
}

const DeleteTagContent = ({ tagId, onSuccess }: { tagId: string; onSuccess: () => void }) => {
  const { t } = useTranslation(['common', 'settings']);
  const deleteTagMutation = useDeleteTagMutation();
  const revalidate = useLoaderRevalidator();

  const handleDeleteTag = () => {
    deleteTagMutation.mutateAsync({ tagId }).then((res) => {
      if (res.success) {
        onSuccess();
      }
      revalidate();
    });
  };

  return (
    <>
      <Modal.Title>{t('settings:tags.delete_tag.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-1 flex-col gap-4">
          <input name="tagId" value={tagId} type="hidden" />
          <p className="text-center">{t('settings:tags.delete_tag.content')}</p>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            color="red"
            className="flex-1"
            variant="primary"
            type="submit"
            name="delete"
            onClick={handleDeleteTag}
            disabled={deleteTagMutation.isPending}
          >
            <Icon icon="delete" className="size-6" />
            {t('common:delete')}
          </Button>
        </div>
      </div>
    </>
  );
};
