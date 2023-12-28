import { scenarioI18n } from '@app-builder/components/Scenario';
import { ScenarioValidationError } from '@app-builder/components/Scenario/ScenarioValidationError';
import { NewUndefinedAstNode } from '@app-builder/models';
import {
  adaptEditorNodeViewModel,
  type AstBuilder,
} from '@app-builder/services/editor/ast-editor';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { ErrorMessage } from '../../ErrorMessage';
import { RemoveButton } from '../../RemoveButton';
import { Operand } from '../Operand';
import { type DataModelField, EditDataModelField } from './EditDataModelField';
import { FilterOperatorSelect } from './FilterOperatorSelect';
import { type FilterViewModel } from './Modal';

const newFilterValidation = () => ({
  filter: [],
  filteredField: [],
  operator: [],
  value: [],
});

export const EditFilters = ({
  aggregatedField,
  builder,
  dataModelFieldOptions,
  onChange,
  value,
}: {
  aggregatedField: DataModelField | null;
  builder: AstBuilder;
  dataModelFieldOptions: DataModelField[];
  onChange: (value: FilterViewModel[]) => void;
  value: FilterViewModel[];
}) => {
  const { t } = useTranslation(scenarioI18n);
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();

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
        value: adaptEditorNodeViewModel({ ast: NewUndefinedAstNode() }),
        errors: newFilterValidation(),
      },
    ]);
  };

  const removeFilter = (filterIndex: number) => {
    onChange(value.filter((_, index) => index !== filterIndex));
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        {value.map((filter, filterIndex) => {
          const valueErrorMessages = adaptEvaluationErrorViewModels(
            filter.value.errors,
          ).map((error) => getNodeEvaluationErrorMessage(error));
          return (
            <div key={filterIndex}>
              <div className="flex flex-row items-center gap-2">
                <span className="text-grey-50 text-xs">
                  {t('scenarios:edit_aggregation.filter_and')}
                </span>
                <div className="flex flex-1 flex-row items-center gap-2">
                  <EditDataModelField
                    placeholder={t('scenarios:edit_aggregation.select_a_field')}
                    defaultOpen
                    value={filter.filteredField}
                    options={filteredDataModalFieldOptions}
                    onChange={(filteredField) =>
                      onFilterChange({ filteredField }, filterIndex)
                    }
                    errors={filter.errors.filteredField}
                  />

                  <FilterOperatorSelect
                    value={filter.operator}
                    onChange={(operator) =>
                      onFilterChange({ operator }, filterIndex)
                    }
                    errors={filter.errors.operator}
                  />
                  <Operand
                    builder={builder}
                    operandViewModel={filter.value}
                    onSave={(astNode) =>
                      onFilterChange(
                        { value: adaptEditorNodeViewModel({ ast: astNode }) },
                        filterIndex,
                      )
                    }
                  />
                </div>
                <RemoveButton onClick={() => removeFilter(filterIndex)} />
              </div>
              {filter.errors.filter.length > 0 ? (
                <ErrorMessage errors={filter.errors.filter} />
              ) : null}
              <div className="mt-2 flex flex-row flex-wrap gap-2">
                {valueErrorMessages.map((error) => (
                  <ScenarioValidationError key={error}>
                    {error}
                  </ScenarioValidationError>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Button className="my-2" onClick={addNewFilter}>
        <Icon icon="plus" className="h-6 w-6" />
        {t('scenarios:edit_aggregation.add_filter')}
      </Button>
    </div>
  );
};
