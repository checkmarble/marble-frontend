import { type EnumField, resolveEnumDisplay, resolveEnumValues } from '@app-builder/models/enum-values';
import { useFormatLanguage } from '@app-builder/utils/format';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpandableGroupTagLine, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { EnumTag } from './EnumTag';

type EnumValueMenuProps = {
  field: EnumField;
  selectedValues: string[];
  currentValues?: string[];
  unavailableValues?: Array<string | number>;
} & (
  | { multiple: true; onChange: (values: string[]) => void }
  | { multiple?: false; onChange: (value: string) => void }
);

/** Existing closed-list values stay removable, but never become options after removal. */
export function EnumValueMenu(props: EnumValueMenuProps) {
  const { field, selectedValues, currentValues = selectedValues, unavailableValues = [] } = props;
  const { t } = useTranslation(['scenarios']);
  const language = useFormatLanguage();
  const [search, setSearch] = useState('');
  const resolved = resolveEnumValues(field, currentValues);
  const values = resolved.values.filter((value): value is string => typeof value === 'string');
  const searchValue = search.trim();
  const customValue =
    !resolved.closed && searchValue && !values.includes(searchValue) && !unavailableValues.includes(searchValue)
      ? searchValue
      : undefined;
  const staleValues = selectedValues.filter((value) => value !== '' && !values.includes(value));

  function select(value: string) {
    if (props.multiple)
      props.onChange(
        selectedValues.includes(value)
          ? selectedValues.filter((current) => current !== value)
          : [...selectedValues, value],
      );
    else props.onChange(value);
  }

  return (
    <MenuCommand.Menu persistOnSelect={props.multiple} onOpenChange={() => setSearch('')}>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton className="h-auto min-h-10 w-full min-w-0 overflow-hidden py-sm">
          {selectedValues.length > 0 ? (
            <ExpandableGroupTagLine
              classname="gap-xs pe-lg"
              overflowBehavior="popover"
              items={selectedValues.map((value) => (
                <EnumTag key={value} field={field} value={value} className="max-w-full" />
              ))}
            />
          ) : (
            <span className="pe-lg">{t('scenarios:value_switch.select_values')}</span>
          )}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="start" sideOffset={4} sameWidth>
        <MenuCommand.Combobox placeholder={t('scenarios:value_switch.search_values')} onValueChange={setSearch} />
        <MenuCommand.List>
          {values.map((value) => (
            <MenuCommand.Item
              key={value}
              value={`${value} ${resolveEnumDisplay(field, value, language).label}`}
              disabled={unavailableValues.includes(value)}
              onSelect={() => select(value)}
            >
              <EnumTag field={field} value={value} />
              {selectedValues.includes(value) ? <Icon icon="tick" className="size-4" /> : null}
            </MenuCommand.Item>
          ))}
          {staleValues.map((value) => (
            <MenuCommand.Item
              key={value}
              value={`${value} ${resolveEnumDisplay(field, value, language).label}`}
              disabled={!props.multiple}
              onSelect={() => select(value)}
            >
              <EnumTag field={field} value={value} />
              {props.multiple ? <Icon icon="delete" className="size-4" /> : null}
            </MenuCommand.Item>
          ))}
          {customValue ? (
            <MenuCommand.Item value={customValue} onSelect={() => select(customValue)}>
              {t('scenarios:value_switch.use_custom_value', { value: customValue })}
            </MenuCommand.Item>
          ) : null}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
