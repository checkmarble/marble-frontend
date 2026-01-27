import * as Popover from '@radix-ui/react-popover';
import * as RadioGroup from '@radix-ui/react-radio-group';
import clsx from 'clsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { screeningsI18n } from '../screenings-i18n';

const LIMIT_OPTIONS = [10, 20, 30, 40, 50] as const;

export const DEFAULT_LIMIT = 10;

export interface LimitPopoverProps {
  value: number | undefined;
  onApply: (value: number | undefined) => void;
}

export const LimitPopover = ({ value, onApply }: LimitPopoverProps) => {
  const { t } = useTranslation(screeningsI18n);
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState<number | undefined>(value);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTempValue(value);
    }
    setOpen(isOpen);
  };

  const handleApply = () => {
    onApply(tempValue);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setOpen(false);
  };

  const displayValue = value ?? DEFAULT_LIMIT;
  const hasCustomValue = value !== undefined && value !== DEFAULT_LIMIT;

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={clsx(
            'text-s flex w-full items-center justify-between rounded px-2 py-2',
            hasCustomValue
              ? 'bg-purple-background-light text-purple-primary'
              : 'border-grey-border text-grey-secondary bg-surface-card border',
          )}
        >
          <span className="font-medium">{t('screenings:freeform_search.limit_label')}</span>
          <div className="flex items-center gap-1">
            <span
              className={clsx(
                'rounded-full border px-1.5 text-xs font-semibold',
                hasCustomValue
                  ? 'bg-surface-card text-grey-primary border-grey-border'
                  : 'bg-grey-background-light text-grey-secondary border-transparent',
              )}
            >
              {displayValue}
            </span>
            <Icon icon="caret-down" className="size-4" />
          </div>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-surface-card border-grey-border z-50 flex w-[300px] flex-col rounded-lg border shadow-lg"
          sideOffset={4}
          align="start"
        >
          {/* Limit options */}
          <div className="flex flex-col gap-2 p-4">
            <label className="text-s text-grey-primary font-medium">
              {t('screenings:freeform_search.limit_label')}
            </label>
            <RadioGroup.Root
              value={String(tempValue ?? DEFAULT_LIMIT)}
              onValueChange={(val) => setTempValue(parseInt(val, 10))}
              className="flex flex-col gap-1"
            >
              {LIMIT_OPTIONS.map((option) => (
                <RadioGroup.Item
                  key={option}
                  value={String(option)}
                  className={clsx(
                    'text-s flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-left transition-colors',
                    'hover:bg-grey-background-light',
                    (tempValue ?? DEFAULT_LIMIT) === option && 'bg-purple-background-light',
                  )}
                >
                  <div
                    className={clsx(
                      'flex size-4 items-center justify-center rounded-full border',
                      (tempValue ?? DEFAULT_LIMIT) === option
                        ? 'border-purple-primary bg-purple-primary'
                        : 'border-grey-border bg-surface-card',
                    )}
                  >
                    {(tempValue ?? DEFAULT_LIMIT) === option && (
                      <div className="bg-surface-card size-1.5 rounded-full" />
                    )}
                  </div>
                  <span className="text-grey-primary">{option}</span>
                </RadioGroup.Item>
              ))}
            </RadioGroup.Root>
            <p className="text-grey-placeholder text-xs">{t('screenings:freeform_search.limit_description')}</p>
          </div>

          {/* Actions */}
          <div className="border-grey-border flex gap-2 border-t p-4">
            <ButtonV2
              type="button"
              variant="secondary"
              size="default"
              className="flex-1 justify-center"
              onClick={handleCancel}
            >
              {t('common:cancel')}
            </ButtonV2>
            <ButtonV2
              type="button"
              variant="primary"
              size="default"
              className="flex-1 justify-center"
              onClick={handleApply}
            >
              {t('screenings:freeform_search.apply')}
            </ButtonV2>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
