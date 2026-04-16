import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';

type UnsavedChangesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function UnsavedChangesDialog({ open, onOpenChange, onConfirm }: UnsavedChangesDialogProps) {
  const { t } = useTranslation(['data', 'common']);

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content onClick={(event) => event.stopPropagation()}>
        <Modal.Title>{t('data:unsaved_changes.title')}</Modal.Title>
        <div className="p-6">
          <p className="text-s text-grey-primary">{t('data:unsaved_changes.description')}</p>
        </div>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button variant="secondary" appearance="stroked" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button variant="primary" name="confirm" onClick={onConfirm}>
            {t('data:unsaved_changes.confirm')}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
