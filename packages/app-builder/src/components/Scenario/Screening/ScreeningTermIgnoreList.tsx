import { useGetCustomListsQuery } from '@app-builder/queries/get-custom-lists';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { MenuCommand, Switch } from 'ui-design-system';
import { scenarioI18n } from '../scenario-i18n';
import { FieldToolTip } from './FieldToolTip';

interface ScreeningTermIgnoreListProps {
  value?: string | null;
  onBlur: () => void;
  onChange: (value: string | null) => void;
  editor: 'view' | 'edit';
}

export const ScreeningTermIgnoreList = ({ value, onBlur, onChange, editor }: ScreeningTermIgnoreListProps) => {
  const { t } = useTranslation(scenarioI18n);
  const [selectedListId, setSelectedListId] = useState<string | null>(value ?? null);
  const [open, setOpen] = useState(false);
  const customListsQuery = useGetCustomListsQuery();

  const handleListSelect = (listId: string) => {
    setSelectedListId(listId);
    onChange(listId);
  };

  return match(customListsQuery)
    .with({ isPending: true }, () => <>Loading...</>)
    .with({ isError: true }, () => <>Error</>)
    .with({ isSuccess: true }, ({ data: customLists }) => {
      return (
        <div className="flex flex-col gap-sm">
          <div className="flex items-center gap-sm">
            <Switch
              checked={value !== null}
              onBlur={onBlur}
              onCheckedChange={(checked) => onChange(checked ? (selectedListId ?? customLists[0]?.id ?? null) : null)}
              disabled={editor === 'view'}
              id="remove-terms-from-list"
            />
            <label htmlFor="remove-terms-from-list" className="text-s">
              {t('scenarios:edit_sanction.remove_terms_from_list')}
            </label>
            <FieldToolTip>{t('scenarios:edit_sanction.remove_terms_from_list.tooltip')}</FieldToolTip>
          </div>
          {value ? (
            <div className="flex flex-col gap-xs">
              <MenuCommand.Menu persistOnSelect={false} open={open} onOpenChange={setOpen}>
                <MenuCommand.Trigger>
                  <MenuCommand.SelectButton className="w-52" disabled={editor === 'view'}>
                    <span className="text-grey-primary text-s font-medium">
                      {customLists.find((list) => list.id === selectedListId)?.name ||
                        t('scenarios:edit_sanction.select_list')}
                    </span>
                  </MenuCommand.SelectButton>
                </MenuCommand.Trigger>
                <MenuCommand.Content sameWidth className="mt-sm">
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
    })
    .exhaustive();
};
