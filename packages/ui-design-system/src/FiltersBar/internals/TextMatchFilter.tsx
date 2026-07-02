import { useEffect, useState } from 'react';
import { Icon } from 'ui-icons';
import { Button } from '../../Button/Button';
import { useI18n } from '../../contexts/I18nContext';
import { Input } from '../../Input/Input';
import { Popover } from '../../Popover/Popover';
import { Tooltip } from '../../Tooltip/Tooltip';
import { cn } from '../../utils';
import { type TextFilter } from '../types';
import { useFiltersBarContext } from './FiltersBarContext';
import { FilterTrigger, filterPopoverContentProps } from './FilterTrigger';

export function TextMatchFilter({ filter, buttonState }: { filter: TextFilter; buttonState: string }) {
  const [isOpen, setOpen] = useState(false);
  const [localText, setLocalText] = useState<string>(filter.selectedValue?.value?.join(',') ?? '');
  const { emitSet, emitRemove } = useFiltersBarContext();
  const { t } = useI18n();

  useEffect(() => {
    setLocalText(filter.selectedValue?.value?.join(',') ?? '');
  }, [filter.selectedValue]);

  const validate = () => {
    const value = localText
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    if (value.length === 0) {
      emitRemove(filter.name);
      setOpen(false);
      return;
    }
    const committed = { op: filter.op, value };
    emitSet(filter.name, committed);
    setOpen(false);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setOpen}>
      <FilterTrigger
        id={filter.name}
        className={buttonState}
        onClear={
          filter.selectedValue
            ? () => {
                emitRemove(filter.name);
                setOpen(false);
              }
            : undefined
        }
      >
        <span className={buttonState}>{filter.name}</span>
        {filter.selectedValue?.value && filter.selectedValue.value.length > 0 ? (
          <span className={cn('font-medium', buttonState)}>
            {t('filters:ds.text_match_filter.selected_values', {
              values: filter.selectedValue.value.join(', '),
            })}
          </span>
        ) : null}
        {filter.unavailable ? (
          <Tooltip.Default content={t('filters:unavailable_filter_tooltip')}>
            <Icon icon="error" className="text-red-base size-4" />
          </Tooltip.Default>
        ) : null}
      </FilterTrigger>
      <Popover.Content {...filterPopoverContentProps}>
        <div className="p-md flex flex-col gap-sm w-80">
          <aside className="bg-purple-background-light text-s text-purple-primary flex flex-row gap-sm rounded-lg p-md font-normal items-center">
            <Icon icon="tip" className="size-4 shrink-0" />
            {t('filters:ds.text_match_filter.description')}
          </aside>
          <Input
            placeholder={filter.placeholder}
            value={localText}
            onChange={(e) => setLocalText(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                validate();
              }
            }}
          />
          <div className="flex justify-end gap-xs">
            <Button
              variant="secondary"
              size="medium"
              onClick={() => {
                setLocalText('');
                emitRemove(filter.name);
                setOpen(false);
              }}
            >
              {t('filters:ds.clear_button.label')}
            </Button>
            <Button size="medium" onClick={validate}>
              {t('filters:ds.apply_button.label')}
            </Button>
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
