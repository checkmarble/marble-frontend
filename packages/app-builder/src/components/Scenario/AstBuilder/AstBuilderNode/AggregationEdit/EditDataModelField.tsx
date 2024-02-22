import { type EvaluationError } from '@app-builder/models';
import { cva } from 'class-variance-authority';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useMemo, useState } from 'react';
import { Input, SelectWithCombobox } from 'ui-design-system';

export type DataModelField = {
  tableName: string | null;
  fieldName: string | null;
};

function getDataModelFieldLabel(dataModelField: DataModelField | null) {
  return [dataModelField?.tableName, dataModelField?.fieldName]
    .filter(Boolean)
    .join('.');
}

export const EditDataModelField = ({
  placeholder,
  className,
  defaultOpen,
  value,
  onChange,
  options,
  errors,
}: {
  placeholder: string;
  className?: string;
  defaultOpen?: boolean;
  value: DataModelField | null;
  onChange: (dataModelField: DataModelField | null) => void;
  options: DataModelField[];
  errors: EvaluationError[];
}) => {
  const { optionLabels, getDataModelField } = useMemo(() => {
    const map = new Map(
      options.map((option) => [getDataModelFieldLabel(option), option]),
    );
    return {
      optionLabels: Array.from(map.keys()),
      getDataModelField: (label: string) => map.get(label) ?? null,
    };
  }, [options]);
  const selectedValue = useMemo(() => getDataModelFieldLabel(value), [value]);

  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const matches = useMemo(
    () => matchSorter(optionLabels, deferredSearchValue),
    [optionLabels, deferredSearchValue],
  );

  const isPlaceholder = !selectedValue;
  const displayValue = isPlaceholder ? placeholder : selectedValue;

  return (
    <SelectWithCombobox.Root
      defaultOpen={defaultOpen}
      selectedValue={selectedValue}
      onSelectedValueChange={(value) => onChange(getDataModelField(value))}
      onSearchValueChange={setSearchValue}
    >
      <SelectWithCombobox.Select
        className={selectDisplayText({
          type: isPlaceholder ? 'placeholder' : 'value',
          size: displayValue.length > 20 ? 'long' : 'short',
          className,
        })}
        borderColor={errors.length > 0 ? 'red-100' : 'grey-10'}
      >
        {displayValue}
      </SelectWithCombobox.Select>
      <SelectWithCombobox.Popover className="flex flex-col gap-2 p-2">
        <SelectWithCombobox.Combobox render={<Input className="shrink-0" />} />
        <SelectWithCombobox.ComboboxList>
          {matches.map((label) => (
            <SelectWithCombobox.ComboboxItem key={label} value={label}>
              {label}
            </SelectWithCombobox.ComboboxItem>
          ))}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Popover>
    </SelectWithCombobox.Root>
  );
};

const selectDisplayText = cva(undefined, {
  variants: {
    type: {
      placeholder: 'text-grey-25',
      value: 'text-grey-100',
    },
    size: {
      long: 'hyphens-auto [overflow-wrap:anywhere]',
      short: 'shrink-0',
    },
  },
});
