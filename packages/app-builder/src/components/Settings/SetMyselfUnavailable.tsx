import { Callout } from '@app-builder/components/Callout';
import { useUnavailabilitySettings } from '@app-builder/queries/personal-settings';
import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { useFormatLanguage } from '@app-builder/utils/format';
import { endOfToday } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Modal } from 'ui-design-system';
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
        <div className="flex items-center gap-sm cursor-pointer p-sm rounded-sm hover:bg-green-34 text-grey-white font-semibold bg-green-primary transition-all duration-100">
          <Icon icon="account-circle" className="size-5" />
          {t('settings:current_state_available')}
        </div>
      </Modal.Trigger>
      <Modal.Content className="gap-md">
        <Modal.Title>{t('settings:set_myself_unavailable.title')}</Modal.Title>
        <Callout variant="outlined" className="m-md">
          {t('settings:offline_mode_description')}
        </Callout>

        <div className="flex flex-row items-center justify-center gap-sm">
          <Calendar
            mode="single"
            disabled={{ before: endOfToday() }}
            selected={dateSelected}
            onSelect={setDateSelected}
            locale={getDateFnsLocale(language)}
          />
        </div>

        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} />
          <Modal.FooterButton
            label={t('settings:set_myself_unavailable.validate.button')}
            onClick={setMeUnavailable}
            disabled={!dateSelected}
            leadingIcon="account-circle-off"
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
