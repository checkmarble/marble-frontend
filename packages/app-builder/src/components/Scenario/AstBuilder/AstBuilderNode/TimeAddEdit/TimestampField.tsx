import {
  type EvaluationError,
  isDatabaseAccess,
  isPayload,
  type LabelledAst,
  newDatabaseAccessorsLabelledAst,
  newPayloadAccessorsLabelledAst,
  NewUndefinedAstNode,
} from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  adaptEditorNodeViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Combobox } from '@ui-design-system';
import { useCallback, useMemo, useState } from 'react';

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
  const options: LabelledAst[] = useMemo(() => {
    const databaseAccessors = builder.input.identifiers.databaseAccessors.map(
      (node) =>
        newDatabaseAccessorsLabelledAst({
          dataModel: builder.input.dataModel,
          node,
        })
    );
    const payloadAccessors = builder.input.identifiers.payloadAccessors.map(
      (node) =>
        newPayloadAccessorsLabelledAst({
          triggerObjectTable: builder.input.triggerObjectTable,
          node,
        })
    );
    const timestampFieldOptions = [
      ...payloadAccessors,
      ...databaseAccessors,
    ].filter((labelledAst) => labelledAst.dataType == 'Timestamp');

    return timestampFieldOptions;
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
    [onChange]
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

  return (
    <TimestampFieldCombobox
      className={className}
      value={initialValue}
      onChange={onSelect}
      errors={errors}
      options={options}
    />
  );
};

const TimestampFieldCombobox = ({
  className,
  onChange,
  options,
  errors,
  value,
}: {
  className?: string;
  onChange: (value: LabelledAst | null) => void;
  options: LabelledAst[];
  errors: EvaluationError[];
  value: LabelledAst | null;
}) => {
  const selectedOption =
    options.find((option) => option.name == value?.name) ?? null;
  const [inputValue, setInputValue] = useState(() =>
    optionToLabel(selectedOption)
  );

  const filteredOptions = options.filter((option) =>
    optionToLabel(option).toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Combobox.Root<(typeof options)[0]>
      value={value}
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
          borderColor={errors.length > 0 ? 'red-100' : 'grey-10'}
        />
        <Combobox.Options className="w-fit">
          {filteredOptions.map((option, index) => (
            <Combobox.Option key={index} value={option}>
              {optionToLabel(option)}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox.Root>
  );
};

const optionToLabel = (option: LabelledAst | null): string =>
  option ? option.name : '';
