import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type FileAnnotation } from '@app-builder/models';
import { useDeleteAnnotationMutation } from '@app-builder/queries/annotations/delete-annotation';
import { useCallbackRef } from '@marble/shared';
import { Trans, useTranslation } from 'react-i18next';
import { ButtonV2, Modal } from 'ui-design-system';

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
              Filenames: <span className="text-purple-primary" />,
            }}
            values={{
              filenames,
            }}
          />
        </Modal.Title>
        <Modal.Footer>
          <ButtonV2 variant="secondary" appearance="stroked" className="flex-1" onClick={onClose}>
            {t('common:cancel')}
          </ButtonV2>
          <ButtonV2 variant="destructive" className="flex-1" onClick={handleDelete}>
            {t('common:delete')}
          </ButtonV2>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
