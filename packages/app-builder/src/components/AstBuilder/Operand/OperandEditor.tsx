import {
  adaptLabelledAstFromCustomList,
  type AstNode,
  getAggregatorName,
  getAstNodeLabelName,
  isAggregation,
  type LabelledAst,
  NewAggregatorAstNode,
} from '@app-builder/models';
import { allAggregators } from '@app-builder/services/editor';
import {
  adaptAstNodeFromEditorViewModel,
  adaptEditorNodeViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import * as Popover from '@radix-ui/react-popover';
import { Input, ScrollArea } from '@ui-design-system';
import clsx from 'clsx';
import { forwardRef, useCallback, useState } from 'react';

import {
  adaptAggregationViewModel,
  type AggregationEditorNodeViewModel,
  useEditAggregation,
} from '../AggregationEdit';
import { ErrorMessage } from '../ErrorMessage';
import { coerceToConstantsLabelledAst } from './coerceToConstantsLabelledAst';
import { OperandViewer } from './OperandViewer';

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
  operandViewModel,
  onSave,
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
  onSave: (astNode: AstNode) => void;
}) {
  const [open, onOpenChange] = useState<boolean>(false);

  const astNodeLabelName = getAstNodeLabelName(
    adaptAstNodeFromEditorViewModel(operandViewModel),
    builder
  );

  return (
    <div className="flex flex-col gap-1">
      <Popover.Root modal open={open} onOpenChange={onOpenChange}>
        <Popover.Trigger asChild>
          <OperandViewer>{astNodeLabelName}</OperandViewer>
        </Popover.Trigger>
        <Popover.Portal>
          <OperandEditorContent
            builder={builder}
            onSave={onSave}
            closeModal={() => {
              onOpenChange(false);
            }}
            operandViewModel={operandViewModel}
          />
        </Popover.Portal>
      </Popover.Root>
      {operandViewModel.validation.state === 'fail' && (
        <ErrorMessage errors={operandViewModel.validation.errors} />
      )}
    </div>
  );
}

const OperandEditorContent = forwardRef<
  HTMLDivElement,
  {
    builder: AstBuilder;
    onSave: (astNode: AstNode) => void;
    closeModal: () => void;
    operandViewModel: OperandViewModel;
  }
>(({ builder, onSave, closeModal, operandViewModel }, ref) => {
  const [editViewModel, setEditViewModel] = useState<EditOperandViewModel>(
    () => {
      const operandAst = adaptAstNodeFromEditorViewModel(operandViewModel);
      const initialOption: LabelledAst = {
        label: getAstNodeLabelName(operandAst, builder),
        tooltip: '',
        astNode: operandAst,
      };

      const identifiersOptions: LabelledAst[] = [
        ...builder.identifiers.databaseAccessors.map((node) => ({
          label: getAstNodeLabelName(node, builder),
          tooltip: '',
          astNode: node,
        })),
        ...builder.identifiers.payloadAccessors.map((node) => ({
          label: getAstNodeLabelName(node, builder),
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

  const editAggregation = useEditAggregation();

  const handleSelectOption = useCallback(
    (newSelection: LabelledAst) => {
      if (isAggregation(newSelection.astNode)) {
        editAggregation({
          initialAggregation: adaptAggregationViewModel({
            ...adaptEditorNodeViewModel({ ast: newSelection.astNode }),
            nodeId: operandViewModel.nodeId,
          } as AggregationEditorNodeViewModel),
          onSave,
        });
      } else {
        onSave(newSelection.astNode);
      }
    },
    [editAggregation, onSave, operandViewModel.nodeId]
  );

  const availableOptions = [
    ...editViewModel.constantOptions,
    ...editViewModel.identifiersOptions.filter((option) =>
      option.label
        .toLocaleUpperCase()
        .includes(editViewModel.searchText.toLocaleUpperCase())
    ),
  ];

  return (
    <ScrollArea.Root>
      <Popover.Content
        ref={ref}
        side="bottom"
        align="start"
        className="animate-slideUpAndFade bg-grey-00 border-grey-10 mt-1 flex max-h-[300px] flex-col gap-2 rounded border p-2 shadow-md will-change-[transform,opacity]"
      >
        <Input
          className="flex-shrink-0"
          value={editViewModel.searchText}
          onChange={(event) => {
            handleInputChanged(event.target.value);
          }}
        />
        <ScrollArea.Viewport className="h-full" tabIndex={-1}>
          {availableOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => {
                handleSelectOption(option);
                closeModal();
              }}
              className={clsx(
                'hover:bg-purple-05 text-s cursor-default select-none rounded-sm p-2 outline-none',
                'ui-disabled:pointer-events-none ui-disabled:opacity-50',
                'flex w-full flex-col gap-1'
              )}
            >
              <span>{option.label}</span>
              <span>{option.tooltip}</span>
            </button>
          ))}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </Popover.Content>
    </ScrollArea.Root>
  );
});
OperandEditorContent.displayName = 'OperandEditorContent';
