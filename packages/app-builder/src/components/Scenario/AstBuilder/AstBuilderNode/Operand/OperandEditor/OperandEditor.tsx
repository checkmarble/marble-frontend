import { Highlight } from '@app-builder/components/Highlight';
import {
  allAggregators,
  type AstNode,
  isDatabaseAccess,
  isPayload,
  type LabelledAst,
  newAggregatorLabelledAst,
  NewConstantAstNode,
  newCustomListLabelledAst,
  newDatabaseAccessorsLabelledAst,
  newEnumConstantLabelledAst,
  newPayloadAccessorsLabelledAst,
  newUndefinedLabelledAst,
  type TableModel,
} from '@app-builder/models';
import { newTimeAddLabelledAst } from '@app-builder/models/LabelledAst/TimeAdd';
import { newTimeNowLabelledAst } from '@app-builder/models/LabelledAst/TimeNow';
import { coerceToConstantsLabelledAst } from '@app-builder/services/editor';
import {
  adaptAstNodeFromEditorViewModel,
  adaptEditorNodeViewModel,
  type AstBuilder,
  getBorderColor,
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

export function getEnumOptionsFromNeighbour({
  viewModel,
  triggerObjectTable,
  dataModel,
}: {
  viewModel: OperandViewModel;
  triggerObjectTable: TableModel;
  dataModel: TableModel[];
}) {
  if (!viewModel.parent) {
    return [];
  }
  if (viewModel.parent.funcName !== '=') {
    return [];
  }
  const neighbourNodeViewModel = viewModel.parent.children.find(
    (child) => child.nodeId !== viewModel.nodeId,
  );
  if (!neighbourNodeViewModel) {
    return [];
  }
  const neighbourNode = adaptAstNodeFromEditorViewModel(neighbourNodeViewModel);
  if (isPayload(neighbourNode)) {
    const payloadAst = newPayloadAccessorsLabelledAst({
      node: neighbourNode,
      triggerObjectTable,
    });
    return payloadAst.values ?? [];
  }

  if (isDatabaseAccess(neighbourNode)) {
    const dbAccessAst = newDatabaseAccessorsLabelledAst({
      node: neighbourNode,
      dataModel,
    });
    return dbAccessAst.values ?? [];
  }
  return [];
}

export function OperandEditor({
  builder,
  operandViewModel,
  labelledAst,
  onSave,
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
  labelledAst: LabelledAst;
  onSave: (astNode: AstNode) => void;
}) {
  const { t } = useTranslation('scenarios');
  const [searchValue, setSearchValue] = useState('');

  return (
    <MenuRoot searchValue={searchValue} onSearch={setSearchValue}>
      <MenuButton
        render={
          <OperandLabel
            operandLabelledAst={labelledAst}
            type="edit"
            borderColor={getBorderColor(operandViewModel)}
            placeholder={t('edit_operand.placeholder')}
          />
        }
      />
      <MenuPopover className="w-80 flex-col">
        <OperandEditorContent
          builder={builder}
          onSave={onSave}
          labelledAst={labelledAst}
          operandViewModel={operandViewModel}
          searchValue={searchValue}
        />
      </MenuPopover>
    </MenuRoot>
  );
}

function OperandEditorContent({
  builder,
  onSave,
  labelledAst,
  operandViewModel,
  searchValue,
}: {
  builder: AstBuilder;
  onSave: (astNode: AstNode) => void;
  operandViewModel: OperandViewModel;
  labelledAst: LabelledAst;
  searchValue: string;
}) {
  const { t } = useTranslation('scenarios');
  const options = useMemo(() => {
    const databaseAccessors = builder.input.databaseAccessors.map((node) =>
      newDatabaseAccessorsLabelledAst({
        dataModel: builder.input.dataModel,
        node,
      }),
    );
    const payloadAccessors = builder.input.payloadAccessors.map((node) =>
      newPayloadAccessorsLabelledAst({
        triggerObjectTable: builder.input.triggerObjectTable,
        node,
      }),
    );
    const customLists = builder.input.customLists.map(newCustomListLabelledAst);
    const functions = [
      ...allAggregators.map(newAggregatorLabelledAst),
      newTimeAddLabelledAst(),
      newTimeNowLabelledAst(),
    ];

    const enumOptionValues = getEnumOptionsFromNeighbour({
      viewModel: operandViewModel,
      dataModel: builder.input.dataModel,
      triggerObjectTable: builder.input.triggerObjectTable,
    });
    const enumOptions = enumOptionValues?.map((enumValue) => {
      return newEnumConstantLabelledAst(
        NewConstantAstNode({
          constant: enumValue,
        }),
      );
    });

    return [
      ...payloadAccessors,
      ...databaseAccessors,
      ...customLists,
      ...functions,
      ...enumOptions,
    ];
  }, [builder.input, operandViewModel]);

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
    },
    [editAggregation, editTimeAdd, onSave, operandViewModel.nodeId],
  );

  const bottomOptions = useBottomActions({
    operandViewModel,
    onSave,
    bottomActions: {
      clear: labelledAst.name !== '',
      edit: true,
      copy: labelledAst.name !== '',
      paste: true,
    },
  });

  const { constantOptions, matchOptions } = useMatchOptions({
    options,
    onSelect: handleSelectOption,
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
                builder={builder}
                options={options}
                onSelect={handleSelectOption}
              />
            ) : (
              <OperandEditorSearchResults
                constantOptions={constantOptions}
                matchOptions={matchOptions}
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
  bottomActions,
}: {
  operandViewModel: OperandViewModel;
  onSave: (astNode: AstNode) => void;
  bottomActions: {
    /**
     * If true, show the clear action
     */
    clear?: boolean;
    /**
     * If true, show the edit action if the operand is editable (e.g. aggregation)
     */
    edit?: boolean;
    /**
     * If true, show the copy action if a CopyPasteASTContext is present
     */
    copy?: boolean;
    /**
     * If true, show the paste action if a CopyPasteASTContext is present and a copy has been made
     */
    paste?: boolean;
  };
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const editAggregation = useEditAggregation();
  const editTimeAdd = useEditTimeAdd();
  const copyPasteAST = useOptionalCopyPasteAST();

  const bottomOptions: BottomOptionProps[] = [];

  if (bottomActions.clear) {
    bottomOptions.push({
      icon: 'restart-alt',
      label: t('scenarios:edit_operand.clear_operand'),
      onSelect: () => {
        onSave(newUndefinedLabelledAst().astNode);
      },
    });
  }

  if (bottomActions.edit) {
    if (isAggregationEditorNodeViewModel(operandViewModel)) {
      bottomOptions.push({
        icon: 'edit',
        label: t('common:edit'),
        onSelect: () => {
          const initialAggregation =
            adaptAggregationViewModel(operandViewModel);

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
  }

  if (bottomActions.copy && copyPasteAST) {
    bottomOptions.push({
      icon: 'copy',
      label: t('common:copy'),
      onSelect: () => {
        copyPasteAST.setAst(adaptAstNodeFromEditorViewModel(operandViewModel));
      },
    });
  }

  if (bottomActions.paste && copyPasteAST) {
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
  onSelect,
  options,
  searchValue,
}: {
  onSelect: (option: LabelledAst) => void;
  options: LabelledAst[];
  searchValue: string;
}) {
  const { t } = useTranslation(['common']);
  const constantOptions = useMemo(() => {
    const constants = coerceToConstantsLabelledAst(searchValue, {
      booleans: { true: [t('common:true')], false: [t('common:false')] },
    });
    return constants.map((constant) => ({
      id: constant.name,
      dataType: constant.dataType,
      label: constant.name,
      onSelect: () => onSelect(constant),
    }));
  }, [searchValue, onSelect, t]);
  const matchOptions = useMemo(() => {
    const matches = matchSorter(options, searchValue, {
      keys: ['name'],
    });
    return matches.map((match) => ({
      id: match.name,
      dataType: match.dataType,
      label: <Highlight text={match.name} query={searchValue} />,
      option: match,
      onSelect: () => onSelect(match),
    }));
  }, [searchValue, onSelect, options]);

  return { constantOptions, matchOptions };
}
