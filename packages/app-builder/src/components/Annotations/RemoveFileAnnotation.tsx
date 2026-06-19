import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type FileAnnotation } from '@app-builder/models';
import { useDeleteAnnotationMutation } from '@app-builder/queries/annotations/delete-annotation';
import { useCallbackRef } from '@marble/shared';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

type RemoveFileAnnotationProps = {
  annotation: FileAnnotation;
  onClose: () => void;
  onDelete?: () => void;
};

export function RemoveFileAnnotation({ annotation, onClose, onDelete }: RemoveFileAnnotationProps) {
  const { t } = useTranslation(['cases', 'common']);
  const filenames = annotation.payload.files.map((f) => f.filename);
  const deleteAnnotationMutation = useDeleteAnnotationMutation(annotation.id);
  const revalidate = useLoaderRevalidator();

  const handleDelete = useCallbackRef(() => {
    deleteAnnotationMutation
      .mutateAsync()
      .then((result) => {
        revalidate();
        if (result.success) {
          toast.success(t('common:success.deleted'));
          onDelete?.();
          onClose();
        } else {
          toast.error(t('common:errors.unknown'));
        }
      })
      .catch(() => {
        toast.error(t('common:errors.unknown'));
      });
  });

  return (
    <Modal.Root open>
      <Modal.Content>
        <Modal.Title>
          <Trans
            t={t}
            i18nKey="cases:annotations.delete_files.title"
            components={{
              Filenames: <span className="text-purple-primary" />,
            }}
            values={{
              filenames,
            }}
          />
        </Modal.Title>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} onClick={onClose} />
          <Modal.FooterButton variant="destructive" label={t('common:delete')} onClick={handleDelete} />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
