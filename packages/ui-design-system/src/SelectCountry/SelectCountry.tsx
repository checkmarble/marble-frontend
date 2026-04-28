import * as allCountryFlags from 'country-flag-emojis/flags';
import type { CountryFlag } from 'country-flag-emojis/types';
import { type ComponentProps, forwardRef, useMemo, useState } from 'react';
import { Icon } from 'ui-icons';

import { InternalMenuSharpFactory, MenuCommand } from '../MenuCommand/MenuCommand';
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
  searchPlaceholder?: string;
  rootClassName?: string;
  placeholder?: string;
  border?: SelectTriggerProps['border'];
  borderColor?: SelectTriggerProps['borderColor'];
} & Pick<ComponentProps<typeof MenuCommand.SelectButton>, 'className' | 'disabled' | 'name' | 'onBlur' | 'id'> &
  Omit<ComponentProps<typeof MenuCommand.Menu>, MenuOmitted> & { menuContentClassName?: string };

function buildCountryList(): { countries: readonly CountryFlag[]; byIso3: ReadonlyMap<string, CountryFlag> } {
  const list = Object.values(allCountryFlags as Record<string, CountryFlag>).sort((a, b) =>
    a.nameEnglish.localeCompare(b.nameEnglish),
  );
  const byIso3 = new Map<string, CountryFlag>();
  for (const c of list) {
    byIso3.set(c.isoAlpha3, c);
  }
  return { countries: list, byIso3 };
}

function itemFilterValue(c: CountryFlag) {
  return `${c.nameEnglish} ${c.isoAlpha2} ${c.isoAlpha3}`;
}

function FreeTextItem({ onSelect }: { onSelect: (name: string) => void }) {
  const menuState = MenuCommand.State.useSharp();
  const internalSharp = InternalMenuSharpFactory.useSharp();
  const search = menuState.value.search.trim();

  return (
    <button
      type="button"
      className="text-s text-grey-primary hover:bg-purple-background-light flex h-10 w-full cursor-pointer items-center gap-2 rounded-xs px-2 font-medium"
      onClick={() => {
        onSelect(search);
        internalSharp.value.onSelect();
      }}
    >
      <span className="truncate italic">&ldquo;{search}&rdquo;</span>
    </button>
  );
}

/**
 * Searchable country selector with flag emoji + English name. When no country matches the search
 * query, an option to use the typed text as a free-form country name is offered in place of the
 * empty state. The selected free-form name is displayed in the trigger without a flag.
 */
export const SelectCountry = forwardRef<HTMLButtonElement, SelectCountryProps>(function SelectCountry(
  {
    value,
    onValueChange,
    searchPlaceholder = 'Search country…',
    rootClassName,
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
  const { countries, byIso3 } = useMemo(buildCountryList, []);
  const [internalOpen, setInternalOpen] = useState(false);

  const open = openProp ?? internalOpen;
  const handleOpenChange = (next: boolean) => {
    setInternalOpen(next);
    onOpenChangeProp?.(next);
  };

  const listIso3 = value && !value.isManual ? value.isoAlpha3 : undefined;
  const selectedFromList = listIso3 ? byIso3.get(listIso3) : undefined;
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

  const handleListChange = (c: CountryFlag) => {
    if (!c) return;
    onValueChange({
      isoAlpha2: c.isoAlpha2,
      isoAlpha3: c.isoAlpha3,
      name: c.nameEnglish,
      isManual: false,
    });
  };

  const handleManualSelect = (name: string) => {
    if (!name) {
      onValueChange(null);
    } else {
      onValueChange({ isoAlpha2: '', isoAlpha3: '', name, isManual: true });
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', rootClassName)}>
      <MenuCommand.Menu open={open} onOpenChange={handleOpenChange} defaultOpen={defaultOpen} {...restMenuRootProps}>
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
          <MenuCommand.Combobox placeholder={searchPlaceholder} filterMode="exact" />
          <MenuCommand.List className="max-h-60 min-h-0">
            {countries.map((c) => (
              <MenuCommand.Item
                key={c.isoAlpha3}
                value={itemFilterValue(c)}
                className="cursor-pointer"
                selected={c.isoAlpha3 === listIso3}
                onSelect={() => handleListChange(c)}
              >
                <span className="text-s text-grey-primary flex w-full min-w-0 items-center justify-between gap-2 font-medium">
                  <span className="flex min-w-0 items-center gap-2">
                    <span aria-hidden className="shrink-0">
                      {c.flag}
                    </span>
                    <span className="truncate">{c.nameEnglish}</span>
                  </span>
                  {c.isoAlpha3 === listIso3 ? (
                    <Icon icon="tick" className="size-5 shrink-0 text-purple-primary" />
                  ) : null}
                </span>
              </MenuCommand.Item>
            ))}
            <MenuCommand.Empty>
              <FreeTextItem onSelect={handleManualSelect} />
            </MenuCommand.Empty>
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
});
