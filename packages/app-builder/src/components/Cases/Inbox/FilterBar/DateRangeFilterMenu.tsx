import { DateRangeFilter } from '@app-builder/components/Filters';
import { DateRangeFilterType } from 'packages/ui-design-system/src/FiltersBar/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, MenuCommand, Separator } from 'ui-design-system';

type DateRangeFilterMenuProps = {
  onSelect: (value: NonNullable<DateRangeFilterType>) => void;
};

export const DateRangeFilterMenu = ({ onSelect }: DateRangeFilterMenuProps) => {
  const { t } = useTranslation(['common', 'cases']);
  const [value, setValue] = useState<DateRangeFilterType | null>(null);

  return (
    <>
      <MenuCommand.List>
        <DateRangeFilter.Root
          dateRangeFilter={value}
          setDateRangeFilter={setValue}
          className="grid"
        >
          <DateRangeFilter.FromNowPicker title={t('cases:filters.date_range.title')} />
          <Separator className="bg-grey-90" decorative orientation="vertical" />
          <DateRangeFilter.Calendar />
          <Separator className="bg-grey-90 col-span-3" decorative orientation="horizontal" />
          <DateRangeFilter.Summary className="col-span-3 row-span-1" />
        </DateRangeFilter.Root>
      </MenuCommand.List>
      <div className="border-grey-90 flex gap-2 overflow-x-auto border-t p-2 justify-center">
        <MenuCommand.HeadlessItem
          onSelect={() => {
            if (value) {
              onSelect(value);
            }
          }}
        >
          <ButtonV2 disabled={!value} size="default">
            {t('common:save')}
          </ButtonV2>
        </MenuCommand.HeadlessItem>
      </div>
    </>
  );
};
