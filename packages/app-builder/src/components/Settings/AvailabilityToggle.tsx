import { useDeleteUnavailabilityMutation } from '@app-builder/queries/personal-settings';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DateRange, MenuCommand, Modal, Separator } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { DateRangeFilter } from '../Filters';

export function AvailabilityToggle() {
  const { t } = useTranslation(['settings']);
  const { unavailabilityQuery } = useOrganizationDetails();
  const setMeAvailableMutation = useDeleteUnavailabilityMutation();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

  const [open, setOpen] = useState(false);

  console.log('=========>', unavailabilityQuery);

  const setMeAvailable = () => {
    console.log('set me available');
    setMeAvailableMutation.mutate();
  };

  return (
    <Modal.Root>
      <div className="flex flex-row items-center gap-2">
        <MenuCommand.Menu open={open} onOpenChange={setOpen}>
          <MenuCommand.Trigger>
            <Button
              variant="primary"
              color={
                unavailabilityQuery.isSuccess && unavailabilityQuery.data.unavailableUntil === null
                  ? 'green'
                  : 'red'
              }
            >
              {unavailabilityQuery.isSuccess &&
              unavailabilityQuery.data.unavailableUntil === null ? (
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
              {unavailabilityQuery.isSuccess &&
              unavailabilityQuery.data.unavailableUntil === null ? (
                <Modal.Trigger>
                  <MenuCommand.Item>
                    <Icon icon="account-circle" className="size-5" />
                    {t('settings:set-me-offline')}
                  </MenuCommand.Item>
                </Modal.Trigger>
              ) : (
                <MenuCommand.Item onSelect={() => setMeAvailable()}>
                  <Icon icon="account-circle-off" className="size-5" />
                  {t('settings:set-me-online')}
                </MenuCommand.Item>
              )}
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>

        <Modal.Content>
          <Modal.Title>{t('settings:offline_mode')}</Modal.Title>
          <p>{t('settings:offline_mode_description')}</p>

          <div className="flex flex-row items-center gap-2">
            <DateRangeFilter.Root
              dateRangeFilter={dateRange}
              setDateRangeFilter={setDateRange}
              className="grid"
            >
              <DateRangeFilter.FromNowPicker title={t('cases:filters.date_range.title')} />
              <Separator className="bg-grey-90" decorative orientation="vertical" />
              <DateRangeFilter.Calendar />
              <Separator className="bg-grey-90 col-span-3" decorative orientation="horizontal" />
              <DateRangeFilter.Summary className="col-span-3 row-span-1" />
            </DateRangeFilter.Root>
          </div>

          <Modal.Footer>
            <div className="flex flex-1 flex-row gap-2 p-4">
              <Modal.Close asChild>
                <Button variant="secondary" className="flex-1">
                  {t('common:cancel')}
                </Button>
              </Modal.Close>
              <Button variant="primary" className="flex-1">
                {t('common:save')}
              </Button>
            </div>{' '}
          </Modal.Footer>
        </Modal.Content>
      </div>
    </Modal.Root>
  );
}
