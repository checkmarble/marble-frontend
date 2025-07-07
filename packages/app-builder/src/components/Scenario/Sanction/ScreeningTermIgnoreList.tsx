import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { scenarioI18n } from '../scenario-i18n';
import { FieldToolTip } from './FieldToolTip';

interface CustomList {
  id: string;
  name: string;
}

interface ScreeningTermIgnoreListProps {
  value?: string | null;
  onBlur: () => void;
  onChange: (value: string | null) => void;
  editor: 'view' | 'edit';
  customLists: CustomList[];
}

export const ScreeningTermIgnoreList = ({
  value,
  onBlur,
  onChange,
  editor,
  customLists,
}: ScreeningTermIgnoreListProps) => {
  const { t } = useTranslation(scenarioI18n);
  const [selectedListId, setSelectedListId] = useState<string | null>(value ?? null);
  const [open, setOpen] = useState(false);

  const handleListSelect = (listId: string) => {
    setSelectedListId(listId);
    onChange(listId);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <Switch
          checked={value !== null}
          onBlur={onBlur}
          onCheckedChange={(checked) =>
            onChange(checked ? (selectedListId ?? customLists[0]?.id ?? null) : null)
          }
          disabled={editor === 'view'}
        />
        <span className="text-s">{t('scenarios:edit_sanction.remove_terms_from_list')}</span>
        <FieldToolTip>
          {t('scenarios:edit_sanction.remove_terms_from_list.tooltip')}
        </FieldToolTip>
      </div>
      {value ? (
        <div className="flex flex-col gap-1">
          <MenuCommand.Menu persistOnSelect={false} open={open} onOpenChange={setOpen}>
            <MenuCommand.Trigger>
              <Button
                variant="secondary"
                size="medium"
                className="w-52 justify-between"
                disabled={editor === 'view'}
              >
                <span className="text-grey-00 text-s font-medium">
                  {customLists.find((list) => list.id === selectedListId)?.name ||
                    t('scenarios:edit_sanction.select_list')}
                </span>
                <Icon icon="caret-down" className="text-grey-50 size-4" />
              </Button>
            </MenuCommand.Trigger>
            <MenuCommand.Content sameWidth className="mt-2">
              <MenuCommand.List>
                {customLists.map((list) => (
                  <MenuCommand.Item key={list.id} onSelect={() => handleListSelect(list.id)}>
                    {list.name}
                  </MenuCommand.Item>
                ))}
              </MenuCommand.List>
            </MenuCommand.Content>
          </MenuCommand.Menu>
        </div>
      ) : null}
    </div>
  );
};
