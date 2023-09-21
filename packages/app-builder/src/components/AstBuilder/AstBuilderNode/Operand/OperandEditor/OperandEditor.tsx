import {
  type AstNode,
  getAstNodeLabelName,
  isAggregation,
  type LabelledAst,
  newAggregatorLabelledAst,
  newCustomListLabelledAst,
  newDatabaseAccessorsLabelledAst,
  newPayloadAccessorsLabelledAst,
  newUndefinedLabelledAst,
  undefinedAstNodeName,
} from '@app-builder/models';
import {
  allAggregators,
  coerceToConstantsLabelledAst,
} from '@app-builder/services/editor';
import {
  adaptAstNodeFromEditorViewModel,
  adaptEditorNodeViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { matchSorter } from '@app-builder/utils/search';
import * as Popover from '@radix-ui/react-popover';
import { Input, ScrollArea } from '@ui-design-system';
import { Search } from '@ui-icons';
import { forwardRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorMessage } from '../../../ErrorMessage';
import { getBorderColor } from '../../../utils';
import {
  adaptAggregationViewModel,
  type AggregationEditorNodeViewModel,
  useEditAggregation,
} from '../../AggregationEdit';
import { Default } from '../../Default';
import { OperandViewer } from '../OperandViewer';
import { Count, Group, GroupHeader, Label } from './Group';
import { ClearOption, ConstantOption, OperandOption } from './OperandOption';

export type OperandViewModel = EditorNodeViewModel;

interface EditOperandViewModel {
  constantOptions: LabelledAst[];
  identifiersOptions: LabelledAst[];
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

  const availableOptions = matchSorter(
    editViewModel.identifiersOptions,
    editViewModel.searchText,
    { keys: ['name'] }
  );

  const showClearOption = operandViewModel.funcName !== undefinedAstNodeName;

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
        {showClearOption && (
          <div className="border-t-grey-10 border-t">
            <ClearOption
              onClick={() => {
                handleSelectOption(newUndefinedLabelledAst());
                closeModal();
              }}
            />
          </div>
        )}
        <ScrollArea.Scrollbar>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </Popover.Content>
    </ScrollArea.Root>
  );
});
OperandEditorContent.displayName = 'OperandEditorContent';
