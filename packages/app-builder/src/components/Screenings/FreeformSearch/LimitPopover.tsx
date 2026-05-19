import * as Popover from '@radix-ui/react-popover';
import { useStore } from '@tanstack/react-form';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag, ThresholdRange } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { screeningsI18n } from '../screenings-i18n';
import { useFormManuallSearch } from './FreeformSearchForm';

const LIMIT_OPTIONS = [10, 20, 30, 40, 50] as const;

export const DEFAULT_LIMIT = 10;

export interface LimitPopoverProps {
  disabled: boolean;
  originalValue: number;
  onApply: (value: number) => void;
}

export const LimitPopover = ({ disabled, originalValue, onApply }: LimitPopoverProps) => {
  const { t } = useTranslation(screeningsI18n);
  const [open, setOpen] = useState(false);
  const form = useFormManuallSearch();
  const value = useStore(form.store, (state) => state.values.limit);
  const tagRef = useRef<HTMLDivElement>(null);

  const hasCustomValue = value !== undefined && value !== DEFAULT_LIMIT;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        {hasCustomValue ? (
          <Tag
            color={disabled ? 'grey' : 'purple'}
            className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            ref={tagRef}
          >
            <span className="font-medium">{t('screenings:freeform_search.limit_label', { limit: value })}</span>
          </Tag>
        ) : (
          <span className="flex items-center gap-1 text-grey-placeholder cursor-pointer">
            <Icon icon="plus" className="size-4  " />
            <span>{t('screenings:freeform_search.advanced_filters')}</span>
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-surface-card border-grey-border z-50 flex w-[300px] flex-col rounded-lg border shadow-lg"
          sideOffset={4}
          align="start"
        >
          {/* Limit options */}
          <div className="flex flex-col gap-2 p-4">
            <ThresholdRange
              defaultDescription={t('screenings:freeform_search.limit_description')}
              value={value}
              onChange={(value) => form.setFieldValue('limit', value)}
              values={LIMIT_OPTIONS.map((option) => ({
                value: option,
                label: option.toString(),
                color: 'var(--color-purple-primary)',
              }))}
              initialColor="var(--color-purple-primary)"
              max={LIMIT_OPTIONS.at(-1)}
            />
          </div>
          {/* Actions */}
          <div className="border-grey-border flex gap-2 border-t p-4">
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  className="flex-1 justify-center"
                  onClick={() => {
                    form.setFieldValue('limit', originalValue);
                    setOpen(false);
                  }}
                >
                  {t('common:cancel')}
                </Button>
              )}
            </form.Subscribe>
            <Button
              type="button"
              variant="primary"
              size="default"
              className="flex-1 justify-center"
              onClick={() => {
                onApply(value ?? DEFAULT_LIMIT);
                setOpen(false);
              }}
            >
              {t('screenings:freeform_search.apply')}
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
