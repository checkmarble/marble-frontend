import {
  adaptLabelledAst,
  adaptLabelledAstFromIdentifier,
  type LabelledAst,
  NewAstNode,
} from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Combobox } from '@ui-design-system';
import { useCallback, useMemo, useState } from 'react';

export type OperandViewModel = EditorNodeViewModel;

export function OperandEditor({
  builder,
  operandViewModel,
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
}) {
  const identifiersOptions: LabelledAst[] = useMemo(
    () => [
      ...builder.identifiers.databaseAccessors.map(
        adaptLabelledAstFromIdentifier
      ),
      ...builder.identifiers.payloadAccessors.map(
        adaptLabelledAstFromIdentifier
      ),
      ...builder.identifiers.customListAccessors.map(
        adaptLabelledAstFromIdentifier
      ),
    ],
    [builder.identifiers]
  );
  const getIdentifierOptions = useCallback(
    (search: string) => {
      if (!search) return identifiersOptions;
      const constantNode = coerceToConstant(search);
      return [...identifiersOptions, adaptLabelledAst(constantNode)];
    },
    [identifiersOptions]
  );

  const [inputValue, setInputValue] = useState(
    adaptLabelledAst(adaptAstNodeFromEditorViewModel(operandViewModel)).label
  );

  const items = getIdentifierOptions(inputValue);

  const filteredItems = items.filter((item) => item.label.includes(inputValue));

  const [selectedItem, setSelectedItem] = useState<LabelledAst | null>(null);

  return (
    <Combobox.Root<(typeof items)[0]>
      value={selectedItem}
      onChange={(value) => {
        setSelectedItem(value);
        if (value) {
          builder.setOperand(operandViewModel.nodeId, value.astNode);
        }
      }}
      nullable
    >
      <div className="relative">
        <Combobox.Input
          displayValue={(item?: (typeof items)[number]) => item?.label ?? ''}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <Combobox.Options className="w-fit">
          {filteredItems.map((item) => (
            <Combobox.Option
              key={item.label}
              value={item}
              className="flex flex-col gap-1"
            >
              <span>{item.label}</span>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox.Root>
  );
}

function coerceToConstant(search: string) {
  const parsedNumber = Number(search);
  const isNumber = !isNaN(parsedNumber);

  if (isNumber) {
    return NewAstNode({
      constant: parsedNumber,
    });
  }

  return NewAstNode({
    constant: search,
  });
}
