import { Highlight } from '@app-builder/components/Highlight';
import { matchSorter } from '@app-builder/utils/search';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';

// Common table names used in the system
const AVAILABLE_TABLES = [
  'decisions',
  'cases',
  'scenarios',
  'scenario_iterations',
  'rules',
  'inboxes',
  'users',
  'api_keys',
  'tags',
  'webhooks',
  'custom_lists',
  'partners',
  'data_model',
  'scheduled_executions',
] as const;

type TableFilterMenuProps = {
  onSelect: (table: string) => void;
};

export const TableFilterMenu = ({ onSelect }: TableFilterMenuProps) => {
  const { t } = useTranslation(['settings']);
  const [searchValue, setSearchValue] = useState('');
  const deferredValue = useDeferredValue(searchValue);

  const matches = useMemo(() => {
    const tables = AVAILABLE_TABLES.map((table) => ({ id: table, name: table }));
    return matchSorter(tables, deferredValue, { keys: ['name'] });
  }, [deferredValue]);

  return (
    <div className="flex flex-col gap-2 p-2">
      <MenuCommand.Combobox
        placeholder={t('settings:activity_follow_up.filter.search_table')}
        onValueChange={setSearchValue}
      />
      <MenuCommand.List className="max-h-40">
        {matches.map((table) => (
          <MenuCommand.Item key={table.id} value={table.name} onSelect={() => onSelect(table.id)}>
            <Highlight text={table.name} query={deferredValue} className="text-grey-00 text-s" />
          </MenuCommand.Item>
        ))}
      </MenuCommand.List>
    </div>
  );
};
