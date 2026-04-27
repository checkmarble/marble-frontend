import * as allCountryFlags from 'country-flag-emojis/flags';
import type { CountryFlag } from 'country-flag-emojis/types';
import { type ComponentProps, forwardRef, useId, useMemo } from 'react';
import { Icon } from 'ui-icons';

import { Input } from '../Input/Input';
import { MenuCommand } from '../MenuCommand/MenuCommand';
import { type SelectTriggerProps, selectTrigger } from '../Select/Select';
import { cn } from '../utils';

export type SelectCountryValue = {
  isoAlpha2: string;
  isoAlpha3: string;
  name: string;
  isManual: boolean;
};

type MenuOmitted = 'children' | 'className';

export type SelectCountryProps = {
  value: SelectCountryValue | null;
  onValueChange: (value: SelectCountryValue | null) => void;
  /**
   * When true (default), shows a text field so the user can type a country name
   * that is not taken from the list. Clears the list selection when used.
   */
  allowManualName?: boolean;
  manualNamePlaceholder?: string;
  manualNameInputAriaLabel?: string;
  searchPlaceholder?: string;
  rootClassName?: string;
  manualInputClassName?: string;
  placeholder?: string;
  border?: SelectTriggerProps['border'];
  borderColor?: SelectTriggerProps['borderColor'];
} & Pick<ComponentProps<typeof MenuCommand.SelectButton>, 'className' | 'disabled' | 'name' | 'onBlur' | 'id'> &
  Omit<ComponentProps<typeof MenuCommand.Menu>, MenuOmitted> & { menuContentClassName?: string };

function buildCountryList(): { countries: readonly CountryFlag[]; byIso2: ReadonlyMap<string, CountryFlag> } {
  const list = Object.values(allCountryFlags as Record<string, CountryFlag>).sort((a, b) =>
    a.nameEnglish.localeCompare(b.nameEnglish),
  );
  const byIso2 = new Map<string, CountryFlag>();
  for (const c of list) {
    byIso2.set(c.isoAlpha2, c);
  }
  return { countries: list, byIso2 };
}

function itemFilterValue(c: CountryFlag) {
  return `${c.nameEnglish} ${c.isoAlpha2} ${c.isoAlpha3}`;
}

/**
 * Searchable country selector: `MenuCommand` with combobox (cmdk) search, flag emoji + English name,
 * and optional free-text country name. List filtering uses the same search behavior as
 * `MenuCommand.Combobox` + `MenuCommand.Item` `value` strings.
 */
export const SelectCountry = forwardRef<HTMLButtonElement, SelectCountryProps>(function SelectCountry(
  {
    value,
    onValueChange,
    allowManualName = true,
    manualNamePlaceholder = 'Or type a country name',
    manualNameInputAriaLabel = 'Enter country name manually',
    searchPlaceholder = 'Search country…',
    rootClassName,
    manualInputClassName,
    menuContentClassName,
    placeholder = 'Select country',
    border = 'square',
    borderColor = 'greyfigma-90',
    className,
    name,
    disabled,
    onBlur,
    id: selectId,
    open: openProp,
    onOpenChange: onOpenChangeProp,
    defaultOpen,
    ...restMenuRootProps
  },
  ref,
) {
  const { countries, byIso2 } = useMemo(buildCountryList, []);
  const manualFieldId = useId();

  const listIso2 = value && !value.isManual ? value.isoAlpha2 : undefined;
  const selectedFromList = listIso2 ? byIso2.get(listIso2) : undefined;
  const displayTrigger = () => {
    if (value?.isManual) {
      return (
        <span className="text-s text-grey-primary flex min-w-0 items-center gap-2 font-medium">
          <span className="truncate">{value.name}</span>
        </span>
      );
    }
    if (selectedFromList) {
      return (
        <span className="text-s text-grey-primary flex min-w-0 items-center gap-2 font-medium">
          <span aria-hidden className="shrink-0">
            {selectedFromList.flag}
          </span>
          <span className="truncate">{selectedFromList.nameEnglish}</span>
        </span>
      );
    }
    return (
      <span className="text-s text-grey-disabled font-medium" id={selectId ? `${selectId}-placeholder` : undefined}>
        {placeholder}
      </span>
    );
  };

  const handleListChange = (iso2: string) => {
    const c = byIso2.get(iso2);
    if (!c) return;
    onValueChange({
      isoAlpha2: c.isoAlpha2,
      isoAlpha3: c.isoAlpha3,
      name: c.nameEnglish,
      isManual: false,
    });
  };

  return (
    <div className={cn('flex flex-col gap-2', rootClassName)}>
      <MenuCommand.Menu
        open={openProp}
        onOpenChange={onOpenChangeProp}
        defaultOpen={defaultOpen}
        {...restMenuRootProps}
      >
        <MenuCommand.Trigger>
          <MenuCommand.SelectButton
            id={selectId}
            ref={ref}
            name={name}
            disabled={disabled}
            onBlur={onBlur}
            className={cn(
              selectTrigger({
                border,
                borderColor,
                backgroundColor: disabled ? 'disabled' : 'enabled',
              }),
              'min-w-0 w-full',
              className,
            )}
          >
            {displayTrigger()}
          </MenuCommand.SelectButton>
        </MenuCommand.Trigger>
        <MenuCommand.Content
          align="start"
          sameWidth
          sideOffset={4}
          className={cn('max-h-[min(300px,calc(100dvh-4rem))]', menuContentClassName)}
        >
          <MenuCommand.Combobox placeholder={searchPlaceholder} />
          <MenuCommand.List className="max-h-60 min-h-0">
            {countries.map((c) => (
              <MenuCommand.Item
                key={c.isoAlpha2}
                value={itemFilterValue(c)}
                className="cursor-pointer"
                selected={c.isoAlpha2 === listIso2}
                onSelect={() => handleListChange(c.isoAlpha2)}
              >
                <span className="text-s text-grey-primary flex w-full min-w-0 items-center justify-between gap-2 font-medium">
                  <span className="flex min-w-0 items-center gap-2">
                    <span aria-hidden className="shrink-0">
                      {c.flag}
                    </span>
                    <span className="truncate">{c.nameEnglish}</span>
                  </span>
                  {c.isoAlpha2 === listIso2 ? (
                    <Icon icon="tick" className="size-5 shrink-0 text-purple-primary" />
                  ) : null}
                </span>
              </MenuCommand.Item>
            ))}
            <MenuCommand.Empty>
              <p className="text-s text-grey-secondary flex items-center justify-center p-2">No country matches</p>
            </MenuCommand.Empty>
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>

      {allowManualName ? (
        <Input
          id={manualFieldId}
          className={manualInputClassName}
          value={value?.isManual ? value.name : ''}
          placeholder={manualNamePlaceholder}
          borderColor="greyfigma-90"
          aria-label={manualNameInputAriaLabel}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value;
            if (v.length === 0) {
              onValueChange(null);
            } else {
              onValueChange({
                isoAlpha2: '',
                isoAlpha3: '',
                name: v,
                isManual: true,
              });
            }
          }}
        />
      ) : null}
    </div>
  );
});
