import { Callout } from '@app-builder/components';
import { scenarioI18n } from '@app-builder/components/Scenario';
import { RemoveButton } from '@app-builder/components/Scenario/AstBuilder/RemoveButton';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { type AstNode, type DataModel, NewUndefinedAstNode } from '@app-builder/models';
import {
  aggregationFilterOperators,
  isAggregationFilterOperator,
  isUnaryAggregationFilterOperator,
} from '@app-builder/models/astNode/aggregation';
import {
  useDefaultCoerceToConstant,
  useGetAstNodeOperandProps,
  useOperandOptions,
} from '@app-builder/services/editor/options';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import {
  type AstNodeErrors,
  type ValidationStatus,
} from '@app-builder/services/validation/ast-node-validation';
import clsx from 'clsx';
import { Fragment, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, MenuButton, MenuRoot } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { Operator } from '../../../../Operator';
import { Operand } from '../../../Operand';
import { type FilterViewModel, isBinaryFilterModel } from './AggregationEdit';
import { type DataModelFieldOption, EditDataModelFieldTableMenu } from './EditDataModelField';

const newFilterValidation = () => ({
  filter: [],
  filteredField: [],
  operator: [],
  value: [],
});

export function EditFilters({
  aggregatedField,
  dataModel,
  onChange,
  value,
}: {
  aggregatedField: DataModelFieldOption | null;
  dataModel: DataModel;
  onChange: (value: FilterViewModel[]) => void;
  value: FilterViewModel[];
}) {
  const { t } = useTranslation(scenarioI18n);

  const tableName = aggregatedField?.tableName;
  const options = useMemo(() => {
    return tableName
      ? dataModel
          .find((t) => t.name === tableName)
          ?.fields.map((f) => ({ tableName, fieldName: f.name, field: f }))
      : null;
  }, [tableName, dataModel]);

  const onFilterChange = (newFieldValue: Partial<FilterViewModel>, filterIndex: number): void => {
    onChange(
      value.map((filter, index) => {
        if (index !== filterIndex) {
          return filter;
        }

        if ('operator' in newFieldValue && !!newFieldValue.operator) {
          const isOldOpUnary = isUnaryAggregationFilterOperator(filter.operator);
          const isNewOpUnary = isUnaryAggregationFilterOperator(newFieldValue.operator);
          const isBinaryToUnary = !isOldOpUnary && isNewOpUnary;
          const isUnaryToBinary = isOldOpUnary && !isNewOpUnary;

          if (isBinaryToUnary || isUnaryToBinary) {
            if (isBinaryToUnary) {
              return {
                operator: newFieldValue.operator,
                filteredField: filter.filteredField,
                value: undefined,
                errors: newFilterValidation(),
              };
            } else {
              return {
                operator: newFieldValue.operator,
                filteredField: filter.filteredField,
                value: { astNode: NewUndefinedAstNode() },
                errors: newFilterValidation(),
              };
            }
          }
        }

        return {
          ...filter,
          ...newFieldValue,
          errors: newFilterValidation(),
        };
      }),
    );
  };

  const addNewFilter = (field: DataModelFieldOption) => {
    onChange([
      ...value,
      {
        operator: null,
        filteredField: field,
        value: { astNode: NewUndefinedAstNode() },
        errors: newFilterValidation(),
      },
    ]);
  };

  const removeFilter = (filterIndex: number) => {
    onChange(value.filter((_, index) => index !== filterIndex));
  };

  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();

  return (
    <div className="flex flex-col gap-4">
      <div className="text-m">
        <Trans
          t={t}
          i18nKey={
            tableName
              ? 'scenarios:edit_aggregation.filters_in'
              : 'scenarios:edit_aggregation.filters'
          }
          values={{ tableName }}
        />
      </div>
      {value.length > 0 ? (
        <div className="flex flex-col gap-2">
          {value.map((filter, filterIndex) => {
            const binaryFilter = isBinaryFilterModel(filter);
            const hasFilteredFieldError = filter.errors.filteredField.length > 0;
            const isLastFilter = filterIndex === value.length - 1;

            return (
              <Fragment key={filterIndex}>
                <div className="border-grey-90 flex flex-col gap-4 rounded-md border-[0.5px] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-grey-50 flex items-center gap-2 pl-2 text-xs">
                      <span>{t('scenarios:edit_aggregation.filter_field_label')}</span>
                      <MenuRoot>
                        <MenuButton
                          disabled={!tableName}
                          render={
                            <div
                              className={clsx(
                                'text-s aria-disabled:bg-grey-98 text-grey-00 flex h-10 items-center justify-between rounded border px-2',
                                {
                                  'border-grey-90': !hasFilteredFieldError,
                                  'border-red-47': hasFilteredFieldError,
                                },
                              )}
                            />
                          }
                        >
                          {filter.filteredField?.fieldName}
                          <Icon icon="arrow-2-down" className="size-5" />
                        </MenuButton>
                        {tableName && options ? (
                          <EditDataModelFieldTableMenu
                            tableName={tableName}
                            onChange={(filteredField) => {
                              onFilterChange({ filteredField }, filterIndex);
                            }}
                            fields={options}
                          />
                        ) : null}
                      </MenuRoot>
                      <span>{t('scenarios:edit_aggregation.filter_operator_label')}</span>
                      <Operator
                        isFilter
                        value={
                          filter.operator && isAggregationFilterOperator(filter.operator)
                            ? filter.operator
                            : undefined
                        }
                        setValue={(operator) => onFilterChange({ operator }, filterIndex)}
                        validationStatus={filter.errors.operator.length > 0 ? 'error' : 'valid'}
                        operators={aggregationFilterOperators}
                      />
                      {binaryFilter && filter.operator ? (
                        <>
                          <span>{t('scenarios:edit_aggregation.filter_value_label')}</span>
                          <FilterValue
                            filterValue={filter.value.astNode}
                            onSave={(astNode) =>
                              onFilterChange({ value: { astNode } }, filterIndex)
                            }
                            astNodeErrors={filter.value.astNodeErrors}
                            validationStatus={filter.errors.value.length > 0 ? 'error' : 'valid'}
                          />
                        </>
                      ) : null}
                    </div>
                    <RemoveButton onClick={() => removeFilter(filterIndex)} />
                  </div>
                  <EvaluationErrors
                    errors={adaptEvaluationErrorViewModels([
                      ...filter.errors.filter,
                      ...filter.errors.filteredField,
                    ]).map(getNodeEvaluationErrorMessage)}
                  />
                </div>
                {!isLastFilter ? (
                  <div className="text-grey-50 text-xs">{t('scenarios:logical_operator.and')}</div>
                ) : null}
              </Fragment>
            );
          })}
        </div>
      ) : null}
      <div className="flex flex-row justify-start gap-2">
        <MenuRoot>
          <MenuButton
            disabled={!tableName}
            render={<Button className="h-fit" variant="secondary" disabled={!tableName} />}
          >
            <Icon icon="plus" className="size-6" />
            {t('scenarios:edit_aggregation.add_filter')}
          </MenuButton>
          {tableName && options ? (
            <EditDataModelFieldTableMenu
              tableName={tableName}
              fields={options}
              onChange={addNewFilter}
            />
          ) : null}
        </MenuRoot>
        {value.length === 0 ? (
          <Callout>{t('scenarios:edit_aggregation.add_filter.callout')}</Callout>
        ) : null}
      </div>
    </div>
  );
}

function FilterValue({
  filterValue,
  astNodeErrors,
  validationStatus,
  onSave,
}: {
  filterValue: AstNode;
  astNodeErrors?: AstNodeErrors;
  validationStatus: ValidationStatus;
  onSave: (astNode: AstNode) => void;
}) {
  // TODO: try to get enum values from the left operand
  const filterOptions = useOperandOptions([]).filter((opt) => opt.operandType !== 'Modeling');
  const coerceToConstant = useDefaultCoerceToConstant();
  const getAstNodeOperandProps = useGetAstNodeOperandProps();

  const astNodeOperandProps = useMemo(() => {
    return getAstNodeOperandProps(filterValue);
  }, [filterValue, getAstNodeOperandProps]);

  return (
    <Operand
      {...astNodeOperandProps}
      onSave={onSave}
      options={filterOptions}
      coerceToConstant={coerceToConstant}
      astNodeErrors={astNodeErrors}
      validationStatus={validationStatus}
    />
  );
}
