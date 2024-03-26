import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import {
  type AggregationAstNode,
  aggregationAstNodeName,
  type AstNode,
  NewConstantAstNode,
} from '@app-builder/models';
import {
  type AggregatorOperator,
  aggregatorOperators,
} from '@app-builder/models/editable-operators';
import {
  computeValidationForNamedChildren,
  type EvaluationError,
} from '@app-builder/models/node-evaluation';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { CopyPasteASTContextProvider } from '@app-builder/services/editor/copy-paste-ast';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { type Namespace } from 'i18next';
import {
  type PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, ModalV2 } from 'ui-design-system';
import { Logo } from 'ui-icons';

import { Operator } from '../Operator';
import { type DataModelField, EditDataModelField } from './EditDataModelField';
import { EditFilters } from './EditFilters';

export const handle = {
  i18n: ['scenarios', 'common'] satisfies Namespace,
};

export interface AggregationViewModel {
  nodeId: string;
  label: string;
  aggregator: AggregatorOperator;
  aggregatedField: DataModelField | null;
  filters: FilterViewModel[];
  errors: {
    label: EvaluationError[];
    aggregator: EvaluationError[];
    aggregatedField: EvaluationError[];
  };
}
export interface FilterViewModel {
  operator: string | null;
  filteredField: DataModelField | null;
  value: EditorNodeViewModel;
  errors: {
    filter: EvaluationError[];
    operator: EvaluationError[];
    filteredField: EvaluationError[];
    value: EvaluationError[];
  };
}

export type AggregationEditorNodeViewModel = {
  nodeId: string;
  funcName: string | null;
  constant: string;
  errors: EvaluationError[];
  children: AggregationEditorNodeViewModel[];
  namedChildren: Record<string, AggregationEditorNodeViewModel>;
  parent: AggregationEditorNodeViewModel;
};

export const isAggregationEditorNodeViewModel = (
  vm: EditorNodeViewModel,
): vm is AggregationEditorNodeViewModel => {
  return vm.funcName === aggregationAstNodeName;
};

export const adaptAggregationViewModel = (
  vm: AggregationEditorNodeViewModel,
): AggregationViewModel => {
  const aggregatedField: DataModelField = {
    tableName: vm.namedChildren['tableName']?.constant,
    fieldName: vm.namedChildren['fieldName']?.constant,
  };
  const filters = vm.namedChildren['filters']
    ? vm.namedChildren['filters'].children.map(adaptFilterViewModel)
    : [];

  return {
    nodeId: vm.nodeId,
    label: vm.namedChildren['label']?.constant,
    // No guard here: we prefer to display an unhandled operator to a default one
    aggregator: vm.namedChildren['aggregator'].constant as AggregatorOperator,
    aggregatedField,
    filters,
    errors: {
      label: computeValidationForNamedChildren(vm, 'label'),
      aggregator: computeValidationForNamedChildren(vm, 'aggregator'),
      aggregatedField: computeValidationForNamedChildren(vm, [
        'tableName',
        'fieldName',
      ]),
    },
  };
};

const adaptFilterViewModel = (
  filterVM: AggregationEditorNodeViewModel,
): FilterViewModel => ({
  operator: filterVM.namedChildren['operator']?.constant,
  filteredField: {
    tableName: filterVM.namedChildren['tableName']?.constant,
    fieldName: filterVM.namedChildren['fieldName']?.constant,
  },
  value: filterVM.namedChildren['value'],
  errors: {
    filter: filterVM.errors,
    operator: computeValidationForNamedChildren(filterVM, 'operator'),
    filteredField: computeValidationForNamedChildren(filterVM, [
      'tableName',
      'fieldName',
    ]),
    value: computeValidationForNamedChildren(filterVM, 'value'),
  },
});

export const adaptAggregationAstNode = (
  aggregationViewModel: AggregationViewModel,
): AggregationAstNode => {
  const filters = aggregationViewModel.filters.map(
    (filter: FilterViewModel) => ({
      name: 'Filter' as const,
      constant: undefined,
      children: [],
      namedChildren: {
        operator: NewConstantAstNode({ constant: filter.operator }),
        tableName: NewConstantAstNode({
          constant: filter.filteredField?.tableName ?? null,
        }),
        fieldName: NewConstantAstNode({
          constant: filter.filteredField?.fieldName ?? null,
        }),
        value: adaptAstNodeFromEditorViewModel(filter.value),
      },
    }),
  );
  return {
    name: aggregationAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      label: NewConstantAstNode({
        constant: aggregationViewModel.label,
      }),
      aggregator: NewConstantAstNode({
        constant: aggregationViewModel.aggregator,
      }),
      tableName: NewConstantAstNode({
        constant: aggregationViewModel.aggregatedField?.tableName ?? '',
      }),
      fieldName: NewConstantAstNode({
        constant: aggregationViewModel.aggregatedField?.fieldName ?? '',
      }),
      filters: {
        name: 'List',
        constant: undefined,
        children: filters,
        namedChildren: {},
      },
    },
  };
};

export interface AggregationEditModalProps {
  initialAggregation: AggregationViewModel;
  onSave: (astNode: AstNode) => void;
}

const AggregationEditModalContext = createSimpleContext<
  (agregationProps: AggregationEditModalProps) => void
>('AggregationEditModal');

export const useEditAggregation = AggregationEditModalContext.useValue;

