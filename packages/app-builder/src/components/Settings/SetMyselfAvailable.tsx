import { Callout } from '@app-builder/components/Callout';
import { useUnavailabilitySettings } from '@app-builder/queries/personal-settings';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';
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
        <div className="flex items-center gap-sm cursor-pointer p-sm rounded-sm hover:bg-red-hover text-grey-primary font-semibold bg-red-primary transition-all duration-100">
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
        <Callout variant="outlined" className="m-xl">
          {t('settings:set_myself_available.description.callout')}
        </Callout>

        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} />
          <Modal.FooterButton
            label={t('settings:set_myself_available.validate.button')}
            onClick={() => setMeUnavailable()}
            leadingIcon="account-circle"
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
