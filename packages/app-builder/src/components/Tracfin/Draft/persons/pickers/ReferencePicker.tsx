import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type ReferenceOption = {
  value: string;
  /** What is searched and shown as the current choice. */
  label: string;
  /** Shown before the label in the list (a type badge). */
  badge?: ReactNode;
  hint?: string;
};

type ReferencePickerProps = {
  value: string | undefined;
  options: readonly ReferenceOption[];
  onChange: (value: string) => void;
  onClear?: () => void;
  ariaLabel: string;
  clearLabel: string;
  placeholder: string;
  /** Shown instead of the list when there is nothing to choose from. */
  emptyHint: ReactNode;
  /** The current value points to something that is not among the options (a removed block): shown as it is. */
  unknownLabel?: string;
  disabled?: boolean;
};

/** A single choice among the objects of the draft, with a search and a badge per option. */
export function ReferencePicker({
  value,
  options,
  onChange,
  onClear,
  ariaLabel,
  clearLabel,
  placeholder,
  emptyHint,
  unknownLabel,
  disabled = false,
}: ReferencePickerProps) {
  const { t } = useTranslation(['tracfin']);
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const shown = selected?.label ?? (value ? unknownLabel : undefined);

  return (
    <div className="flex min-w-0 flex-col gap-2xs">
      <div className="flex items-center gap-xs">
        <div className="min-w-0 flex-1">
          <MenuCommand.Menu open={open} onOpenChange={setOpen}>
            <MenuCommand.Trigger>
              <MenuCommand.SelectButton
                size="medium"
                aria-label={ariaLabel}
                disabled={disabled || options.length === 0}
                className={cn(value && !selected && 'border-red-primary')}
              >
                <span className="flex min-w-0 items-center gap-xs">
                  {selected?.badge}
                  <span className={cn('truncate text-start', !shown && 'text-grey-placeholder')}>
                    {shown || placeholder}
                  </span>
                </span>
              </MenuCommand.SelectButton>
            </MenuCommand.Trigger>
            <MenuCommand.Content sameWidth align="start" className="mt-xs">
              <MenuCommand.Combobox placeholder={t('tracfin:draft.persons.picker.search')} />
              <MenuCommand.List>
                <MenuCommand.Empty className="text-s text-grey-secondary p-sm text-center">
                  {t('tracfin:draft.persons.picker.no_match')}
                </MenuCommand.Empty>
                {options.map((option) => (
                  <MenuCommand.Item
                    key={option.value}
                    value={option.value}
                    keywords={[option.label, option.hint ?? '']}
                    className="h-auto min-h-10"
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <span className="flex min-w-0 items-center gap-xs">
                      {option.badge}
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">{option.label}</span>
                        {option.hint ? (
                          <span className="text-grey-secondary truncate text-xs">{option.hint}</span>
                        ) : null}
                      </span>
                    </span>
                    {option.value === value ? (
                      <Icon icon="tick" className="text-purple-primary size-5 shrink-0" />
                    ) : null}
                  </MenuCommand.Item>
                ))}
              </MenuCommand.List>
            </MenuCommand.Content>
          </MenuCommand.Menu>
        </div>
        {value && onClear ? (
          <Button
            variant="secondary"
            appearance="link"
            mode="icon"
            aria-label={clearLabel}
            disabled={disabled}
            onClick={onClear}
          >
            <Icon icon="cross" className="size-4" />
          </Button>
        ) : null}
      </div>
      {options.length === 0 ? <p className="text-grey-secondary text-xs">{emptyHint}</p> : null}
    </div>
  );
}
