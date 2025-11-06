import { useEffect, useState } from 'react';
import { Icon } from 'ui-icons';
import { ButtonV2 } from '../../Button/Button';
import { useI18n } from '../../contexts/I18nContext';
import { Input } from '../../Input/Input';
import { Tooltip } from '../../Tooltip/Tooltip';
import { type TextFilter } from '../types';
import { FilterItem, FilterPopover } from './FilterPopover';
import { useFiltersBarContext } from './FiltersBarContext';

export function TextMatchFilter({
  filter,
  buttonState,
}: {
  filter: TextFilter;
  buttonState: string;
}) {
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
    <FilterPopover.Root open={isOpen} onOpenChange={setOpen}>
      <FilterItem.Root>
        <FilterItem.Trigger id={filter.name}>
          <span className={buttonState}>{filter.name}</span>
          {filter.selectedValue?.value && filter.selectedValue.value.length > 0 ? (
            <span className="font-medium">
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
        </FilterItem.Trigger>

        {filter.selectedValue ? (
          <FilterItem.Clear
            onClick={() => {
              emitRemove(filter.name);
              setOpen(false);
            }}
          />
        ) : null}
      </FilterItem.Root>
      <FilterPopover.Content>
        <div className="p-4 flex flex-col gap-2 w-80">
          <aside className="bg-purple-98 text-s text-purple-65 flex flex-row gap-2 rounded-lg p-4 font-normal items-center">
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
          <div className="flex justify-end gap-v2-xs">
            <ButtonV2
              variant="secondary"
              onClick={() => {
                setLocalText('');
                emitRemove(filter.name);
                setOpen(false);
              }}
            >
              {t('filters:ds.clear_button.label')}
            </ButtonV2>
            <ButtonV2 onClick={validate}>{t('filters:ds.apply_button.label')}</ButtonV2>
          </div>
        </div>
      </FilterPopover.Content>
    </FilterPopover.Root>
  );
}
