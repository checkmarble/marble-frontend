import { useTranslation } from 'react-i18next';
import { ButtonV2, Modal } from 'ui-design-system';

interface UpsaleModalProps {
  open: boolean;
  onClose: () => void;
}

export function UpsaleModal({ open, onClose }: UpsaleModalProps) {
  const { t } = useTranslation(['common']);

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content size="small">
        <div className="flex flex-col items-center gap-v2-md p-v2-lg">
          <p className="text-m text-center">{t('common:upsale.no_access')}</p>
          <ButtonV2 asChild variant="primary" size="small">
            <a href="https://checkmarble.com/upgrade" target="_blank" rel="noreferrer">
              {t('common:upsale.see_premium_plans')}
            </a>
          </ButtonV2>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
