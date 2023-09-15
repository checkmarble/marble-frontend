import {
  type AstNode,
  type DataModelField,
  getAstNodeLabelName,
  isAggregation,
  isValidationFailure,
  type LabelledAst,
} from '@app-builder/models';
import {
  allAggregators,
  newAggregatorLabelledAst,
  newCustomListLabelledAst,
  newDatabaseAccessorsLabelledAst,
  newPayloadAccessorsLabelledAst,
} from '@app-builder/services/editor';
import {
  adaptAstNodeFromEditorViewModel,
  adaptEditorNodeViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { coerceToConstantsLabelledAst } from '@app-builder/services/editor/CoerceToConstantsLabelledAst';
import * as Popover from '@radix-ui/react-popover';
import { Input, ScrollArea } from '@ui-design-system';
import clsx from 'clsx';
import { forwardRef, useCallback, useState } from 'react';

import {
  adaptAggregationViewModel,
  type AggregationEditorNodeViewModel,
  isAggregationEditorNodeViewModel,
  useEditAggregation,
} from '../AggregationEdit';
import { ErrorMessage } from '../ErrorMessage';

export type OperandViewModel = EditorNodeViewModel;

interface EditOperandViewModel {
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
  const editAggregation = useEditAggregation();

  const astNodeLabelName = getAstNodeLabelName(
    adaptAstNodeFromEditorViewModel(operandViewModel),
    builder
  );

  if (isAggregationEditorNodeViewModel(operandViewModel)) {
    const aggregation = adaptAggregationViewModel(operandViewModel);
    return (
      <>
        <TriggerOperandEdit onClick={() => editAggregation(aggregation)}>
          {astNodeLabelName}
        </TriggerOperandEdit>
        {isValidationFailure(aggregation.validation.aggregation) && (
          <ErrorMessage errors={aggregation.validation.aggregation.errors} />
        )}
      </>
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
      const selectedOption: LabelledAst = {
        label: getAstNodeLabelName(operandAst, builder),
        tooltip: '',
        astNode: operandAst,
        dataModelField: null,
      };

      const identifiersOptions: LabelledAst[] = [
        ...builder.identifiers.databaseAccessors.map((node) =>
          newDatabaseAccessorsLabelledAst({
            dataModel: builder.dataModels,
            node,
          })
        ),
        ...builder.identifiers.payloadAccessors.map((node) =>
          newPayloadAccessorsLabelledAst({
            triggerObjectType: builder.triggerObjectType,
            node,
          })
        ),
        ...allAggregators.map((aggregator) =>
          newAggregatorLabelledAst(aggregator)
        ),
        ...builder.customLists.map(newCustomListLabelledAst),
      ];

      return {
        constantOptions: [],
        identifiersOptions,
        selectedOption,
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
          adaptAggregationViewModel({
            ...adaptEditorNodeViewModel({ ast: newSelection.astNode }),
            nodeId: operandViewModel.nodeId,
          } as AggregationEditorNodeViewModel)
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
              {option.tooltip ?? <span>{option.tooltip}</span>}

              {option.dataModelField && (
                <DescribeDataType field={option.dataModelField} />
              )}
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

function DescribeDataType({ field }: { field: DataModelField }) {
  return (
    <>
      <span>
        ({field.dataType}
        {field.nullable ? ', optional' : ''})
      </span>
      {field.description && <span>{field.description}</span>}
    </>
  );
}
