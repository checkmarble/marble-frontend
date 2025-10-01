import { useState } from 'react';
import { Button } from '../Button/Button';
import { MenuCommand } from '../MenuCommand/MenuCommand';
import { SelectFilter as SelectFilterInterface } from './FiltersBar';

export function SelectFilter(props: SelectFilterInterface) {
  const { options, onChange, placeholder, selectedValue } = props;
  const [internalSelectedValue, setInternalSelectedValue] = useState<string>(
    (selectedValue as string) || '',
  );

  const hasOptions = options?.length ?? false;

  const handleSelect = (value: string) => {
    setInternalSelectedValue(value);
    onChange?.(value);
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
              <MenuCommand.Empty>No options available</MenuCommand.Empty>
            )}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
}
