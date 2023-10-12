import {
  type AstNode,
  type LabelledAst,
  newAggregatorLabelledAst,
  newCustomListLabelledAst,
  newDatabaseAccessorsLabelledAst,
  newPayloadAccessorsLabelledAst,
  newUndefinedLabelledAst,
} from '@app-builder/models';
import { newTimeAddLabelledAst } from '@app-builder/models/LabelledAst/TimeAdd';
import { allAggregators } from '@app-builder/services/editor';
import {
  adaptEditorNodeViewModel,
  type AstBuilder,
} from '@app-builder/services/editor/ast-editor';
import { Input } from '@ui-design-system';
import { Search } from '@ui-icons';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getBorderColor } from '../../../utils';
import {
  adaptAggregationViewModel,
  isAggregationEditorNodeViewModel,
  useEditAggregation,
} from '../../AggregationEdit';
import {
  adaptTimeAddViewModal,
  isTimeAddEditorNodeViewModel,
  useEditTimeAdd,
} from '../../TimeAddEdit/Modal';
import { type OperandViewModel } from '../Operand';
import { OperandViewer } from '../OperandViewer';
import { OperandDropdownMenu } from './OperandDropdownMenu';
import { OperandEditorDiscoveryResults } from './OperandEditorDiscoveryResults';
import { OperandEditorSearchResults } from './OperandEditorSearchResults';
import { ClearOption, EditOption } from './OperandOption';

export function OperandEditor({
  builder,
  operandViewModel,
  labelledAst,
  onSave,
  viewOnly,
  ariaLabel,
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
  labelledAst: LabelledAst;
  onSave: (astNode: AstNode) => void;
  viewOnly?: boolean;
  ariaLabel?: string;
}) {
  const [open, onOpenChange] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-1">
      <OperandDropdownMenu.Root modal open={open} onOpenChange={onOpenChange}>
        <OperandDropdownMenu.Trigger
          disabled={viewOnly}
          asChild
          aria-label={ariaLabel}
        >
          <OperandViewer
            borderColor={getBorderColor(operandViewModel.validation)}
            operandLabelledAst={labelledAst}
          />
        </OperandDropdownMenu.Trigger>
        <OperandDropdownMenu.Portal>
          <OperandEditorContent
            builder={builder}
            onSave={onSave}
            closeModal={() => {
              onOpenChange(false);
            }}
            labelledAst={labelledAst}
            operandViewModel={operandViewModel}
          />
        </OperandDropdownMenu.Portal>
      </OperandDropdownMenu.Root>
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
    labelledAst: LabelledAst;
  }
>(({ builder, onSave, closeModal, labelledAst, operandViewModel }, ref) => {
  const options = useMemo(() => {
    const databaseAccessors = builder.identifiers.databaseAccessors.map(
      (node) =>
        newDatabaseAccessorsLabelledAst({
          dataModel: builder.dataModel,
          node,
        })
    );
    const payloadAccessors = builder.identifiers.payloadAccessors.map((node) =>
      newPayloadAccessorsLabelledAst({
        triggerObjectType: builder.triggerObjectType,
        node,
      })
    );
    const customLists = builder.customLists.map(newCustomListLabelledAst);
    const functions = [
      ...allAggregators.map(newAggregatorLabelledAst),
      newTimeAddLabelledAst(),
    ];
    return [
      ...payloadAccessors,
      ...databaseAccessors,
      ...customLists,
      ...functions,
    ];
  }, [
    builder.customLists,
    builder.dataModel,
    builder.identifiers.databaseAccessors,
    builder.identifiers.payloadAccessors,
    builder.triggerObjectType,
  ]);

  const [searchText, setSearchText] = useState('');

  const editAggregation = useEditAggregation();
  const editTimeAdd = useEditTimeAdd();

  const handleSelectOption = useCallback(
    (newSelection: LabelledAst) => {
      const editorNodeViewModel = adaptEditorNodeViewModel({
        ast: newSelection.astNode,
      });
      if (isAggregationEditorNodeViewModel(editorNodeViewModel)) {
        editAggregation({
          initialAggregation: adaptAggregationViewModel({
            ...editorNodeViewModel,
            nodeId: operandViewModel.nodeId,
          }),
          onSave,
        });
      } else if (isTimeAddEditorNodeViewModel(editorNodeViewModel)) {
        editTimeAdd({
          initialValue: adaptTimeAddViewModal({
            ...editorNodeViewModel,
            nodeId: operandViewModel.nodeId,
          }),
          onSave,
        });
      } else {
        onSave(newSelection.astNode);
      }
      closeModal();
    },
    [closeModal, editAggregation, editTimeAdd, onSave, operandViewModel.nodeId]
  );

  const showClearOption = labelledAst.name !== '';

  return (
    <OperandDropdownMenu.Content ref={ref}>
      <SearchInput value={searchText} onValueChange={setSearchText} />
      <OperandDropdownMenu.ScrollableViewport className="flex flex-col gap-2 p-2">
        {searchText === '' ? (
          <OperandEditorDiscoveryResults
            options={options}
            onSelect={handleSelectOption}
            triggerObjectType={builder.triggerObjectType}
          />
        ) : (
          <OperandEditorSearchResults
            searchText={searchText}
            options={options}
            onSelect={handleSelectOption}
          />
        )}
      </OperandDropdownMenu.ScrollableViewport>
      <BottomOptions>
        {isAggregationEditorNodeViewModel(operandViewModel) && (
          <EditOption
            onSelect={() => {
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
        {isTimeAddEditorNodeViewModel(operandViewModel) && (
          <EditOption
            onSelect={() => {
              const initialValue = adaptTimeAddViewModal(operandViewModel);
              editTimeAdd({ initialValue, onSave });
              closeModal();
            }}
          />
        )}
        {showClearOption && (
          <ClearOption
            onSelect={() => {
              handleSelectOption(newUndefinedLabelledAst());
            }}
          />
        )}
      </BottomOptions>
    </OperandDropdownMenu.Content>
  );
});
OperandEditorContent.displayName = 'OperandEditorContent';

function SearchInput({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const { t } = useTranslation('scenarios');
  return (
    <Input
      className="m-2 shrink-0"
      type="search"
      value={value}
      onChange={(event) => {
        onValueChange(event.target.value);
      }}
      onKeyDownCapture={(e) => {
        e.stopPropagation();
        if (e.code === 'Escape') {
          onValueChange('');
        }
      }}
      startAdornment={<Search />}
      placeholder={t('edit_operand.search.placeholder')}
    />
  );
}

function BottomOptions({ children }: { children: React.ReactNode }) {
  if (React.Children.count(children) === 0) return null;
  return (
    <div className="border-t-grey-10 flex flex-col border-t">{children}</div>
  );
}
