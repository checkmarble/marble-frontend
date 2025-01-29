import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { type AstNode } from '@app-builder/models';
import {
  type AggregationAstNode,
  aggregationAstNodeName,
  type AggregationFilterAstNode,
  type AggregationFilterOperator,
  type BinaryAggregationFilterOperator,
  binaryAggregationFilterOperators,
  type GetAggregationFilterOperator,
  isUnaryAggregationFilter,
  type UnaryAggregationFilterOperator,
  unaryAggregationFilterOperators,
} from '@app-builder/models/astNode/aggregation';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import {
  type AggregatorOperator,
  aggregatorOperators,
} from '@app-builder/models/modale-operators';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import { aggregationDocHref } from '@app-builder/services/documentation-href';
import { useDataModel } from '@app-builder/services/editor/options';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import {
  type AstNodeErrors,
  computeValidationForNamedChildren,
} from '@app-builder/services/validation/ast-node-validation';
import { type Tree } from '@app-builder/utils/tree';
import { type Namespace } from 'i18next';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { groupBy, mapValues, pipe } from 'remeda';
import { Button, Input, ModalV2 } from 'ui-design-system';
import { Logo } from 'ui-icons';

import { Operator } from '../../../../Operator';
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
export type FilterViewModel<
  T extends AggregationFilterOperator = AggregationFilterOperator,
> = {
  operator: T | null;
  filteredField: DataModelField | null;
  errors: {
    filter: EvaluationError[];
    operator: EvaluationError[];
    filteredField: EvaluationError[];
    value: EvaluationError[];
  };
} & (T extends UnaryAggregationFilterOperator
  ? { value?: undefined }
  : {
      value: { astNode: AstNode; astNodeErrors?: AstNodeErrors };
    });

export const isUnaryFilterModel = (
  filter: FilterViewModel,
): filter is FilterViewModel<UnaryAggregationFilterOperator> => {
  return (
    !!filter.operator &&
    (
      unaryAggregationFilterOperators as ReadonlyArray<AggregationFilterOperator>
    ).includes(filter.operator)
  );
};

export const isBinaryFilterModel = (
  filter: FilterViewModel,
): filter is FilterViewModel<BinaryAggregationFilterOperator> => {
  return (
    filter.operator === null ||
    (
      binaryAggregationFilterOperators as ReadonlyArray<AggregationFilterOperator>
    ).includes(filter.operator)
  );
};

export const adaptAggregationViewModel = (
  initialAggregationAstNode: AggregationAstNode,
  initialAstNodeErrors: AstNodeErrors,
): AggregationViewModel => {
  const aggregatedField: DataModelField = {
    tableName: initialAggregationAstNode.namedChildren.tableName.constant,
    fieldName: initialAggregationAstNode.namedChildren.fieldName.constant,
  };

  const initialFiltersAstNodeErrors = initialAstNodeErrors.namedChildren[
    'filters'
  ] ?? {
    errors: [],
    children: [],
    namedChildren: {},
  };
  const globalFiltersAstNodeErrors = initialAstNodeErrors.errors.filter(
    (error) => error.argumentName?.startsWith('filters'),
  );
  const filters = initialAggregationAstNode.namedChildren.filters.children.map(
    (filterAstNode, index) => {
      const globalErrors = globalFiltersAstNodeErrors.filter((err) =>
        err.argumentName?.startsWith(`filters.${index}`),
      );

      const initialErrorForFilter = initialFiltersAstNodeErrors.children[index];

      const errorsGroupedByField = pipe(
        globalErrors,
        groupBy((err) => {
          return err.argumentName?.replace(`filters.${index}.`, '') ?? '';
        }),
        mapValues((errors, key) => {
          const initialErrorForField: Tree<{ errors: EvaluationError[] }> =
            initialErrorForFilter?.namedChildren[key] ?? {
              errors: [],
              children: [],
              namedChildren: {},
            };
          return {
            ...initialErrorForField,
            errors: [...(initialErrorForField.errors ?? []), ...errors],
          };
        }),
      );

      const initialFilterAstNodeErrors = initialErrorForFilter
        ? {
            ...initialErrorForFilter,
            namedChildren: {
              ...initialErrorForFilter.namedChildren,
              ...errorsGroupedByField,
            },
          }
        : {
            errors: [],
            children: [],
            namedChildren: errorsGroupedByField,
          };

      return adaptFilterViewModel(filterAstNode, initialFilterAstNodeErrors);
    },
  );

  return {
    label: initialAggregationAstNode.namedChildren.label.constant ?? '',
    // No guard here: we prefer to display an unhandled operator to a default one
    aggregator: initialAggregationAstNode.namedChildren.aggregator
      .constant as AggregatorOperator,
    aggregatedField,
    filters,
    errors: {
      label: computeValidationForNamedChildren(
        initialAggregationAstNode,
        initialAstNodeErrors,
        'label',
      ),
      aggregator: computeValidationForNamedChildren(
        initialAggregationAstNode,
        initialAstNodeErrors,
        'aggregator',
      ),
      aggregatedField: computeValidationForNamedChildren(
        initialAggregationAstNode,
        initialAstNodeErrors,
        ['tableName', 'fieldName'],
      ),
    },
  };
};

