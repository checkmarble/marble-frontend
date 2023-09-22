import {
  type AstNode,
  isAggregation,
  type LabelledAst,
  newAggregatorLabelledAst,
  newCustomListLabelledAst,
  newDatabaseAccessorsLabelledAst,
  newPayloadAccessorsLabelledAst,
  newUndefinedLabelledAst,
} from '@app-builder/models';
import {
  allAggregators,
  coerceToConstantsLabelledAst,
} from '@app-builder/services/editor';
import {
  adaptEditorNodeViewModel,
  type AstBuilder,
} from '@app-builder/services/editor/ast-editor';
import { matchSorter } from '@app-builder/utils/search';
import * as Popover from '@radix-ui/react-popover';
import { Input, ScrollArea } from '@ui-design-system';
import { Search } from '@ui-icons';
import React, { forwardRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorMessage } from '../../../ErrorMessage';
import { getBorderColor } from '../../../utils';
import {
  adaptAggregationViewModel,
  type AggregationEditorNodeViewModel,
  isAggregationEditorNodeViewModel,
  useEditAggregation,
} from '../../AggregationEdit';
import { type OperandViewModel } from '../Operand';
import { OperandViewer } from '../OperandViewer';
import { Count, Group, GroupHeader, Label } from './Group';
import {
  ClearOption,
  ConstantOption,
  EditOption,
  OperandOption,
} from './OperandOption';

export function OperandEditor({
  builder,
  operandViewModel,
  labelledAst,
  onSave,
  viewOnly,
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
  labelledAst: LabelledAst;
  onSave: (astNode: AstNode) => void;
  viewOnly?: boolean;
}) {
  const [open, onOpenChange] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-1">
      <Popover.Root modal open={open} onOpenChange={onOpenChange}>
        <Popover.Trigger asChild disabled={viewOnly}>
          <OperandViewer
            borderColor={getBorderColor(operandViewModel.validation)}
            operandLabelledAst={labelledAst}
          />
        </Popover.Trigger>
        <Popover.Portal>
          <OperandEditorContent
            builder={builder}
            onSave={onSave}
            closeModal={() => {
              onOpenChange(false);
            }}
            labelledAst={labelledAst}
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

interface EditOperandViewModel {
  constantOptions: LabelledAst[];
  identifiersOptions: LabelledAst[];
  searchText: string;
}

const OperandEditorContent = forwardRef<
  HTMLDivElement,
  {
    builder: AstBuilder;
    onSave: (astNode: AstNode) => void;
    closeModal: () => void;
    operandViewModel: OperandViewModel;
    labelledAst: LabelledAst;
  }
>(({ builder, onSave, closeModal, labelledAst, operandViewModel }, ref) => {
  const { t } = useTranslation('scenarios');
  const [editViewModel, setEditViewModel] = useState<EditOperandViewModel>(
    () => {
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
        searchText: '',
      };
    }
  );

  const handleInputChanged = useCallback(
    (newInputText: string) => {
      setEditViewModel((vm) => ({
        ...vm,
        searchText: newInputText,
        constantOptions: coerceToConstantsLabelledAst(newInputText, {
          booleans: { true: [t('true')], false: [t('false')] },
        }),
      }));
    },
    [t]
  );

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

  const availableOptions = matchSorter(
    editViewModel.identifiersOptions,
    editViewModel.searchText,
    { keys: ['name'] }
  );

  const showClearOption = labelledAst.name !== '';

  return (
    <ScrollArea.Root asChild>
      <Popover.Content
        ref={ref}
        side="bottom"
        align="start"
        className="animate-slideUpAndFade bg-grey-00 border-grey-10 mt-1 flex max-h-[320px] w-[320px] flex-col rounded border shadow-md will-change-[transform,opacity]"
      >
        <Input
          className="m-2 flex-shrink-0"
          type="search"
          value={editViewModel.searchText}
          onChange={(event) => {
            handleInputChanged(event.target.value);
          }}
          onKeyDownCapture={(e) => {
            if (e.code === 'Escape') {
              e.stopPropagation(); // To prevent the popover from closing
              handleInputChanged('');
            }
          }}
          startAdornment={<Search />}
          placeholder={t('edit_operand.search.placeholder')}
        />
        <ScrollArea.Viewport tabIndex={-1}>
          <div className="flex flex-col gap-2 p-2">
            <Group>
              {editViewModel.constantOptions.map((constant) => (
                <ConstantOption
                  key={constant.name}
                  constant={constant}
                  onClick={() => {
                    handleSelectOption(constant);
                    closeModal();
                  }}
                />
              ))}
            </Group>
            <Group>
              <GroupHeader.Container>
                <GroupHeader.Title>
                  <Label>
                    {t('edit_operand.result', {
                      count: availableOptions.length,
                    })}
                  </Label>
                  <Count>{availableOptions.length}</Count>
                </GroupHeader.Title>
              </GroupHeader.Container>
              {availableOptions.map((option) => (
                <OperandOption
                  key={option.name}
                  searchText={editViewModel.searchText}
                  option={option}
                  onClick={() => {
                    handleSelectOption(option);
                    closeModal();
                  }}
                />
              ))}
            </Group>
          </div>
        </ScrollArea.Viewport>
        <BottomOptions>
          {isAggregationEditorNodeViewModel(operandViewModel) && (
            <EditOption
              onClick={() => {
                const initialAggregation =
                  adaptAggregationViewModel(operandViewModel);

                editAggregation({
                  initialAggregation,
                  onSave,
                });
                closeModal();
              }}
            />
          )}
          {showClearOption && (
            <ClearOption
              onClick={() => {
                handleSelectOption(newUndefinedLabelledAst());
                closeModal();
              }}
            />
          )}
        </BottomOptions>
        <ScrollArea.Scrollbar>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </Popover.Content>
    </ScrollArea.Root>
  );
});
OperandEditorContent.displayName = 'OperandEditorContent';

function BottomOptions({ children }: { children: React.ReactNode }) {
  if (React.Children.count(children) === 0) return null;
  return (
    <div className="border-t-grey-10 flex flex-col border-t">{children}</div>
  );
}
