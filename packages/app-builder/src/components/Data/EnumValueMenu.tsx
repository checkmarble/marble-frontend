import type { EnumValue } from '@app-builder/models/data-model';
import { type EnumField, resolveEnumDisplay, resolveEnumValues } from '@app-builder/models/enum-values';
import { useFormatLanguage } from '@app-builder/utils/format';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpandableGroupTagLine, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { EnumTag } from './EnumTag';

type EnumValueMenuProps = {
  field: EnumField;
  selectedValues: EnumValue[];
  currentValues?: EnumValue[];
  unavailableValues?: EnumValue[];
  /** Offers the typed text as a value even when the catalog is closed (e.g. countries outside the ISO list). */
  allowCustomValues?: boolean;
  /** With `multiple`: once this many values are picked, the other values can no longer be picked. */
  maxSelected?: number;
} & (
  | { multiple: true; onChange: (values: EnumValue[]) => void }
  | { multiple?: false; onChange: (value: EnumValue) => void }
);

const VIRTUALIZE_AFTER = 50;
const ENUM_ITEM_HEIGHT = 40;

/** Existing closed-list values stay removable, but never become options after removal. */
export function EnumValueMenu(props: EnumValueMenuProps) {
  return (
    <MenuCommand.Menu persistOnSelect={props.multiple}>
      <EnumValueMenuBody {...props} />
    </MenuCommand.Menu>
  );
}

// Rendered inside the Menu to use its search state, the one the Combobox input shows, instead of a local copy.
function EnumValueMenuBody(props: EnumValueMenuProps) {
  const { field, selectedValues, currentValues = selectedValues, unavailableValues = [] } = props;
  const { t } = useTranslation(['scenarios']);
  const language = useFormatLanguage();
  const menuState = MenuCommand.State.useSharp();
  const search = menuState.value.search;
  const resolved = resolveEnumValues(field, currentValues);
  const values = resolved.values;
  const searchValue = search.trim();
  const numeric = field.dataType === 'Int' || field.dataType === 'Float';
  const parsedValue = numeric ? Number(searchValue) : searchValue;
  const validValue =
    !numeric || (Number.isFinite(parsedValue) && (field.dataType !== 'Int' || Number.isInteger(parsedValue)));
  const full = props.multiple === true && props.maxSelected !== undefined && selectedValues.length >= props.maxSelected;
  const customValue =
    (!resolved.closed || props.allowCustomValues) &&
    !full &&
    searchValue &&
    validValue &&
    !values.includes(parsedValue) &&
    !unavailableValues.includes(parsedValue)
      ? parsedValue
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

  function select(value: EnumValue) {
    if (props.multiple) {
      // The menu stays open after a pick: show the full list again for the next one.
      menuState.actions.setSearch('');
      props.onChange(
        selectedValues.includes(value)
          ? selectedValues.filter((current) => current !== value)
          : [...selectedValues, value],
      );
    } else props.onChange(value);
  }

  return (
    <>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton
          className="h-auto min-h-10 w-full min-w-0 overflow-hidden py-sm"
          // The menu state outlives a close: open on an empty search.
          onClick={() => menuState.actions.setSearch('')}
        >
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
        <MenuCommand.Combobox placeholder={t('scenarios:value_switch.search_values')} />
        <MenuCommand.List>
          {virtualize ? (
            <VirtualizedEnumItems
              field={field}
              values={catalogValues}
              selectedValues={selectedValues}
              unavailableValues={unavailableValues}
              full={full}
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
                disabled={unavailableValues.includes(value) || (full && !selectedValues.includes(value))}
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
          {customValue !== undefined ? (
            <MenuCommand.Item value={searchValue} onSelect={() => select(customValue)}>
              {t('scenarios:value_switch.use_custom_value', { value: String(customValue) })}
            </MenuCommand.Item>
          ) : null}
        </MenuCommand.List>
      </MenuCommand.Content>
    </>
  );
}

function matchesEnumSearch(field: EnumField, value: EnumValue, language: string, search: string) {
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
  value: EnumValue;
  language: string;
  disabled: boolean;
  onSelect: (value: EnumValue) => void;
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
  full,
  language,
  onSelect,
}: {
  field: EnumField;
  values: EnumValue[];
  selectedValues: EnumValue[];
  unavailableValues: EnumValue[];
  full: boolean;
  language: string;
  onSelect: (value: EnumValue) => void;
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
          disabled={unavailableValues.includes(value) || (full && !selectedValues.includes(value))}
          onSelect={onSelect}
          actionIcon={selectedValues.includes(value) ? 'tick' : undefined}
        />
      ))}
      {paddingBottom > 0 ? <div aria-hidden className="shrink-0" style={{ height: paddingBottom }} /> : null}
    </div>
  );
}