function adaptFilterViewModel<
  T extends AggregationFilterAstNode = AggregationFilterAstNode,
>(
  filterAstNode: T,
  initialAstNodeErrors: AstNodeErrors,
): FilterViewModel<GetAggregationFilterOperator<T>> {
  return {
    operator: filterAstNode.namedChildren.operator.constant,
    filteredField: {
      tableName: filterAstNode.namedChildren.tableName?.constant,
      fieldName: filterAstNode.namedChildren.fieldName?.constant,
    },
    ...(isUnaryAggregationFilter(filterAstNode)
      ? {}
      : {
          value: {
            astNode: filterAstNode.namedChildren.value,
            astNodeErrors: initialAstNodeErrors.namedChildren['value'],
          },
        }),
    errors: {
      filter: initialAstNodeErrors.errors,
      operator: computeValidationForNamedChildren(
        filterAstNode,
        initialAstNodeErrors,
        'operator',
      ),
      filteredField: computeValidationForNamedChildren(
        filterAstNode,
        initialAstNodeErrors,
        ['tableName', 'fieldName'],
      ),
      ...(isUnaryAggregationFilter(filterAstNode)
        ? {}
        : {
            value: computeValidationForNamedChildren(
              filterAstNode,
              initialAstNodeErrors,
              'value',
            ),
          }),
    },
  } as FilterViewModel<GetAggregationFilterOperator<T>>;
}

export const adaptAggregationAstNode = (
  aggregationViewModel: AggregationViewModel,
): AggregationAstNode => {
  const filters = aggregationViewModel.filters.map(
    (filter: FilterViewModel) =>
      ({
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
          value: filter.value?.astNode,
        },
      }) as AggregationFilterAstNode,
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

export function AggregationEdit({
  initialAggregationAstNode,
  initialAstNodeErrors,
  onSave,
}: {
  initialAggregationAstNode: AggregationAstNode;
  initialAstNodeErrors: AstNodeErrors;
  onSave: (astNode: AstNode) => void;
}) {
  const { t } = useTranslation(handle.i18n);
  const [aggregation, setAggregation] = useState(() =>
    adaptAggregationViewModel(initialAggregationAstNode, initialAstNodeErrors),
  );

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
      <div className="flex max-h-[70dvh] flex-col gap-10 overflow-auto p-6">
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
                aggregation.errors.label.length > 0
                  ? 'redfigma-47'
                  : 'greyfigma-90'
              }
            />
            <EvaluationErrors
              errors={adaptEvaluationErrorViewModels(
                aggregation.errors.label,
              ).map(getNodeEvaluationErrorMessage)}
            />
          </div>
          <div className="grid grid-cols-[150px_1fr] gap-2">
            <div>{t('scenarios:edit_aggregation.function_title')}</div>
            <div>{t('scenarios:edit_aggregation.object_field_title')}</div>
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
                validationStatus={
                  aggregation.errors.aggregator.length > 0 ? 'error' : 'valid'
                }
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
              />
              <EvaluationErrors
                errors={adaptEvaluationErrorViewModels(
                  aggregation.errors.aggregatedField,
                ).map(getNodeEvaluationErrorMessage)}
              />
            </div>
          </div>
        </div>
        <EditFilters
          aggregatedField={aggregation.aggregatedField}
          value={aggregation.filters}
          dataModelFieldOptions={dataModelFieldOptions}
          onChange={(filters) => setAggregation({ ...aggregation, filters })}
        />
        <div className="mt-2 flex flex-1 flex-row gap-2">
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
