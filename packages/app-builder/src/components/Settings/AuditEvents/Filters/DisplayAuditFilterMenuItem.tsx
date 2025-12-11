import { DateRangeFilter } from '@app-builder/components/Filters';
import { DateRangeFilterType } from 'packages/ui-design-system/src/FiltersBar/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2, Input, MenuCommand, Separator } from 'ui-design-system';

import { AuditEventsFilterLabel } from './AuditEventsFilterLabel';
import type { AuditEventsFilterName, AuditEventsFilters } from './filters';

type DisplayAuditFilterMenuItemProps = {
  filterName: AuditEventsFilterName;
  onSelect: (filters: Partial<AuditEventsFilters>) => void;
};

export const DisplayAuditFilterMenuItem = ({ filterName, onSelect }: DisplayAuditFilterMenuItemProps) => {
  return match(filterName)
    .with('dateRange', () => (
      <MenuCommand.SubMenu
        arrow={false}
        hover={false}
        trigger={
          <span>
            <AuditEventsFilterLabel name={filterName} />
          </span>
        }
        className="max-h-[600px]"
      >
        <DateRangeFilterMenu onSelect={(value) => onSelect({ [filterName]: value })} />
      </MenuCommand.SubMenu>
    ))
    .with('table', () => (
      <MenuCommand.SubMenu
        arrow={false}
        hover={false}
        trigger={
          <span>
            <AuditEventsFilterLabel name={filterName} />
          </span>
        }
      >
        <TextInputFilterMenu placeholder="decisions" onSelect={(value) => onSelect({ [filterName]: value })} />
      </MenuCommand.SubMenu>
    ))
    .with('entityId', () => (
      <MenuCommand.SubMenu
        arrow={false}
        hover={false}
        trigger={
          <span>
            <AuditEventsFilterLabel name={filterName} />
          </span>
        }
      >
        <TextInputFilterMenu placeholder="abc123..." onSelect={(value) => onSelect({ [filterName]: value })} />
      </MenuCommand.SubMenu>
    ))
    .exhaustive();
};

type DateRangeFilterMenuProps = {
  onSelect: (value: NonNullable<DateRangeFilterType>) => void;
};

const DateRangeFilterMenu = ({ onSelect }: DateRangeFilterMenuProps) => {
  const { t } = useTranslation(['common', 'settings']);
  const [value, setValue] = useState<DateRangeFilterType | null>(null);

  return (
    <>
      <MenuCommand.List>
        <DateRangeFilter.Root dateRangeFilter={value} setDateRangeFilter={setValue} className="grid">
          <DateRangeFilter.FromNowPicker title={t('settings:activity_follow_up.filter.presets')} />
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

type TextInputFilterMenuProps = {
  placeholder: string;
  onSelect: (value: string) => void;
};

const TextInputFilterMenu = ({ placeholder, onSelect }: TextInputFilterMenuProps) => {
  const { t } = useTranslation(['common']);
  const [value, setValue] = useState('');

  return (
    <div className="flex flex-col gap-2 p-2">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim()) {
            onSelect(value.trim());
          }
        }}
      />
      <MenuCommand.HeadlessItem
        onSelect={() => {
          if (value.trim()) {
            onSelect(value.trim());
          }
        }}
      >
        <ButtonV2 disabled={!value.trim()} size="default" className="w-full">
          {t('common:save')}
        </ButtonV2>
      </MenuCommand.HeadlessItem>
    </div>
  );
};
