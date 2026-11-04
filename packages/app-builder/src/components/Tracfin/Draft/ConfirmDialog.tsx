import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
};

/** A question with two answers; the consequence is spelled out before the analyst commits. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  const { t } = useTranslation(['common']);
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="small">
        <Modal.Title>{title}</Modal.Title>
        <Modal.Description className="text-s p-md">{description}</Modal.Description>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} />
          <Modal.FooterButton
            label={confirmLabel}
            variant={destructive ? 'destructive' : undefined}
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
