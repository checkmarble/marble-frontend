import { Callout } from '@app-builder/components/Callout';
import { useUnavailabilitySettings } from '@app-builder/queries/personal-settings';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function SetMyselfAvailable() {
  const formatDateTime = useFormatDateTime();
  const { t } = useTranslation(['common', 'settings']);

  const { query: unavailabilityQuery, deleteUnavailability } = useUnavailabilitySettings();
  const [open, setOpen] = useState(false);
  const setMeUnavailable = () => {
    deleteUnavailability.mutate();
    setOpen(false);
  };
  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <div className="flex items-center gap-2 cursor-pointer p-2 rounded-sm hover:bg-red-hover text-grey-primary font-semibold bg-red-primary transition-all duration-100">
          <Icon icon="account-circle-off" className="size-5" />
          {t('settings:current_state_unavailable')}
        </div>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>
          {t('settings:set_myself_available.title', {
            date: unavailabilityQuery.data?.until
              ? formatDateTime(unavailabilityQuery.data.until, { dateStyle: 'medium' })
              : null,
          })}
        </Modal.Title>
        <Callout variant="outlined" className="m-8">
          {t('settings:set_myself_available.description.callout')}
        </Callout>

        <Modal.Footer>
          <Modal.Close asChild>
            <ButtonV2 variant="secondary" appearance="stroked">
              {t('common:cancel')}
            </ButtonV2>
          </Modal.Close>
          <ButtonV2 variant="primary" onClick={() => setMeUnavailable()}>
            <Icon icon="account-circle" className="size-4" />
            {t('settings:set_myself_available.validate.button')}
          </ButtonV2>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
