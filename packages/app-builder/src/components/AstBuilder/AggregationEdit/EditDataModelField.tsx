import { Combobox } from '@ui-design-system';
import { useState } from 'react';

export type DataModelField = {
  tableName: string;
  fieldName: string;
};

export const EditDataModelField = ({
  className,
  value,
  onChange,
  options,
}: {
  className?: string;
  value: DataModelField | null;
  onChange: (dataModelField: DataModelField | null) => void;
  options: DataModelField[];
}) => {
  const selectedOption: DataModelField | null =
    options.find(
      (option) =>
        option.tableName == value?.tableName &&
        option.fieldName == value?.fieldName
    ) ?? null;

  const [inputValue, setInputValue] = useState(optionToLabel(selectedOption));

  const filteredOptions = options.filter((option) =>
    optionToLabel(option).toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Combobox.Root<(typeof options)[0]>
      value={selectedOption}
      onChange={(value) => {
        onChange(value);
        setInputValue(optionToLabel(value));
      }}
      nullable
    >
      <div className={className}>
        <Combobox.Input
          displayValue={(selectedOption: (typeof options)[number]) =>
            optionToLabel(selectedOption)
          }
          onChange={(event) => setInputValue(event.target.value)}
        />
        <Combobox.Options className="w-fit">
          {filteredOptions.map((option) => (
            <Combobox.Option key={optionToLabel(option)} value={option}>
              {optionToLabel(option)}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox.Root>
  );
};

const optionToLabel = (option: DataModelField | null) =>
  option ? `${option.tableName}.${option.fieldName}` : '';
