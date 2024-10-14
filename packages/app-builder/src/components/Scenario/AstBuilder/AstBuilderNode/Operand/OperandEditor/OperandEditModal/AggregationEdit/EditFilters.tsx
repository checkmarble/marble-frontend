import { Callout } from '@app-builder/components';
import { scenarioI18n } from '@app-builder/components/Scenario';
import { RemoveButton } from '@app-builder/components/Scenario/AstBuilder/RemoveButton';
import { LogicalOperatorLabel } from '@app-builder/components/Scenario/AstBuilder/RootAstBuilderNode/LogicalOperator';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import {
  adaptAstNodeViewModel,
  type AstNodeViewModel,
} from '@app-builder/models/ast-node-view-model';
import {
  filterOperators,
  isFilterOperator,
} from '@app-builder/models/editable-operators';
import {
  useGetAstNodeOption,
  useOperandOptions,
} from '@app-builder/services/editor/options';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import { getValidationStatus } from '@app-builder/services/validation/ast-node-validation';
import clsx from 'clsx';
import { useMemo } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { Operator } from '../../../../Operator';
import { Operand } from '../../../Operand';
import { type FilterViewModel } from './AggregationEdit';
import { type DataModelField, EditDataModelField } from './EditDataModelField';

const newFilterValidation = () => ({
  filter: [],
  filteredField: [],
  operator: [],
  value: [],
});

export function EditFilters({
  aggregatedField,
  dataModelFieldOptions,
  onChange,
  value,
}: {
  aggregatedField: DataModelField | null;
  dataModelFieldOptions: DataModelField[];
  onChange: (value: FilterViewModel[]) => void;
  value: FilterViewModel[];
}) {
  const { t } = useTranslation(scenarioI18n);

  const filteredDataModalFieldOptions = aggregatedField?.tableName
    ? dataModelFieldOptions.filter(
        ({ tableName }) => tableName == aggregatedField?.tableName,
      )
    : dataModelFieldOptions;

  const onFilterChange = (
    newFieldValue: Partial<FilterViewModel>,
    filterIndex: number,
  ): void => {
    onChange(
      value.map((filter, index) =>
        index === filterIndex
          ? {
              ...filter,
              ...newFieldValue,
              validation: newFilterValidation(),
            }
          : filter,
      ),
    );
  };

  const addNewFilter = () => {
    onChange([
      ...value,
      {
        operator: null,
        filteredField: null,
        value: adaptAstNodeViewModel({ ast: NewUndefinedAstNode() }),
        errors: newFilterValidation(),
      },
    ]);
  };

  const removeFilter = (filterIndex: number) => {
    onChange(value.filter((_, index) => index !== filterIndex));
  };

  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();

  return (
    <div>
      <div className="grid grid-cols-[8px_16px_max-content_1fr_max-content]">
        {value.map((filter, filterIndex) => {
          const isFirstCondition = filterIndex === 0;
          const isLastCondition = filterIndex === value.length - 1;
          return (
            <Fragment key={filterIndex}>
              {/* Row 1 */}
              <div
                className={clsx(
                  'border-grey-10 col-span-5 w-2 border-r',
                  isFirstCondition ? 'h-4' : 'h-2',
                )}
              />

              {/* Row 2 */}
              <div
                className={clsx(
                  'border-grey-10 col-start-1 border-r',
                  isLastCondition && 'h-5',
                )}
              />
              <div className="border-grey-10 col-start-2 h-5 border-b" />
              <LogicalOperatorLabel
                operator={isFirstCondition ? 'where' : 'and'}
                type="contained"
              />
              <div className="col-start-4 flex flex-col gap-2 px-2">
                <div className="flex flex-row items-center gap-2">
                  <EditDataModelField
                    placeholder={t('scenarios:edit_aggregation.select_a_field')}
                    value={filter.filteredField}
                    options={filteredDataModalFieldOptions}
                    onChange={(filteredField) =>
                      onFilterChange({ filteredField }, filterIndex)
                    }
                    errors={filter.errors.filteredField}
                  />
                  <Operator
                    value={
                      filter.operator && isFilterOperator(filter.operator)
                        ? filter.operator
                        : undefined
                    }
                    setValue={(operator) =>
                      onFilterChange({ operator }, filterIndex)
                    }
                    validationStatus={
                      filter.errors.operator.length > 0 ? 'error' : 'valid'
                    }
                    operators={filterOperators}
                  />
                  <FilterValue
                    filterValue={filter.value}
                    onSave={(astNode) =>
                      onFilterChange(
                        { value: adaptAstNodeViewModel({ ast: astNode }) },
                        filterIndex,
                      )
                    }
                  />
                </div>
                <EvaluationErrors
                  errors={adaptEvaluationErrorViewModels([
                    ...filter.errors.filter,
                    ...filter.errors.value,
                  ]).map(getNodeEvaluationErrorMessage)}
                />
              </div>
              <div className="col-start-5 flex h-10 flex-col items-center justify-center">
                <RemoveButton onClick={() => removeFilter(filterIndex)} />
              </div>
            </Fragment>
          );
        })}
      </div>
      <div className="my-4 flex flex-row justify-start gap-2">
        <Button className="h-fit" onClick={addNewFilter}>
          <Icon icon="plus" className="size-6" />
          {t('scenarios:edit_aggregation.add_filter')}
        </Button>
        <Callout>{t('scenarios:edit_aggregation.add_filter.callout')}</Callout>
      </div>
    </div>
  );
}

function FilterValue({
  filterValue,
  onSave,
}: {
  filterValue: AstNodeViewModel;
  onSave: (astNode: AstNode) => void;
}) {
  const filterOptions = useOperandOptions(filterValue);
  const getAstNodeOption = useGetAstNodeOption();

  const operandProps = useMemo(() => {
    return {
      ...getAstNodeOption(filterValue),
      validationStatus: getValidationStatus(filterValue),
    };
  }, [filterValue, getAstNodeOption]);

  return <Operand {...operandProps} onSave={onSave} options={filterOptions} />;
}
