import {
  adaptLabelledAst,
  adaptLabelledAstFromCustomList,
  type AstNode,
  getAggregatorName,
  getAstNodeLabelName,
  isAggregation,
  type LabelledAst,
  NewAggregatorAstNode,
  NewUndefinedAstNode,
  undefinedAstNodeName,
} from '@app-builder/models';
import { allAggregators } from '@app-builder/services/editor';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Combobox } from '@ui-design-system';
import { useCallback, useState } from 'react';

import {
  adaptAggregationViewModel,
  AggregationEditModal,
} from '../AggregationEdit';
import { ErrorMessage } from '../ErrorMessage';
import { getBorderColor } from '../utils';
import { coerceToConstantsLabelledAst } from './CoerceToConstantsLabelledAst';

export type OperandViewModel = EditorNodeViewModel;

interface EditOperandViewModel {
  initialOption: LabelledAst;
  constantOptions: LabelledAst[];
  identifiersOptions: LabelledAst[];
  selectedOption: LabelledAst;
  searchText: string;
}

export function OperandEditor({
  builder,
  onSave,
  operandViewModel,
}: {
  builder: AstBuilder;
  onSave: (astNode: AstNode) => void;
  operandViewModel: OperandViewModel;
}) {
  const [editViewModel, setEditViewModel] = useState<EditOperandViewModel>(
    () => {
      const operandAst = adaptAstNodeFromEditorViewModel(operandViewModel);
      const initialOption: LabelledAst = {
        label: getAstNodeLabelName(operandAst, builder),
        tooltip: '(initial value)',
        astNode: operandAst,
      };

      const identifiersOptions: LabelledAst[] = [
        ...builder.identifiers.databaseAccessors.map((node) => ({
          label: getAstNodeLabelName(node, builder),
          // tooltip: '(database accessor)',
          tooltip: '',
          astNode: node,
        })),
        ...builder.identifiers.payloadAccessors.map((node) => ({
          label: getAstNodeLabelName(node, builder),
          // tooltip: '(payload accessor)',
          tooltip: '',
          astNode: node,
        })),
        ...allAggregators.map((aggregator) => ({
          label: getAggregatorName(aggregator),
          tooltip: '',
          astNode: NewAggregatorAstNode(aggregator),
        })),
        ...builder.customLists.map(adaptLabelledAstFromCustomList),
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
      if (isAggregation(newSelection.astNode)) {
        editAggregation(newSelection.astNode);
      } else {
        setEditViewModel((vm) => ({
          ...vm,
          selectedOption: newSelection,
        }));
        onSave(newSelection.astNode);
      }
    },
    [onSave]
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
          onSave={(astNode: AstNode) => {
            setEditViewModel((vm) => ({
              ...vm,
              selectedOption: adaptLabelledAst(astNode, builder),
            }));
            onSave(astNode);
          }}
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
