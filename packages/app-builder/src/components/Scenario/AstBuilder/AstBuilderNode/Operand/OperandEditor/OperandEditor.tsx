import {
  type AstNode,
  isUndefinedAstNode,
  NewUndefinedAstNode,
} from '@app-builder/models';
import { type EditableAstNode } from '@app-builder/models/editable-ast-node';
import { useOperandOptions } from '@app-builder/services/ast-node/options';
import { coerceToConstantEditableAstNode } from '@app-builder/services/editor';
import {
  adaptAstNodeFromEditorViewModel,
  adaptEditorNodeViewModel,
  getValidationStatus,
} from '@app-builder/services/editor/ast-editor';
import { useOptionalCopyPasteAST } from '@app-builder/services/editor/copy-paste-ast';
import { matchSorter } from 'match-sorter';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Input,
  MenuButton,
  MenuCombobox,
  MenuContent,
  MenuItem,
  MenuPopover,
  MenuRoot,
  ScrollAreaV2,
} from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

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
import { OperandLabel } from '../OperandLabel';
import { OperandEditorDiscoveryResults } from './OperandEditorDiscoveryResults';
import { OperandEditorSearchResults } from './OperandEditorSearchResults';

export function OperandEditor({
  operandViewModel,
  editableAstNode,
  onSave,
}: {
  operandViewModel: OperandViewModel;
  editableAstNode: EditableAstNode;
  onSave: (astNode: AstNode) => void;
}) {
  const { t } = useTranslation('scenarios');
  const [searchValue, setSearchValue] = useState('');

  return (
    <MenuRoot searchValue={searchValue} onSearch={setSearchValue}>
      <MenuButton
        render={
          <OperandLabel
            editableAstNode={editableAstNode}
            type="editor"
            validationStatus={getValidationStatus(operandViewModel)}
            placeholder={t('edit_operand.placeholder')}
          />
        }
      />
      <MenuPopover className="w-80 flex-col">
        <OperandEditorContent
          onSave={onSave}
          operandViewModel={operandViewModel}
          searchValue={searchValue}
        />
      </MenuPopover>
    </MenuRoot>
  );
}

function OperandEditorContent({
  onSave,
  operandViewModel,
  searchValue,
}: {
  onSave: (astNode: AstNode) => void;
  operandViewModel: OperandViewModel;
  searchValue: string;
}) {
  const { t } = useTranslation('scenarios');

  const options = useOperandOptions({ operandViewModel });

  const editAggregation = useEditAggregation();
  const editTimeAdd = useEditTimeAdd();

  const onClick = useCallback(
    (newSelection: EditableAstNode) => {
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
    },
    [editAggregation, editTimeAdd, onSave, operandViewModel.nodeId],
  );

  const bottomOptions = useBottomActions({
    operandViewModel,
    onSave,
  });

  const { constantOptions, matchOptions } = useMatchOptions({
    options,
    searchValue,
  });

  return (
    <>
      <MenuCombobox
        render={
          <Input
            className="m-2 shrink-0"
            type="search"
            startAdornment="search"
            placeholder={t('edit_operand.search.placeholder')}
          />
        }
      />
      <MenuContent>
        <ScrollAreaV2 type="auto">
          <div className="flex flex-col gap-2 p-2">
            {searchValue === '' ? (
              <OperandEditorDiscoveryResults
                options={options}
                searchValue={searchValue}
                onClick={onClick}
              />
            ) : (
              <OperandEditorSearchResults
                searchValue={searchValue}
                constantOptions={constantOptions}
                matchOptions={matchOptions}
                onClick={onClick}
              />
            )}
          </div>
        </ScrollAreaV2>
        {bottomOptions.length > 0 ? (
          <BottomOptions options={bottomOptions} />
        ) : null}
      </MenuContent>
    </>
  );
}

interface BottomOptionProps {
  icon: IconName;
  label: string;
  onSelect: () => void;
}

function BottomOptions({ options }: { options: BottomOptionProps[] }) {
  return (
    <ScrollAreaV2
      orientation="horizontal"
      className="border-t-grey-10 sticky bottom-0 shrink-0 border-t"
    >
      <div className="flex w-fit shrink-0 flex-row gap-2 p-2">
        {options.map(({ icon, label, onSelect }) => (
          <MenuItem
            key={label}
            render={
              <Button
                variant="secondary"
                className="data-[active-item]:bg-purple-05 scroll-mx-2 data-[active-item]:border-purple-100"
                onClick={onSelect}
              >
                <Icon icon={icon} className="size-4" />
                <span className="line-clamp-1">{label}</span>
              </Button>
            }
          />
        ))}
      </div>
    </ScrollAreaV2>
  );
}

function useBottomActions({
  operandViewModel,
  onSave,
}: {
  operandViewModel: OperandViewModel;
  onSave: (astNode: AstNode) => void;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const astNode = adaptAstNodeFromEditorViewModel(operandViewModel);
  const editAggregation = useEditAggregation();
  const editTimeAdd = useEditTimeAdd();
  const copyPasteAST = useOptionalCopyPasteAST();

  const bottomOptions: BottomOptionProps[] = [];

  if (!isUndefinedAstNode(astNode)) {
    bottomOptions.push({
      icon: 'restart-alt',
      label: t('scenarios:edit_operand.clear_operand'),
      onSelect: () => {
        onSave(NewUndefinedAstNode());
      },
    });
  }

  if (isAggregationEditorNodeViewModel(operandViewModel)) {
    bottomOptions.push({
      icon: 'edit',
      label: t('common:edit'),
      onSelect: () => {
        const initialAggregation = adaptAggregationViewModel(operandViewModel);

        editAggregation({
          initialAggregation,
          onSave,
        });
      },
    });
  } else if (isTimeAddEditorNodeViewModel(operandViewModel)) {
    bottomOptions.push({
      icon: 'edit',
      label: t('common:edit'),
      onSelect: () => {
        const initialValue = adaptTimeAddViewModal(operandViewModel);
        editTimeAdd({ initialValue, onSave });
      },
    });
  }

  if (!isUndefinedAstNode(astNode) && copyPasteAST) {
    bottomOptions.push({
      icon: 'copy',
      label: t('common:copy'),
      onSelect: () => {
        copyPasteAST.setAst(adaptAstNodeFromEditorViewModel(operandViewModel));
      },
    });
  }

  if (copyPasteAST) {
    const { ast } = copyPasteAST;
    if (ast) {
      bottomOptions.push({
        icon: 'clipboard-document',
        label: t('common:paste'),
        onSelect: () => {
          onSave(ast);
        },
      });
    }
  }

  return bottomOptions;
}

function useMatchOptions({
  options,
  searchValue,
}: {
  options: EditableAstNode[];
  searchValue: string;
}) {
  const { t } = useTranslation(['common']);
  const constantOptions = useMemo(() => {
    return coerceToConstantEditableAstNode(searchValue, {
      booleans: { true: [t('common:true')], false: [t('common:false')] },
    });
  }, [searchValue, t]);
  const matchOptions = useMemo(() => {
    return matchSorter(options, searchValue, {
      keys: ['displayName'],
    });
  }, [searchValue, options]);

  return { constantOptions, matchOptions };
}
