import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { screeningsI18n } from '../screenings-i18n';

export interface ThresholdPopoverProps {
  value: number | undefined;
  onApply: (value: number | undefined) => void;
}

export function ThresholdPopover({ value, onApply }: ThresholdPopoverProps) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === '') {
      setTempValue(undefined);
      return;
    }
    const numValue = parseInt(newValue, 10);
    if (isNaN(numValue)) {
      setTempValue(undefined);
      return;
    }
    if (numValue < 0) {
      setTempValue(0);
      return;
    }
    if (numValue > 100) {
      setTempValue(100);
      return;
    }
    setTempValue(numValue);
  };

  const hasValue = value !== undefined;

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="text-s bg-purple-background-light text-purple-primary flex w-full items-center justify-between rounded px-2 py-2"
        >
          <span className="font-medium">{t('screenings:freeform_search.threshold_label')}</span>
          <div className="flex items-center gap-1">
            {hasValue && (
              <span className="bg-surface-card text-grey-primary border-grey-border rounded-full border px-1.5 text-xs font-semibold">
                {value}%
              </span>
            )}
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
          {/* Threshold input */}
          <div className="flex flex-col gap-2 p-4">
            <label className="text-s text-grey-primary font-medium">
              {t('screenings:freeform_search.threshold_label')}
            </label>
            <Input
              type="number"
              value={tempValue ?? ''}
              onChange={handleChange}
              min={0}
              max={100}
              placeholder="0-100"
            />
            <p className="text-grey-placeholder text-xs">{t('screenings:freeform_search.threshold_description')}</p>
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
}
