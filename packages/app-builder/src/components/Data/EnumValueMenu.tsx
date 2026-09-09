import { type EnumField, resolveEnumDisplay, resolveEnumValues } from '@app-builder/models/enum-values';
import { useFormatLanguage } from '@app-builder/utils/format';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef, useState } from 'react';
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

const VIRTUALIZE_AFTER = 50;
const ENUM_ITEM_HEIGHT = 40;

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
  const virtualize = values.length > VIRTUALIZE_AFTER;
  const catalogValues = useMemo(
    () => (virtualize ? values.filter((value) => matchesEnumSearch(field, value, language, searchValue)) : values),
    [field, language, searchValue, values, virtualize],
  );
  const visibleStaleValues = virtualize
    ? staleValues.filter((value) => matchesEnumSearch(field, value, language, searchValue))
    : staleValues;

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
      <MenuCommand.Content align="start" sideOffset={4} sameWidth shouldFilter={!virtualize}>
        <MenuCommand.Combobox placeholder={t('scenarios:value_switch.search_values')} onValueChange={setSearch} />
        <MenuCommand.List>
          {virtualize ? (
            <VirtualizedEnumItems
              field={field}
              values={catalogValues}
              selectedValues={selectedValues}
              unavailableValues={unavailableValues}
              language={language}
              onSelect={select}
            />
          ) : (
            catalogValues.map((value) => (
              <EnumValueItem
                key={value}
                field={field}
                value={value}
                language={language}
                disabled={unavailableValues.includes(value)}
                onSelect={select}
                actionIcon={selectedValues.includes(value) ? 'tick' : undefined}
              />
            ))
          )}
          {visibleStaleValues.map((value) => (
            <EnumValueItem
              key={value}
              field={field}
              value={value}
              language={language}
              disabled={!props.multiple}
              onSelect={select}
              actionIcon={props.multiple ? 'delete' : undefined}
            />
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

function matchesEnumSearch(field: EnumField, value: string, language: string, search: string) {
  if (!search) return true;
  const query = search.toLowerCase();
  return `${value} ${resolveEnumDisplay(field, value, language).label}`.toLowerCase().includes(query);
}

function EnumValueItem({
  field,
  value,
  language,
  disabled,
  onSelect,
  actionIcon,
}: {
  field: EnumField;
  value: string;
  language: string;
  disabled: boolean;
  onSelect: (value: string) => void;
  actionIcon?: 'tick' | 'delete';
}) {
  return (
    <MenuCommand.Item
      value={`${value} ${resolveEnumDisplay(field, value, language).label}`}
      disabled={disabled}
      onSelect={() => onSelect(value)}
    >
      <EnumTag field={field} value={value} />
      {actionIcon ? <Icon icon={actionIcon} className="size-4" /> : null}
    </MenuCommand.Item>
  );
}

function VirtualizedEnumItems({
  field,
  values,
  selectedValues,
  unavailableValues,
  language,
  onSelect,
}: {
  field: EnumField;
  values: string[];
  selectedValues: string[];
  unavailableValues: Array<string | number>;
  language: string;
  onSelect: (value: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewportHeight = Math.min(320, Math.max(values.length, 1) * ENUM_ITEM_HEIGHT);
  const fitsInViewport = values.length * ENUM_ITEM_HEIGHT <= 320;
  const virtualizer = useVirtualizer({
    count: values.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ENUM_ITEM_HEIGHT,
    overscan: 8,
    observeElementRect: (_instance, cb) => {
      const element = scrollRef.current;
      cb({ width: element?.clientWidth || 400, height: element?.clientHeight || viewportHeight });
    },
  });
  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = !fitsInViewport ? (virtualRows[0]?.start ?? 0) : 0;
  const paddingBottom = !fitsInViewport && virtualRows.length > 0 ? totalSize - (virtualRows.at(-1)?.end ?? 0) : 0;
  const visibleValues = fitsInViewport ? values : virtualRows.flatMap((row) => values[row.index] ?? []);

  return (
    <div ref={scrollRef} className="overflow-y-auto" style={{ height: viewportHeight }}>
      {paddingTop > 0 ? <div aria-hidden className="shrink-0" style={{ height: paddingTop }} /> : null}
      {visibleValues.map((value) => (
        <EnumValueItem
          key={value}
          field={field}
          value={value}
          language={language}
          disabled={unavailableValues.includes(value)}
          onSelect={onSelect}
          actionIcon={selectedValues.includes(value) ? 'tick' : undefined}
        />
      ))}
      {paddingBottom > 0 ? <div aria-hidden className="shrink-0" style={{ height: paddingBottom }} /> : null}
    </div>
  );
}
