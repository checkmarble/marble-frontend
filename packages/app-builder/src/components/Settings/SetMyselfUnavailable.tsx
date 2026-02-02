import { Callout } from '@app-builder/components/Callout';
import { useUnavailabilitySettings } from '@app-builder/queries/personal-settings';
import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { useFormatLanguage } from '@app-builder/utils/format';
import { endOfToday } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Calendar, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function SetMyselfUnavailable() {
  const { t } = useTranslation(['common', 'settings']);
  const language = useFormatLanguage();

  const { setUnavailability } = useUnavailabilitySettings();
  const [open, setOpen] = useState(false);
  const [dateSelected, setDateSelected] = useState<Date | undefined>(undefined);
  const setMeUnavailable = () => {
    setOpen(false);

    if (dateSelected) {
      setUnavailability.mutate({ until: dateSelected });
    }
  };
  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <div className="flex items-center gap-2 cursor-pointer p-2 rounded-sm hover:bg-green-34 text-grey-white font-semibold bg-green-primary transition-all duration-100">
          <Icon icon="account-circle" className="size-5" />
          {t('settings:current_state_available')}
        </div>
      </Modal.Trigger>
      <Modal.Content className="gap-4">
        <Modal.Title>{t('settings:set_myself_unavailable.title')}</Modal.Title>
        <Callout variant="outlined" className="m-4">
          {t('settings:offline_mode_description')}
        </Callout>

        <div className="flex flex-row items-center justify-center gap-2">
          <Calendar
            mode="single"
            disabled={{ before: endOfToday() }}
            selected={dateSelected}
            onSelect={setDateSelected}
            locale={getDateFnsLocale(language)}
          />
        </div>

        <Modal.Footer>
          <Modal.Close asChild>
            <ButtonV2 variant="secondary" appearance="stroked">
              {t('common:cancel')}
            </ButtonV2>
          </Modal.Close>
          <ButtonV2 variant="primary" onClick={setMeUnavailable} disabled={!dateSelected}>
            <Icon icon="account-circle-off" className="size-4" />
            {t('settings:set_myself_unavailable.validate.button')}
          </ButtonV2>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
