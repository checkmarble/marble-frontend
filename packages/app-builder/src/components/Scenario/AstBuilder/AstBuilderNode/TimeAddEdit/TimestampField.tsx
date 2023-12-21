import {
  type EvaluationError,
  isDatabaseAccess,
  isPayload,
  isTimeNow,
  type LabelledAst,
  newDatabaseAccessorsLabelledAst,
  newPayloadAccessorsLabelledAst,
  NewUndefinedAstNode,
} from '@app-builder/models';
import { newTimeNowLabelledAst } from '@app-builder/models/LabelledAst/TimeNow';
import {
  adaptAstNodeFromEditorViewModel,
  adaptEditorNodeViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { matchSorter } from 'match-sorter';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, SelectWithCombobox } from 'ui-design-system';

export const TimestampField = ({
  builder,
  className,
  onChange,
  errors,
  value,
}: {
  builder: AstBuilder;
  className?: string;
  onChange: (value: EditorNodeViewModel | null) => void;
  errors: EvaluationError[];
  value: EditorNodeViewModel | null;
}) => {
  const { t } = useTranslation(['scenarios']);
  const options: LabelledAst[] = useMemo(() => {
    const databaseAccessors = builder.input.identifiers.databaseAccessors.map(
      (node) =>
        newDatabaseAccessorsLabelledAst({
          dataModel: builder.input.dataModel,
          node,
        }),
    );
    const payloadAccessors = builder.input.identifiers.payloadAccessors.map(
      (node) =>
        newPayloadAccessorsLabelledAst({
          triggerObjectTable: builder.input.triggerObjectTable,
          node,
        }),
    );
    const timestampFieldOptions = [
      ...payloadAccessors,
      ...databaseAccessors,
    ].filter((labelledAst) => labelledAst.dataType == 'Timestamp');

    return [newTimeNowLabelledAst(), ...timestampFieldOptions];
  }, [
    builder.input.dataModel,
    builder.input.identifiers.databaseAccessors,
    builder.input.identifiers.payloadAccessors,
    builder.input.triggerObjectTable,
  ]);

  const onSelect = useCallback(
    (newSelection: LabelledAst | null) => {
      const newNode = newSelection
        ? newSelection.astNode
        : NewUndefinedAstNode();
      onChange(adaptEditorNodeViewModel({ ast: newNode }));
    },
    [onChange],
  );

  const node = value && adaptAstNodeFromEditorViewModel(value);
  let initialValue: LabelledAst | null = null;
  if (node && isPayload(node)) {
    initialValue = newPayloadAccessorsLabelledAst({
      triggerObjectTable: builder.input.triggerObjectTable,
      node,
    });
  }
  if (node && isDatabaseAccess(node)) {
    initialValue = newDatabaseAccessorsLabelledAst({
      dataModel: builder.input.dataModel,
      node,
    });
  }

  if (node && isTimeNow(node)) initialValue = newTimeNowLabelledAst();

  return (
    <TimestampFieldCombobox
      placeholder={t('scenarios:edit_date.select_a_field')}
      className={className}
      value={initialValue}
      onChange={onSelect}
      errors={errors}
      options={options}
    />
  );
};

const TimestampFieldCombobox = ({
  placeholder,
  className,
  defaultOpen,
  onChange,
  options,
  errors,
  value,
}: {
  placeholder: string;
  className?: string;
  defaultOpen?: boolean;
  onChange: (value: LabelledAst | null) => void;
  options: LabelledAst[];
  errors: EvaluationError[];
  value: LabelledAst | null;
}) => {
  const { optionLabels, getOption } = useMemo(() => {
    const map = new Map(
      options.map((option) => [getOptionLabel(option), option]),
    );
    return {
      optionLabels: Array.from(map.keys()),
      getOption: (label: string) => map.get(label) ?? null,
    };
  }, [options]);
  const selectedValue = useMemo(() => getOptionLabel(value), [value]);

  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const matches = useMemo(
    () => matchSorter(optionLabels, deferredSearchValue),
    [optionLabels, deferredSearchValue],
  );

  return (
    <SelectWithCombobox.Root
      defaultOpen={defaultOpen}
      selectedValue={selectedValue}
      onSelectedValueChange={(value) => onChange(getOption(value))}
      onSearchValueChange={setSearchValue}
    >
      <SelectWithCombobox.Select
        className={className}
        borderColor={errors.length > 0 ? 'red-100' : 'grey-10'}
      >
        {selectedValue || <span className="text-grey-25">{placeholder}</span>}
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

function getOptionLabel(option: LabelledAst | null) {
  return option ? option.name : '';
}
