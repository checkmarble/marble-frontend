import { useUnavailabilitySettings } from '@app-builder/queries/personal-settings';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function SetMyselfAvailable() {
  const { t } = useTranslation(['settings']);

  const { query: unavailabilityQuery, deleteUnavailability } = useUnavailabilitySettings();
  console.log('unavailabilityQuery', unavailabilityQuery);
  const [open, setOpen] = useState(false);
  const setMeUnavailable = () => {
    deleteUnavailability.mutate();
    setOpen(false);
  };
  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <Button variant="primary" color="red">
          <Icon icon="account-circle" className="size-5" />
          {t('settings:current-state-offline')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('settings:set-me-online')}</Modal.Title>
        <Modal.Description>{t('settings:set-me-online-description')}</Modal.Description>
        <Modal.Close asChild>
          <Button variant="primary" color="green" onClick={() => setMeUnavailable()}>
            {t('settings:set-me-online')}
          </Button>
        </Modal.Close>
      </Modal.Content>
    </Modal.Root>
  );
}
