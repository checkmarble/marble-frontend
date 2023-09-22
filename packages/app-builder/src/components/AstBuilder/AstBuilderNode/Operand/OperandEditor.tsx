import {
  type AstNode,
  type DataModelField,
  getAstNodeLabelName,
  isAggregation,
  type LabelledAst,
} from '@app-builder/models';
import {
  allAggregators,
  coerceToConstantsLabelledAst,
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
import * as Popover from '@radix-ui/react-popover';
import { Input, ScrollArea } from '@ui-design-system';
import clsx from 'clsx';
import { forwardRef, useCallback, useState } from 'react';

import { ErrorMessage } from '../../ErrorMessage';
import { getBorderColor } from '../../utils';
import {
  adaptAggregationViewModel,
  type AggregationEditorNodeViewModel,
  useEditAggregation,
} from '../AggregationEdit';
import { Default } from '../Default';
import { OperandViewer } from './OperandViewer';

export type OperandViewModel = EditorNodeViewModel;

interface EditOperandViewModel {
  constantOptions: LabelledAst[];
  identifiersOptions: LabelledAst[];
  selectedOption: LabelledAst;
  searchText: string;
}

export function OperandEditor({
  builder,
  operandViewModel,
  onSave,
  viewOnly,
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
  onSave: (astNode: AstNode) => void;
  viewOnly?: boolean;
}) {
  const [open, onOpenChange] = useState<boolean>(false);

  // TODO: better handling of the viewOnly fallback when we get a specific UI per component (not a stringified version)
  const astNode = adaptAstNodeFromEditorViewModel(operandViewModel);
  const labelName = getAstNodeLabelName(astNode, builder, {
    getDefaultDisplayName: () => undefined,
  });
  if (labelName === undefined) {
    return <Default editorNodeViewModel={operandViewModel} builder={builder} />;
  }

  return (
    <div className="flex flex-col gap-1">
      <Popover.Root modal open={open} onOpenChange={onOpenChange}>
        <Popover.Trigger asChild disabled={viewOnly}>
          <OperandViewer
            borderColor={getBorderColor(operandViewModel.validation)}
          >
            {labelName}
          </OperandViewer>
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
      const selectedOption: LabelledAst = {
        label: getAstNodeLabelName(operandAst, builder),
        tooltip: '',
        astNode: operandAst,
        dataModelField: null,
      };

      const identifiersOptions: LabelledAst[] = [
        ...builder.identifiers.databaseAccessors.map((node) =>
          newDatabaseAccessorsLabelledAst({
            dataModel: builder.dataModel,
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
        const initialAggregation = adaptAggregationViewModel({
          ...adaptEditorNodeViewModel({ ast: newSelection.astNode }),
          nodeId: operandViewModel.nodeId,
        } as AggregationEditorNodeViewModel);

        editAggregation({
          initialAggregation,
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
