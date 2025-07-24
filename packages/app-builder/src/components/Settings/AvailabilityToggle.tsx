import { Callout } from '@app-builder/components/Callout';
import { useUnavailabilitySettings } from '@app-builder/queries/personal-settings';
import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { useFormatLanguage } from '@app-builder/utils/format';
import { endOfTomorrow } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Calendar, MenuCommand, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function AvailabilityToggle() {
  const { t } = useTranslation(['settings']);
  const language = useFormatLanguage();

  const {
    query: unavailabilityQuery,
    deleteUnavailability,
    setUnavailability,
  } = useUnavailabilitySettings();

  const [open, setOpen] = useState(false);
  const [_modalOpen, setModalOpen] = useState(false);
  const [dateSelected, setDateSelected] = useState<Date | undefined>(undefined);

  const setMeAvailable = () => {
    deleteUnavailability.mutate();
  };

  const setMeUnavailable = () => {
    setModalOpen(false);

    if (dateSelected) {
      setUnavailability.mutate({ until: dateSelected });
    }
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <div className="flex flex-row items-center gap-2">
        <MenuCommand.Menu open={open} onOpenChange={setOpen}>
          <MenuCommand.Trigger>
            <Button
              variant="primary"
              color={
                unavailabilityQuery.isSuccess && unavailabilityQuery.data.until === null
                  ? 'green'
                  : 'red'
              }
            >
              {unavailabilityQuery.isSuccess && unavailabilityQuery.data.until === null ? (
                <>
                  <Icon icon="account-circle" className="size-5" />
                  {t('settings:current-state-online')}
                </>
              ) : (
                <>
                  <Icon icon="account-circle-off" className="size-5" />
                  {t('settings:current-state-offline')}
                </>
              )}
            </Button>
          </MenuCommand.Trigger>
          <MenuCommand.Content>
            <MenuCommand.List>
              {unavailabilityQuery.isSuccess && unavailabilityQuery.data.until === null ? (
                <Modal.Trigger>
                  <MenuCommand.Item>
                    <Icon icon="account-circle" className="size-5" />
                    {t('settings:set-me-offline')}
                  </MenuCommand.Item>
                </Modal.Trigger>
              ) : (
                <MenuCommand.Item onSelect={() => setMeAvailable()}>
                  <Icon icon="account-circle" className="size-5" />
                  {t('settings:set-me-online')}
                </MenuCommand.Item>
              )}
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>

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
      </div>
    </Modal.Root>
  );
}
