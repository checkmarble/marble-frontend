import { type EvaluationError } from '@app-builder/models/node-evaluation';
import * as Ariakit from '@ariakit/react';
import { cva } from 'class-variance-authority';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useMemo, useState } from 'react';
import * as R from 'remeda';
import {
  Input,
  MenuButton,
  MenuContent,
  MenuItem,
  MenuPopover,
  MenuRoot,
  ScrollAreaV2,
  Select,
  SelectWithCombobox,
  SubMenuButton,
  SubMenuRoot,
} from 'ui-design-system';
import { Icon } from 'ui-icons';

export type DataModelField = {
  tableName: string | null;
  fieldName: string | null;
};

function getDataModelFieldLabel(dataModelField: DataModelField | null) {
  if (!dataModelField?.fieldName || !dataModelField.tableName) {
    return { rawValue: null, value: null };
  }

  return {
    rawValue: dataModelField,
    value: [dataModelField?.tableName, dataModelField?.fieldName]
      .filter(Boolean)
      .join('.'),
  };
}

//TODO: replace with new OperandEditor component
// export const EditDataModelField = ({
//   placeholder,
//   className,
//   defaultOpen,
//   value,
//   onChange,
//   options,
//   errors,
// }: {
//   placeholder: string;
//   className?: string;
//   defaultOpen?: boolean;
//   value: DataModelField | null;
//   onChange: (dataModelField: DataModelField | null) => void;
//   options: DataModelField[];
//   errors: EvaluationError[];
// }) => {
//   const { optionLabels, getDataModelField } = useMemo(() => {
//     const map = new Map(
//       options.map((option) => [getDataModelFieldLabel(option), option]),
//     );
//     return {
//       optionLabels: Array.from(map.keys()),
//       getDataModelField: (label: string) => map.get(label) ?? null,
//     };
//   }, [options]);
//   const selectedValue = useMemo(() => getDataModelFieldLabel(value), [value]);

//   const [searchValue, setSearchValue] = useState('');
//   const deferredSearchValue = useDeferredValue(searchValue);

//   const matches = useMemo(
//     () => matchSorter(optionLabels, deferredSearchValue),
//     [optionLabels, deferredSearchValue],
//   );

//   const isPlaceholder = !selectedValue;
//   const displayValue = isPlaceholder ? placeholder : selectedValue;

//   return (
//     <SelectWithCombobox.Root
//       defaultOpen={defaultOpen}
//       selectedValue={selectedValue}
//       onSelectedValueChange={(value) => onChange(getDataModelField(value))}
//       onSearchValueChange={setSearchValue}
//     >
//       <SelectWithCombobox.Select
//         className={selectDisplayText({
//           type: isPlaceholder ? 'placeholder' : 'value',
//           size: displayValue.length > 20 ? 'long' : 'short',
//           className,
//         })}
//         borderColor={errors.length > 0 ? 'redfigma-47' : 'greyfigma-90'}
//       >
//         {displayValue}
//       </SelectWithCombobox.Select>
//       <SelectWithCombobox.Popover className="flex flex-col gap-2 p-2" portal>
//         <SelectWithCombobox.Combobox render={<Input className="shrink-0" />} />
//         <SelectWithCombobox.ComboboxList>
//           {matches.map((label) => (
//             <SelectWithCombobox.ComboboxItem key={label} value={label}>
//               {label}
//             </SelectWithCombobox.ComboboxItem>
//           ))}
//         </SelectWithCombobox.ComboboxList>
//       </SelectWithCombobox.Popover>
//     </SelectWithCombobox.Root>
//   );
// };

// const selectDisplayText = cva(undefined, {
//   variants: {
//     type: {
//       placeholder: 'text-grey-80',
//       value: 'text-grey-00',
//     },
//     size: {
//       long: 'break-all',
//       short: 'shrink-0',
//     },
//   },
// });

export type EditDataModelFieldProps = {
  disabled?: boolean;
  tableName: string;
  value: DataModelField | null;
  options: DataModelField[];
  defaultOpen?: boolean;
  onChange: (value: DataModelField) => void;
  placeholder?: string;
};

export const EditDataModelField = ({
  disabled,
  tableName,
  value,
  options,
  defaultOpen,
  onChange,
  placeholder,
}: EditDataModelFieldProps) => {
  const groups = R.groupBy(options, (option) => option.tableName ?? '');
  const optionsEntries = R.entries(groups);

  const { rawValue, value: selectedValue } = getDataModelFieldLabel(value);
  const showPlaceholder = !selectedValue;

  return (
    <MenuRoot>
      <MenuButton
        disabled={disabled}
        render={
          <div className="border-grey-90 text-s aria-disabled:bg-grey-98 flex h-10 items-center justify-between rounded border px-2" />
        }
      >
        {showPlaceholder ? (
          <div>{placeholder}</div>
        ) : (
          <div>
            <span className="font-semibold">{rawValue.fieldName}</span> in{' '}
            {rawValue.tableName}
          </div>
        )}
        <Icon icon="arrow-2-down" className="size-5" />
      </MenuButton>
      {!tableName ? (
        <MenuPopover gutter={4} className="text-s flex w-72 flex-col gap-2 p-2">
          <MenuContent>
            <ScrollAreaV2 type="auto">
              {optionsEntries.map(([tableName, fields]) => {
                return (
                  <SubMenuRoot key={tableName}>
                    <SubMenuButton className="data-[active-item]:bg-purple-98 flex min-h-10 scroll-mb-2 scroll-mt-12 flex-row items-center justify-between gap-2 rounded-sm p-2 outline-none">
                      <span>{tableName}</span>
                      <Icon icon="arrow-right" className="size-5" />
                    </SubMenuButton>
                    <EditDataModelFieldTableMenu
                      tableName={tableName}
                      fields={fields}
                      onChange={onChange}
                    />
                  </SubMenuRoot>
                );
              })}
            </ScrollAreaV2>
          </MenuContent>
        </MenuPopover>
      ) : (
        <EditDataModelFieldTableMenu
          tableName={tableName}
          fields={options}
          onChange={onChange}
        />
      )}
    </MenuRoot>
  );
};

type EditDataModelFieldTableMenuProps = {
  tableName: string;
  fields: DataModelField[];
  onChange: (field: DataModelField) => void;
};

export const EditDataModelFieldTableMenu = ({
  tableName,
  fields,
  onChange,
}: EditDataModelFieldTableMenuProps) => {
  return (
    <MenuPopover gutter={12}>
      <MenuContent className="text-s flex w-72 flex-col gap-2 p-2">
        <div className="text-grey-50 items-center px-4 py-2 text-xs">
          Field available for{' '}
          <span className="text-grey-00 font-semibold">{tableName}</span>
        </div>
        <ScrollAreaV2 type="auto">
          {fields.map((field) => {
            return (
              <MenuItem
                key={field.fieldName}
                className="data-[active-item]:bg-purple-98 grid w-full select-none gap-1 rounded-sm p-2 outline-none"
                onClick={() => onChange(field)}
              >
                {field.fieldName}
              </MenuItem>
            );
          })}
        </ScrollAreaV2>
      </MenuContent>
    </MenuPopover>
  );
};
