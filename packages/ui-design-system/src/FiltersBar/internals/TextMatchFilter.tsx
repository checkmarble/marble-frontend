import { CalloutV2 } from '@app-builder/components/Callout';
import { useState } from 'react';
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
  const [localText, setLocalText] = useState<string[]>(
    filter.selectedValue?.map((item) => item.value) ?? [],
  );
  const { emitSet, emitRemove } = useFiltersBarContext();
  const { t } = useI18n();

  const onValidate = () => {
    const value = localText.map((v) => v.trim()).filter((v) => v.length > 0);
    if (value.length === 0) {
      emitRemove(filter.name);
      setOpen(false);
      return;
    }
    const committed = value.map((v) => ({ operator: filter.operator, value: v }));
    emitSet(filter.name, committed);
    setOpen(false);
  };

  return (
    <FilterPopover.Root open={isOpen} onOpenChange={setOpen}>
      <FilterItem.Root>
        <FilterItem.Trigger id={filter.name}>
          <span className={buttonState}>{filter.name}</span>
          {filter.selectedValue ? (
            <span className="font-medium">
              {t('filters:ds.text_match_filter.selected_values', {
                values: localText.join(','),
              })}
            </span>
          ) : null}
        </FilterItem.Trigger>
        {filter.unavailable ? (
          <Tooltip.Default content={t('filters:unavailable_filter_tooltip')}>
            <Icon icon="error" className="text-red-base size-4" />
          </Tooltip.Default>
        ) : null}
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
          <CalloutV2 className="m-4">{t('filters:ds.text_match_filter.description')}</CalloutV2>
          <Input
            placeholder={filter.placeholder}
            value={localText.join(',')}
            onChange={(e) => setLocalText(e.currentTarget.value.split(','))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onValidate();
              }
            }}
          />
          <div className="flex justify-end gap-v2-xs">
            <ButtonV2 variant="secondary" onClick={() => setLocalText([])}>
              {t('filters:ds.clear_button.label')}
            </ButtonV2>
            <ButtonV2 onClick={onValidate}>{t('filters:ds.apply_button.label')}</ButtonV2>
          </div>
        </div>
      </FilterPopover.Content>
    </FilterPopover.Root>
  );
}
