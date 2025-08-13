import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type FileAnnotation } from '@app-builder/models';
import { useDeleteAnnotationMutation } from '@app-builder/queries/annotations/delete-annotation';
import { useCallbackRef } from '@marble/shared';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';

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
    deleteAnnotationMutation.mutateAsync().then((result) => {
      revalidate();

      if (result.success) {
        onDelete?.();
        onClose();
      }
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
              Filenames: <span className="text-purple-65" />,
            }}
            values={{
              filenames,
            }}
          />
        </Modal.Title>
        <div className="flex justify-between gap-4 p-6">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            {t('common:cancel')}
          </Button>
          <Button variant="primary" color="red" className="flex-1" onClick={handleDelete}>
            {t('common:delete')}
          </Button>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
