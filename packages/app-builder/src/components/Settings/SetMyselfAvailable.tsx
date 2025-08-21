import { Callout } from '@app-builder/components/Callout';
import { useUnavailabilitySettings } from '@app-builder/queries/personal-settings';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function SetMyselfAvailable() {
  const language = useFormatLanguage();
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
        <div className="flex items-center gap-2 cursor-pointer p-2 rounded-sm hover:bg-red-43 text-grey-98 font-semibold bg-red-47 transition-all duration-100">
          <Icon icon="account-circle-off" className="size-5" />
          {t('settings:current_state_unavailable')}
        </div>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>
          {t('settings:set_myself_available.title', {
            date: unavailabilityQuery.data?.until
              ? formatDateTimeWithoutPresets(unavailabilityQuery.data.until, {
                  language,
                  dateStyle: 'medium',
                  timeStyle: undefined,
                })
              : null,
          })}
        </Modal.Title>
        <Callout variant="outlined" className="m-8">
          {t('settings:set_myself_available.description.callout')}
        </Callout>

        <Modal.Footer>
          <Modal.Close asChild>
            <div className="flex flex-1 flex-row gap-2 p-4">
              <Button variant="secondary" className="flex-1">
                {t('common:cancel')}
              </Button>

              <Button className="flex-1" variant="primary" onClick={() => setMeUnavailable()}>
                <Icon icon="account-circle" className="size-4" />

                {t('settings:set_myself_available.validate.button')}
              </Button>
            </div>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
