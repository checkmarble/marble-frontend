import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import {
  type AggregationAstNode,
  aggregationAstNodeName,
  type AstNode,
  NewConstantAstNode,
} from '@app-builder/models';
import {
  type AggregationAstNodeViewModel,
  type AstNodeViewModel,
} from '@app-builder/models/ast-node-view-model';
import {
  type AggregatorOperator,
  aggregatorOperators,
} from '@app-builder/models/editable-operators';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import { aggregationDocHref } from '@app-builder/services/documentation-href';
import { CopyPasteASTContextProvider } from '@app-builder/services/editor/copy-paste-ast';
import { useDataModel } from '@app-builder/services/editor/options';
import { computeValidationForNamedChildren } from '@app-builder/services/validation/ast-node-validation';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { type Namespace } from 'i18next';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Input, ModalV2 } from 'ui-design-system';
import { Logo } from 'ui-icons';

import { Operator } from '../Operator';
import { type DataModelField, EditDataModelField } from './EditDataModelField';
import { EditFilters } from './EditFilters';

export const handle = {
  i18n: ['scenarios', 'common'] satisfies Namespace,
};

export interface AggregationViewModel {
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
  value: AstNodeViewModel;
  errors: {
    filter: EvaluationError[];
    operator: EvaluationError[];
    filteredField: EvaluationError[];
    value: EvaluationError[];
  };
}

export const adaptAggregationViewModel = (
  vm: AggregationAstNodeViewModel,
): AggregationViewModel => {
  const aggregatedField: DataModelField = {
    tableName: vm.namedChildren.tableName.constant,
    fieldName: vm.namedChildren.fieldName.constant,
  };
  const filters =
    vm.namedChildren.filters?.children.map(adaptFilterViewModel) ?? [];

  return {
    label: vm.namedChildren.label.constant ?? '',
    // No guard here: we prefer to display an unhandled operator to a default one
    aggregator: vm.namedChildren.aggregator.constant as AggregatorOperator,
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

function adaptFilterViewModel(
  filterVM: AggregationAstNodeViewModel['namedChildren']['filters']['children'][number],
): FilterViewModel {
  return {
    operator: filterVM.namedChildren.operator.constant,
    filteredField: {
      tableName: filterVM.namedChildren.tableName?.constant,
      fieldName: filterVM.namedChildren.fieldName?.constant,
    },
    value: filterVM.namedChildren.value,
    errors: {
      filter: filterVM.errors,
      operator: computeValidationForNamedChildren(filterVM, 'operator'),
      filteredField: computeValidationForNamedChildren(filterVM, [
        'tableName',
        'fieldName',
      ]),
      value: computeValidationForNamedChildren(filterVM, 'value'),
    },
  };
}

export const adaptAggregationAstNode = (
  aggregationViewModel: AggregationViewModel,
): AggregationAstNode => {
  const filters = aggregationViewModel.filters.map(
    (filter: FilterViewModel) => ({
      name: 'Filter' as const,
      constant: undefined,
      children: [],
      namedChildren: {
        operator: NewConstantAstNode({
          constant: filter.operator,
        }),
        tableName: NewConstantAstNode({
          constant: filter.filteredField?.tableName ?? null,
        }),
        fieldName: NewConstantAstNode({
          constant: filter.filteredField?.fieldName ?? null,
        }),
        value: filter.value,
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

export function AggregationEditModal({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <ModalV2.Content size="large" unmountOnHide>
          {/* New context necessary, hack to prevent pasting unwanted astnode inside the modal (ex: I close the modal, copy the current node, open the modal and paste the current inside the current...) */}
          <CopyPasteASTContextProvider>
            {aggregation ? (
              <AggregationEditModalContent
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
}

function AggregationEditModalContent({
  aggregation,
  setAggregation,
  onSave,
}: {
  aggregation: AggregationViewModel;
  setAggregation: (aggregation: AggregationViewModel) => void;
  onSave: (astNode: AstNode) => void;
}) {
  const { t } = useTranslation(handle.i18n);

  const dataModel = useDataModel();
  const dataModelFieldOptions = useMemo(
    () =>
      dataModel.flatMap((table) =>
        table.fields.map((field) => ({
          tableName: table.name,
          fieldName: field.name,
        })),
      ),
    [dataModel],
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
          <Callout variant="outlined">
            <ModalV2.Description className="whitespace-pre text-wrap">
              <Trans
                t={t}
                i18nKey="scenarios:edit_aggregation.description"
                components={{
                  DocLink: <ExternalLink href={aggregationDocHref} />,
                }}
              />
            </ModalV2.Description>
          </Callout>
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
}
