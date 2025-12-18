import { DateRangeFilter } from '@app-builder/components/Filters';
import { DateRangeFilterType } from 'packages/ui-design-system/src/FiltersBar/types';
import { type FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, MenuCommand, Separator } from 'ui-design-system';

type DateRangeFilterMenuProps = {
  onSelect: (value: NonNullable<DateRangeFilterType>) => void;
};

export const DateRangeFilterMenu: FunctionComponent<DateRangeFilterMenuProps> = ({ onSelect }) => {
  const { t } = useTranslation(['common', 'settings']);
  const [value, setValue] = useState<DateRangeFilterType | null>(null);

  return (
    <>
      <MenuCommand.List>
        <DateRangeFilter.Root dateRangeFilter={value} setDateRangeFilter={setValue} className="grid">
          <DateRangeFilter.FromNowPicker title={t('settings:audit.filter.presets')} />
          <Separator className="bg-grey-90" decorative orientation="vertical" />
          <DateRangeFilter.Calendar />
          <Separator className="bg-grey-90 col-span-3" decorative orientation="horizontal" />
          <DateRangeFilter.Summary className="col-span-3 row-span-1" />
        </DateRangeFilter.Root>
      </MenuCommand.List>
      <div className="border-grey-90 flex justify-center gap-2 overflow-x-auto border-t p-2">
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
