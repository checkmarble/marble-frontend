import {
  adaptAggregationViewModel,
  AggregationEditModal,
} from '@app-builder/components/Edit';
import { stringifyConstant } from '@app-builder/components/Scenario/Formula/Operators';
import {
  adaptLabelledAstFromIdentifier,
  type AstNode,
  isAggregation,
  type LabelledAst,
  NewAstNode,
  NewUndefinedAstNode,
  undefinedAstNodeName,
} from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Combobox } from '@ui-design-system';
import { useCallback, useState } from 'react';

import { ErrorMessage } from '../ErrorMessage';
import { getBorderColor } from '../utils';

export type OperandViewModel = EditorNodeViewModel;

interface EditOperandViewModel {
  initialOption: LabelledAst;
  constantOptions: LabelledAst[];
  identifiersOptions: LabelledAst[];
  selectedOption: LabelledAst | null;
  searchText: string;
}

export function OperandEditor({
  builder,
  operandViewModel,
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
}) {
  const [editViewModel, setEditViewModel] = useState<EditOperandViewModel>(
    () => {
      const initialOption: LabelledAst = {
        label: adaptOperandLabel(
          adaptAstNodeFromEditorViewModel(operandViewModel)
        ),
        tooltip: '(initial value)',
        astNode: adaptAstNodeFromEditorViewModel(operandViewModel),
      };

      const identifiersOptions: LabelledAst[] = [
        ...builder.identifiers.databaseAccessors.map(
          adaptLabelledAstFromIdentifier
        ),
        ...builder.identifiers.payloadAccessors.map(
          adaptLabelledAstFromIdentifier
        ),
        ...builder.identifiers.customListAccessors.map(
          adaptLabelledAstFromIdentifier
        ),
        ...builder.identifiers.aggregatorAccessors.map(
          adaptLabelledAstFromIdentifier
        ),
      ];

      return {
        initialOption,
        constantOptions: [],
        identifiersOptions,
        selectedOption: initialOption,
        searchText: '',
      };
    }
  );

  const handleInputChanged = useCallback((newInputText: string) => {
    setEditViewModel((vm) => ({
      ...vm,
      searchText: newInputText,
      constantOptions: coerceToConstantsLabelledAst(newInputText),
    }));
  }, []);

  const handleSelectOption = useCallback(
    (newSelection: LabelledAst) => {
      setEditViewModel((vm) => ({
        ...vm,
        selectedOption: newSelection,
      }));
      if (isAggregation(newSelection.astNode)) {
        editAggregation(newSelection.astNode);
        return;
      }
      builder.setOperand(operandViewModel.nodeId, newSelection.astNode);
    },
    [builder, operandViewModel.nodeId]
  );

  const availableOptions = [
    ...editViewModel.constantOptions,
    ...editViewModel.identifiersOptions.filter((option) =>
      option.label
        .toLocaleUpperCase()
        .includes(editViewModel.searchText.toLocaleUpperCase())
    ),
  ];

  const isInvalid = operandViewModel.validation.state === 'fail';

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectionAggregationOption, setSelectionAggregationOption] =
    useState<AstNode>(NewUndefinedAstNode);
  const editAggregation = (node: AstNode) => {
    setSelectionAggregationOption(node);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-1">
      <Combobox.Root<LabelledAst>
        value={editViewModel.selectedOption ?? undefined}
        onChange={handleSelectOption}
      >
        <div className="relative">
          <Combobox.Input
            displayValue={(item: LabelledAst) => item.label ?? '??'}
            onChange={(event) => {
              handleInputChanged(event.target.value);
            }}
            aria-invalid={isInvalid}
            borderColor={getBorderColor(operandViewModel.validation)}
          />

          <Combobox.Options className="w-fit">
            {availableOptions.map((option, i) => (
              <OperandComboBoxOption key={i} option={option} />
            ))}
          </Combobox.Options>
        </div>
      </Combobox.Root>
      {operandViewModel.validation.state === 'fail' && (
        <ErrorMessage errors={operandViewModel.validation.errors} />
      )}
      {selectionAggregationOption.name !== undefinedAstNodeName && (
        <AggregationEditModal
          builder={builder}
          initialAggregation={adaptAggregationViewModel(
            operandViewModel.nodeId,
            selectionAggregationOption
          )}
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
        />
      )}
    </div>
  );
}

function OperandComboBoxOption({ option }: { option: LabelledAst }) {
  return (
    <Combobox.Option value={option} className="flex flex-col gap-1">
      <span>{option.label}</span>
      <span>{option.tooltip}</span>
    </Combobox.Option>
  );
}

function coerceToConstantsLabelledAst(search: string): LabelledAst[] {
  const results: LabelledAst[] = [];

  const searchLowerCase = search.trim().toLocaleLowerCase();
  if (searchLowerCase.length === 0) {
    return [];
  }

  // Note: Number('') === 0
  const parsedNumber = Number(searchLowerCase);
  if (Number.isFinite(parsedNumber)) {
    results.push({
      label: search,
      tooltip: '(number)',
      astNode: NewAstNode({
        constant: parsedNumber,
      }),
    });
  }

  if (searchLowerCase === 'true' || searchLowerCase === 'false') {
    results.push({
      label: search,
      tooltip: '(boolean)',
      astNode: NewAstNode({
        constant: search === 'true',
      }),
    });
  }

  results.push({
    label: `"${search}"`,
    tooltip: '(string)',
    astNode: NewAstNode({
      constant: search,
    }),
  });

  return results;
}

function shortAstDescription(node: AstNode): string {
  return node.name === null
    ? `constant: ${stringifyConstant(node.constant)}`
    : `func: ${node.name}`;
}

function adaptOperandLabel(node: AstNode) {
  // TODO: merge with getAstNodeDisplayName()
  return node.name === null
    ? stringifyConstant(node.constant)
    : node.name === 'Payload'
    ? `Payload ${stringifyConstant(node.children[0].constant)}`
    : shortAstDescription(node);
}
