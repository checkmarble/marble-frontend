import { Highlight } from '@app-builder/components/Highlight';
import { type ApiKey } from '@app-builder/models/api-keys';
import { matchSorter } from '@app-builder/utils/search';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';

type ApiKeyFilterMenuProps = {
  apiKeys: ApiKey[];
  onSelect: (apiKeyId: string) => void;
};

export const ApiKeyFilterMenu = ({ apiKeys, onSelect }: ApiKeyFilterMenuProps) => {
  const { t } = useTranslation(['common']);
  const [searchValue, setSearchValue] = useState('');
  const deferredValue = useDeferredValue(searchValue);

  const matches = useMemo(
    () => matchSorter(apiKeys, deferredValue, { keys: ['description', 'prefix'] }),
    [deferredValue, apiKeys],
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <MenuCommand.Combobox placeholder={t('common:search')} onValueChange={setSearchValue} />
      <MenuCommand.List className="max-h-40">
        {matches.map((apiKey) => (
          <MenuCommand.Item
            key={apiKey.id}
            value={`${apiKey.description} ${apiKey.prefix}`.trim()}
            onSelect={() => onSelect(apiKey.id)}
          >
            <div className="flex flex-col">
              <Highlight text={apiKey.description} query={deferredValue} className="text-grey-primary text-s" />
              <span className="text-grey-secondary text-xs">{apiKey.prefix}*************</span>
            </div>
          </MenuCommand.Item>
        ))}
      </MenuCommand.List>
    </div>
  );
};
