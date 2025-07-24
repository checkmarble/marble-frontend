import { Callout } from '@app-builder/components/Callout';
import { useUnavailabilitySettings } from '@app-builder/queries/personal-settings';
import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { useFormatLanguage } from '@app-builder/utils/format';
import { endOfTomorrow } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Calendar, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function SetMyselfUnavailable() {
  const { t } = useTranslation(['settings']);
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
        <div className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-green-34 text-grey-98 font-semibold bg-green-38 transition-all duration-100">
          <Icon icon="account-circle" className="size-5" />
          {t('settings:current-state-online')}
        </div>
      </Modal.Trigger>
      <Modal.Content className="gap-4">
        <Modal.Title>{t('settings:offline_mode')}</Modal.Title>
        <Callout variant="outlined" className="m-4">
          {t('settings:offline_mode_description')}
        </Callout>

        <div className="flex flex-row items-center justify-center gap-2">
          <Calendar
            mode="single"
            disabled={{ before: endOfTomorrow() }}
            selected={dateSelected}
            onSelect={setDateSelected}
            locale={getDateFnsLocale(language)}
          />
        </div>

        <Modal.Footer>
          <div className="flex flex-1 flex-row gap-2 p-4">
            <Modal.Close asChild>
              <Button variant="secondary" className="flex-1">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button
              variant="primary"
              className="flex-1"
              onClick={setMeUnavailable}
              disabled={!dateSelected}
            >
              {t('common:save')}
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
