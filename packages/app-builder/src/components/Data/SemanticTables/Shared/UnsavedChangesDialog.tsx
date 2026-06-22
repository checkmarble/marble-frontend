import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

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
        <div className="p-lg">
          <p className="text-s text-grey-primary">{t('data:unsaved_changes.description')}</p>
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} />
          <Modal.FooterButton label={t('data:unsaved_changes.confirm')} onClick={onConfirm} />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
