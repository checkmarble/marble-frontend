import { useEffect, useState } from 'react';
import { Button } from '../../Button/Button';
import { useI18n } from '../../contexts/I18nContext';
import { MenuCommand } from '../../MenuCommand/MenuCommand';
import { type SelectFilter } from '../types';
import { useFiltersBarContext } from './FiltersBarContext';

export function SelectOptionFilter(props: SelectFilter) {
  const { t } = useI18n();
  const { options, placeholder, selectedValue, name } = props;
  const { emitSet } = useFiltersBarContext();
  const [internalSelectedValue, setInternalSelectedValue] = useState<string>(
    (selectedValue as string) || '',
  );

  useEffect(() => {
    setInternalSelectedValue((selectedValue as string) || '');
  }, [selectedValue]);

  const hasOptions = options?.length ?? false;

  const handleSelect = (value: string) => {
    setInternalSelectedValue(value);
    emitSet(name, value);
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
      (option: string | { label: string; value: string }) =>
        getOptionValue(option) === internalSelectedValue,
    );
    return selectedOption ? getOptionLabel(selectedOption) : internalSelectedValue;
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      <MenuCommand.Menu>
        <MenuCommand.Trigger>
          <Button variant="secondary" size="medium" className="justify-between w-full">
            <span className="text-xs truncate">{getSelectedLabel()}</span>
            <MenuCommand.Arrow />
          </Button>
        </MenuCommand.Trigger>
        <MenuCommand.Content sameWidth>
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