export const AggregationEditModal = ({
  builder,
  children,
}: PropsWithChildren<{
  builder: AstBuilder;
}>) => {
  const [open, onOpenChange] = useState<boolean>(false);
  const [aggregation, setAggregation] = useState<AggregationViewModel>();
  const onSaveRef = useRef<(astNode: AstNode) => void>();

  const editAgregation = useCallback(
    (aggregationProps: AggregationEditModalProps) => {
      setAggregation(aggregationProps.initialAggregation);
      onSaveRef.current = aggregationProps.onSave;
      onOpenChange(true);
    },
    [],
  );

  return (
    <ModalV2.Root open={open} setOpen={onOpenChange}>
      <AggregationEditModalContext.Provider value={editAgregation}>
        {children}
        <ModalV2.Content size="large">
          {/* New context necessary, hack to prevent pasting unwanted astnode inside the modal (ex: I close the modal, copy the current node, open the modal and paste the current inside the current...) */}
          <CopyPasteASTContextProvider>
            {aggregation ? (
              <AggregationEditModalContent
                builder={builder}
                aggregation={aggregation}
                setAggregation={setAggregation}
                onSave={(astNode) => {
                  onSaveRef.current?.(astNode);
                  onOpenChange(false);
                }}
              />
            ) : null}
          </CopyPasteASTContextProvider>
        </ModalV2.Content>
      </AggregationEditModalContext.Provider>
    </ModalV2.Root>
  );
};

const AggregationEditModalContent = ({
  builder,
  aggregation,
  setAggregation,
  onSave,
}: {
  builder: AstBuilder;
  aggregation: AggregationViewModel;
  setAggregation: (aggregation: AggregationViewModel) => void;
  onSave: (astNode: AstNode) => void;
}) => {
  const { t } = useTranslation(handle.i18n);

  const dataModelFieldOptions = useMemo(
    () =>
      builder.input.dataModel.flatMap((table) =>
        table.fields.map((field) => ({
          tableName: table.name,
          fieldName: field.name,
        })),
      ),
    [builder.input.dataModel],
  );

  const handleSave = () => {
    onSave(adaptAggregationAstNode(aggregation));
  };

  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();

  return (
    <>
      <ModalV2.Title>
        <div className="flex flex-row items-center justify-center gap-3">
          {t('scenarios:edit_aggregation.title')}
          <div className="flex flex-row items-center justify-center gap-1">
            <Logo logo="logo" className="size-4" />
            <span className="text-grey-50 text-xs font-light">
              {t('scenarios:edit_aggregation.subtitle')}
            </span>
          </div>
        </div>
      </ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="aggregation.label">
              {t('scenarios:edit_aggregation.label_title')}
            </label>
            <Input
              type="text"
              id="aggregation.label"
              placeholder={t('scenarios:edit_aggregation.label_placeholder')}
              value={aggregation.label}
              onChange={(e) =>
                setAggregation({
                  ...aggregation,
                  label: e.target.value,
                  errors: {
                    ...aggregation.errors,
                    label: [],
                  },
                })
              }
              borderColor={
                aggregation.errors.label.length > 0 ? 'red-100' : 'grey-10'
              }
            />
            <EvaluationErrors
              errors={adaptEvaluationErrorViewModels(
                aggregation.errors.label,
              ).map(getNodeEvaluationErrorMessage)}
            />
          </div>
          <div className="flex flex-col gap-2">
            {t('scenarios:edit_aggregation.function_title')}
            <div className="grid grid-cols-[150px_1fr] gap-2">
              <div className="flex flex-col gap-2">
                <Operator
                  value={aggregation.aggregator}
                  setValue={(aggregator) =>
                    setAggregation({
                      ...aggregation,
                      aggregator,
                      errors: {
                        ...aggregation.errors,
                        aggregator: [],
                      },
                    })
                  }
                  errors={aggregation.errors.aggregator}
                  operators={aggregatorOperators}
                />
                <EvaluationErrors
                  errors={adaptEvaluationErrorViewModels(
                    aggregation.errors.aggregator,
                  ).map(getNodeEvaluationErrorMessage)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <EditDataModelField
                  placeholder={t('scenarios:edit_aggregation.select_a_field')}
                  value={aggregation.aggregatedField}
                  options={dataModelFieldOptions}
                  onChange={(aggregatedField) =>
                    setAggregation({
                      ...aggregation,
                      aggregatedField,
                      errors: {
                        ...aggregation.errors,
                        aggregatedField: [],
                      },
                    })
                  }
                  errors={aggregation.errors.aggregatedField}
                />
                <EvaluationErrors
                  errors={adaptEvaluationErrorViewModels(
                    aggregation.errors.aggregatedField,
                  ).map(getNodeEvaluationErrorMessage)}
                />
              </div>
            </div>
            <EditFilters
              aggregatedField={aggregation.aggregatedField}
              builder={builder}
              value={aggregation.filters}
              dataModelFieldOptions={dataModelFieldOptions}
              onChange={(filters) =>
                setAggregation({ ...aggregation, filters })
              }
            />
          </div>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close
            render={
              <Button className="flex-1" variant="secondary" name="cancel" />
            }
          >
            {t('common:cancel')}
          </ModalV2.Close>
          <Button
            className="flex-1"
            variant="primary"
            name="save"
            onClick={() => handleSave()}
          >
            {t('common:save')}
          </Button>
        </div>
      </div>
    </>
  );
};
