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
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import * as Popover from '@radix-ui/react-popover';
import { Input, ScrollArea } from '@ui-design-system';
import clsx from 'clsx';
import { forwardRef, useCallback, useState } from 'react';

import {
  adaptAggregationViewModel,
  useEditAggregation,
} from '../AggregationEdit';
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
  const [open, onOpenChange] = useState<boolean>(false);

  const closeModal = useCallback(() => {
    onOpenChange(false);
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <Popover.Root modal open={open} onOpenChange={onOpenChange}>
        <OperandViewer builder={builder} operandViewModel={operandViewModel} />
        <Popover.Portal>
          <OperandEditorContent
            builder={builder}
            onSave={onSave}
            closeModal={closeModal}
            operandViewModel={operandViewModel}
          />
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

function OperandViewer({
  builder,
  operandViewModel,
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
}) {
  const astNode = adaptAstNodeFromEditorViewModel(operandViewModel);
  const editAggregation = useEditAggregation();

  const astNodeLabelName = getAstNodeLabelName(
    adaptAstNodeFromEditorViewModel(operandViewModel),
    builder
  );

  if (isAggregation(astNode)) {
    return (
      <TriggerOperandEdit
        onClick={() => {
          editAggregation(
            adaptAggregationViewModel(operandViewModel.nodeId, astNode)
          );
        }}
      >
        {astNodeLabelName}
      </TriggerOperandEdit>
    );
  }

  return (
    <Popover.Trigger asChild>
      <TriggerOperandEdit>{astNodeLabelName}</TriggerOperandEdit>
    </Popover.Trigger>
  );
}

const TriggerOperandEdit = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'>
>(({ ...props }, ref) => (
  <button
    ref={ref}
    className={clsx(
      'flex h-10 min-w-[40px] items-center justify-between px-2 outline-none',
      'bg-grey-00 disabled:bg-grey-05 radix-state-open:bg-purple-05',
      'border-grey-10 radix-state-open:border-purple-100 disabled:border-grey-10 rounded border focus:border-purple-100'
    )}
    {...props}
  />
));
TriggerOperandEdit.displayName = 'TriggerOperandEdit';

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
        editAggregation(
          adaptAggregationViewModel(
            operandViewModel.nodeId,
            newSelection.astNode
          )
        );
      } else {
        setEditViewModel((vm) => ({
          ...vm,
          selectedOption: newSelection,
        }));
        onSave(newSelection.astNode);
      }
      closeModal();
    },
    [closeModal, editAggregation, onSave, operandViewModel.nodeId]
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
