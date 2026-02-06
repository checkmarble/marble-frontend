import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';

type ConfirmSaveModalProps = {
  onConfirm: () => void;
  children: React.ReactNode;
};

export const ConfirmSaveModal = ({ onConfirm, children }: ConfirmSaveModalProps) => {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);
  const handleSaveClick = () => {
    setOpen(false);
    onConfirm();
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <Modal.Title>{t('settings:ip_whitelisting.save')}</Modal.Title>
        <div className="flex flex-col gap-6 p-6">
          <div className="text-s flex flex-1 flex-col gap-4">
            <p className="text-center">{t('settings:ip_whitelisting.save_confirm.content')}</p>
          </div>
        </div>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button variant="secondary" appearance="stroked" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button variant="primary" name="delete" onClick={handleSaveClick}>
            {t('common:save')}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
