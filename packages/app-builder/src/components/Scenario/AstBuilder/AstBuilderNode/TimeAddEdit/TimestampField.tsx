import {
  isDatabaseAccess,
  isPayload,
  type LabelledAst,
  newDatabaseAccessorsLabelledAst,
  newPayloadAccessorsLabelledAst,
  NewUndefinedAstNode,
  type Validation,
} from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  adaptEditorNodeViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Combobox } from '@ui-design-system';
import { useCallback, useMemo, useState } from 'react';

import { getBorderColor } from '../../utils';

export const TimestampField = ({
  builder,
  className,
  onChange,
  validation,
  value,
}: {
  builder: AstBuilder;
  className?: string;
  onChange: (value: EditorNodeViewModel | null) => void;
  validation: Validation;
  value: EditorNodeViewModel | null;
}) => {
  const options: LabelledAst[] = useMemo(() => {
    const databaseAccessors = builder.identifiers.databaseAccessors.map(
      (node) =>
        newDatabaseAccessorsLabelledAst({
          dataModel: builder.dataModel,
          node,
        })
    );
    const payloadAccessors = builder.identifiers.payloadAccessors.map((node) =>
      newPayloadAccessorsLabelledAst({
        triggerObjectTable: builder.triggerObjectTable,
        node,
      })
    );
    const timestampFieldOptions = [
      ...payloadAccessors,
      ...databaseAccessors,
    ].filter((labelledAst) => labelledAst.dataType == 'Timestamp');

    return timestampFieldOptions;
  }, [
    builder.dataModel,
    builder.identifiers.databaseAccessors,
    builder.identifiers.payloadAccessors,
    builder.triggerObjectTable,
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
      triggerObjectTable: builder.triggerObjectTable,
      node,
    });
  }
  if (node && isDatabaseAccess(node)) {
    initialValue = newDatabaseAccessorsLabelledAst({
      dataModel: builder.dataModel,
      node,
    });
  }

  return (
    <TimestampFieldCombobox
      className={className}
      value={initialValue}
      onChange={onSelect}
      validation={validation}
      options={options}
    />
  );
};

const TimestampFieldCombobox = ({
  className,
  onChange,
  options,
  validation,
  value,
}: {
  className?: string;
  onChange: (value: LabelledAst | null) => void;
  options: LabelledAst[];
  validation: Validation;
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
          borderColor={getBorderColor(validation)}
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
