import { useEffect, useState } from 'react';
import { Icon } from 'ui-icons';
import { ButtonV2 } from '../../Button/Button';
import { useI18n } from '../../contexts/I18nContext';
import { MenuCommand } from '../../MenuCommand/MenuCommand';
import { Tooltip } from '../../Tooltip/Tooltip';
import { type SelectFilter } from '../types';
import { useFiltersBarContext } from './FiltersBarContext';

export function SelectOptionFilter({ options, placeholder, selectedValue, name }: SelectFilter) {
  const { t } = useI18n();
  const { emitSet } = useFiltersBarContext();
  const [internalSelectedValue, setInternalSelectedValue] = useState<string>((selectedValue as string) || '');

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setInternalSelectedValue((selectedValue as string) || '');
  }, [selectedValue]);

  const hasOptions = options?.length ?? false;

  const handleSelect = (value: string) => {
    setInternalSelectedValue(value);
    emitSet(name, value);
    setOpen(false);
  };

  const getOptionLabel = (option: string | { label: string; value: string }) => {
    return typeof option === 'string' ? option : option.label;
  };

  const getOptionValue = (option: string | { label: string; value: string }) => {
    return typeof option === 'string' ? option : option.value;
  };

  const getSelectedLabel = () => {
    if (!internalSelectedValue) return placeholder || 'Select';
    const selectedOption = options?.find(
      (option: string | { label: string; value: string }) => getOptionValue(option) === internalSelectedValue,
    );
    return selectedOption ? getOptionLabel(selectedOption) : internalSelectedValue;
  };

  const maxOptionLabelLength = Math.max(...(options?.map((option) => getOptionLabel(option).length) ?? [0]));

  return (
    <div className="flex flex-col gap-2 p-2">
      <MenuCommand.Menu open={open} onOpenChange={setOpen}>
        <MenuCommand.Trigger>
          <ButtonV2
            variant="primary"
            mode="normal"
            className="justify-between w-full"
            style={{ width: `${maxOptionLabelLength}ch` }}
          >
            <span className="text-sm truncate flex items-center gap-1">
              {getSelectedLabel()}
              {(selectedValue as any)?.unavailable ? (
                <Tooltip.Default
                  content={t('filters:unavailable_filter_tooltip', {
                    defaultValue: 'May not be available for selected range',
                  })}
                >
                  <Icon icon="warning" className="text-warning-60 size-4" />
                </Tooltip.Default>
              ) : null}
            </span>
            <MenuCommand.Arrow />
          </ButtonV2>
        </MenuCommand.Trigger>
        <MenuCommand.Content sameWidth align="start">
          <MenuCommand.List>
            {hasOptions ? (
              options?.map((option: string | { label: string; value: string }) => {
                const value = getOptionValue(option);
                const label = getOptionLabel(option);
                return (
                  <MenuCommand.Item key={value} value={value} onSelect={() => handleSelect(value)}>
                    {label}
                  </MenuCommand.Item>
                );
              })
            ) : (
              <MenuCommand.Empty>{t('filters:ds.noOptionsAvailable.label')}</MenuCommand.Empty>
            )}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
}
