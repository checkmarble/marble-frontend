import {
  isDatabaseAccess,
  isPayload,
  isTimeNow,
  NewUndefinedAstNode,
} from '@app-builder/models';
import {
  DatabaseAccessEditableAstNode,
  type EditableAstNode,
  PayloadAccessorsEditableAstNode,
  TimeNowEditableAstNode,
} from '@app-builder/models/editable-ast-node';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import {
  useDataModel,
  useTimestampFieldOptions,
  useTriggerObjectTable,
} from '@app-builder/services/ast-node/options';
import {
  adaptAstNodeFromEditorViewModel,
  adaptEditorNodeViewModel,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { matchSorter } from 'match-sorter';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, SelectWithCombobox } from 'ui-design-system';

export const TimestampField = ({
  className,
  onChange,
  errors,
  value,
}: {
  className?: string;
  onChange: (value: EditorNodeViewModel | null) => void;
  errors: EvaluationError[];
  value: EditorNodeViewModel | null;
}) => {
  const { t } = useTranslation(['common', 'scenarios']);
  const dataModel = useDataModel();
  const triggerObjectTable = useTriggerObjectTable();
  const options = useTimestampFieldOptions();

  const onSelect = useCallback(
    (newSelection: EditableAstNode | null) => {
      const newNode = newSelection
        ? newSelection.astNode
        : NewUndefinedAstNode();
      onChange(adaptEditorNodeViewModel({ ast: newNode }));
    },
    [onChange],
  );

  const initialValue = useMemo(() => {
    if (!value) return null;
    const astNode = adaptAstNodeFromEditorViewModel(value);
    if (isPayload(astNode)) {
      return new PayloadAccessorsEditableAstNode(astNode, triggerObjectTable);
    }
    if (isDatabaseAccess(astNode)) {
      return new DatabaseAccessEditableAstNode(astNode, dataModel);
    }
    if (isTimeNow(astNode)) return new TimeNowEditableAstNode(t);
    return null;
  }, [dataModel, triggerObjectTable, t, value]);

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

//TODO: replace with new OperandEditor component
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
  onChange: (value: EditableAstNode | null) => void;
  options: EditableAstNode[];
  errors: EvaluationError[];
  value: EditableAstNode | null;
}) => {
  const { optionLabels, getOption } = useMemo(() => {
    const map = new Map(options.map((option) => [option.displayName, option]));
    return {
      optionLabels: Array.from(map.keys()),
      getOption: (label: string) => map.get(label) ?? null,
    };
  }, [options]);

  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const matches = useMemo(
    () => matchSorter(optionLabels, deferredSearchValue),
    [optionLabels, deferredSearchValue],
  );
  const selectedValue = value?.displayName;

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
