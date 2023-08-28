import {
  adaptAstNodeToViewModel,
  adaptEditorIdentifierToViewModel,
  type ConstantType,
  NewAstNode,
} from '@app-builder/models';
import { useGetOperatorName } from '@app-builder/services/editor';
import type {
  AstBuilder,
  EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Combobox, Input, Select } from '@ui-design-system';
import { useCallback, useMemo, useState } from 'react';

import { adaptRootOrWithAndViewModel, RootOrWithAnd } from './RootOrWithAnd';

interface AstBuilderNodeProps {
  builder: AstBuilder;
  astNodeViewModel: EditorNodeViewModel;
}

export function AstBuilderNode({
  astNodeViewModel,
  builder,
}: AstBuilderNodeProps) {
  const rootOrWithAndViewModel = adaptRootOrWithAndViewModel(astNodeViewModel);
  if (rootOrWithAndViewModel) {
    return (
      <RootOrWithAnd
        builder={builder}
        rootOrWithAndViewModel={rootOrWithAndViewModel}
      />
    );
  }

  const constantViewModel = adaptConstantViewModel(astNodeViewModel);
  if (constantViewModel) {
    return (
      <ConstantEditor builder={builder} constantViewModel={constantViewModel} />
    );
  }

  return (
    <div className="flex flex-row gap-1">
      <OperandEditor
        builder={builder}
        operandViewModel={astNodeViewModel.children[0]}
      />
      <OperatorEditor
        builder={builder}
        operatorEditorViewModel={astNodeViewModel}
      />
      <OperandEditor
        builder={builder}
        operandViewModel={astNodeViewModel.children[1]}
      />
    </div>
  );

  // return <Default node={ast} />;
}

interface ConstantViewModel {
  nodeId: string;
  constant: ConstantType;
}

function adaptConstantViewModel(
  astNodeViewModel: EditorNodeViewModel
): ConstantViewModel | null {
  if (astNodeViewModel.constant === undefined) {
    return null;
  }
  if (!astNodeViewModel.name) {
    throw new Error('Constant node must have no name');
  }

  return {
    nodeId: astNodeViewModel.nodeId,
    constant: astNodeViewModel.constant,
  };
}

export function ConstantEditor({
  builder,
  constantViewModel,
}: {
  builder: AstBuilder;
  constantViewModel: ConstantViewModel;
}) {
  const [constantTxt, setConstantTxt] = useState<string>(() =>
    JSON.stringify(constantViewModel.constant)
  );
  return (
    <div>
      <Input
        value={constantTxt}
        onChange={(event) => {
          const newConstantTxt = event?.target.value ?? '';
          setConstantTxt(newConstantTxt);
          try {
            const newValue = JSON.parse(newConstantTxt) as ConstantType;
            builder.setConstant(constantViewModel.nodeId, newValue);
          } catch (e) {
            if (e instanceof Error) {
              console.log(`Invalid constant: ${e.message}`);
            }
          }
        }}
      />
    </div>
  );
}

type OperandViewModel = EditorNodeViewModel;

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

export function OperandEditor({
  builder,
  operandViewModel,
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
}) {
  const { identifiers } = builder;
  const identifiersOptions = useMemo(
    () => [
      ...identifiers.databaseAccessors.map(adaptEditorIdentifierToViewModel),
      ...identifiers.payloadAccessors.map(adaptEditorIdentifierToViewModel),
      ...identifiers.customListAccessors.map(adaptEditorIdentifierToViewModel),
    ],
    [identifiers]
  );
  const getIdentifierOptions = useCallback(
    (search: string) => {
      if (!search) return identifiersOptions;
      const constantNode = coerceToConstant(search);
      return [...identifiersOptions, adaptAstNodeToViewModel(constantNode)];
    },
    [identifiersOptions]
  );
  const selectedItem = operandViewModel
    ? adaptAstNodeToViewModel(operandViewModel)
    : null;

  const [inputValue, setInputValue] = useState(selectedItem?.label ?? '');

  const items = getIdentifierOptions(inputValue);

  const filteredItems = items.filter((item) => item.label.includes(inputValue));

  return (
    <Combobox.Root<(typeof items)[0]>
      value={selectedItem}
      onChange={(value) => {
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

type OperatorEditorViewModel = EditorNodeViewModel;

export function OperatorEditor({
  builder,
  operatorEditorViewModel,
}: {
  builder: AstBuilder;
  operatorEditorViewModel: OperatorEditorViewModel;
}) {
  const getOperatorName = useGetOperatorName();

  return (
    <Select.Root
      value={operatorEditorViewModel.name ?? undefined}
      onValueChange={(selectedId) => {
        builder.setOperator(operatorEditorViewModel.nodeId, selectedId);
      }}
    >
      <Select.Trigger className="focus:border-purple-100 aria-[invalid=true]:border-red-100">
        <Select.Value placeholder="..." />
      </Select.Trigger>
      <Select.Content className="max-h-60">
        <Select.Viewport>
          {builder.operators.map((operator) => {
            return (
              <Select.Item
                className="min-w-[110px]"
                key={operator.name}
                value={operator.name}
              >
                <Select.ItemText>
                  <span className="text-s text-grey-100 font-semibold">
                    {getOperatorName(operator.name)}
                  </span>
                </Select.ItemText>
              </Select.Item>
            );
          })}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
}
