import {
  type AstNode,
  type DataType,
  isUndefinedAstNode,
  NewUndefinedAstNode,
} from '@app-builder/models';
import { type OperandType } from '@app-builder/models/operand-type';
import { coerceToConstantAstNode } from '@app-builder/services/editor';
import { useOptionalCopyPasteAST } from '@app-builder/services/editor/copy-paste-ast';
import {
  useGetAstNodeDataType,
  useGetAstNodeDisplayName,
} from '@app-builder/services/editor/options';
import { type ValidationStatus } from '@app-builder/services/validation/ast-node-validation';
import { matchSorter } from 'match-sorter';
import { useMemo, useState } from 'react';
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

import { OperandLabel } from '../OperandLabel';
import { OperandEditorDiscoveryResults } from './OperandEditorDiscoveryResults';
import { OperandEditorSearchResults } from './OperandEditorSearchResults';

export function OperandEditor({
  astNode,
  dataType,
  operandType,
  displayName,
  placeholder,
  returnValue,
  onSave,
  validationStatus,
  options,
}: {
  astNode: AstNode;
  dataType: DataType;
  operandType: OperandType;
  displayName: string;
  placeholder?: string;
  returnValue?: string;
  onSave: (astNode: AstNode) => void;
  validationStatus: ValidationStatus;
  options: {
    astNode: AstNode;
    dataType: DataType;
    operandType: OperandType;
    displayName: string;
  }[];
}) {
  const [searchValue, setSearchValue] = useState('');

  return (
    <MenuRoot searchValue={searchValue} onSearch={setSearchValue}>
      <MenuButton
        render={
          <OperandLabel
            interactionMode="editor"
            astNode={astNode}
            placeholder={placeholder}
            dataType={dataType}
            operandType={operandType}
            displayName={displayName}
            returnValue={returnValue}
            validationStatus={validationStatus}
          />
        }
      />
      <MenuPopover className="w-96 flex-col">
        <OperandEditorContent
          onSave={onSave}
          astNode={astNode}
          searchValue={searchValue}
          options={options}
        />
      </MenuPopover>
    </MenuRoot>
  );
}

function OperandEditorContent({
  onSave,
  astNode,
  searchValue,
  options,
}: {
  onSave: (astNode: AstNode) => void;
  astNode: AstNode;
  searchValue: string;
  options: {
    astNode: AstNode;
    dataType: DataType;
    operandType: OperandType;
    displayName: string;
  }[];
}) {
  const { t } = useTranslation('scenarios');

  // const editAggregation = useEditAggregation();
  // const editTimeAdd = useEditTimeAdd();
  // const fuzzyMatchComparatorEdit = useFuzzyMatchComparatorEdit();

  // const onClick = useCallback(
  //   (newSelection: AstNode) => {
  //     if (isAggregation(editorNodeViewModel)) {
  //       editAggregation({
  //         initialAggregation: adaptAggregationViewModel({
  //           ...editorNodeViewModel,
  //           nodeId: operandViewModel.nodeId,
  //         }),
  //         onSave,
  //       });
  //     } else if (isTimeAddNodeViewModel(editorNodeViewModel)) {
  //       editTimeAdd({
  //         initialValue: adaptTimeAddViewModal({
  //           ...editorNodeViewModel,
  //           nodeId: operandViewModel.nodeId,
  //         }),
  //         onSave,
  //       });
  //     } else if (
  //       isFuzzyMatchComparatorEditorNodeViewModel(editorNodeViewModel)
  //     ) {
  //       fuzzyMatchComparatorEdit({
  //         initialValue: editorNodeViewModel,
  //         onSave,
  //       });
  //     } else {
  //       onSave(newSelection.astNode);
  //     }
  //   },
  //   [
  //     editAggregation,
  //     editTimeAdd,
  //     fuzzyMatchComparatorEdit,
  //     onSave,
  //     operandViewModel.nodeId,
  //   ],
  // );

  const bottomOptions = useBottomActions({
    astNode,
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
        <div className="scrollbar-gutter-stable flex flex-col gap-2 overflow-y-auto p-2 pr-[calc(0.5rem-var(--scrollbar-width))]">
          {searchValue === '' ? (
            <OperandEditorDiscoveryResults
              options={options}
              searchValue={searchValue}
              onClick={onSave}
            />
          ) : (
            <OperandEditorSearchResults
              searchValue={searchValue}
              constantOptions={constantOptions}
              matchOptions={matchOptions}
              onClick={onSave}
            />
          )}
        </div>
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
  astNode,
  onSave,
}: {
  astNode: AstNode;
  onSave: (astNode: AstNode) => void;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
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

  // TODO(modal): add a single edit that shoudl add a modal, the modal is responsible for handling factory based on the AstNode type

  // if (isEditableAstNode(astNode)) {
  //   bottomOptions.push({
  //     icon: 'edit',
  //     label: t('common:edit'),
  //     onSelect: () => {
  //       onSave(adaptAstNodeFromEditorViewModel(astNode));
  //     },
  //   });
  // }

  if (!isUndefinedAstNode(astNode) && copyPasteAST) {
    bottomOptions.push({
      icon: 'copy',
      label: t('common:copy'),
      onSelect: () => {
        copyPasteAST.setAst(astNode);
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
  options: {
    astNode: AstNode;
    dataType: DataType;
    operandType: OperandType;
    displayName: string;
  }[];
  searchValue: string;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const getAstNodeDisplayName = useGetAstNodeDisplayName();
  const getAstNodeDataType = useGetAstNodeDataType();
  const constantOptions = useMemo(() => {
    const constantAstNodes = coerceToConstantAstNode(searchValue, {
      // Accept english and localized values for booleans
      // They will be coerced to the localized value
      booleans: {
        true: ['true', t('common:true')],
        false: ['false', t('common:false')],
      },
    });
    return constantAstNodes.map((astNode) => ({
      astNode,
      displayName: getAstNodeDisplayName(astNode),
      dataType: getAstNodeDataType(astNode),
    }));
  }, [getAstNodeDataType, getAstNodeDisplayName, searchValue, t]);

  const matchOptions = useMemo(() => {
    return matchSorter(options, searchValue, {
      keys: ['displayName'],
    });
  }, [searchValue, options]);

  return { constantOptions, matchOptions };
}
