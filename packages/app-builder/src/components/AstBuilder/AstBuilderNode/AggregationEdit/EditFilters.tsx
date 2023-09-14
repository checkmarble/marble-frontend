import { scenarioI18n } from '@app-builder/components/Scenario';
import { NewPendingValidation, NewUndefinedAstNode } from '@app-builder/models';
import {
  adaptEditorNodeViewModel,
  type AstBuilder,
} from '@app-builder/services/editor/ast-editor';
import { Button } from '@ui-design-system';
import { Plus } from '@ui-icons';
import { useTranslation } from 'react-i18next';

import { RemoveButton } from '../../../Edit/RemoveButton';
import { ErrorMessage } from '../../ErrorMessage';
import { Operand } from '../Operand';
import { type DataModelField, EditDataModelField } from './EditDataModelField';
import { FilterOperatorSelect } from './FilterOperatorSelect';
import { type FilterViewModel } from './Modal';

const newFilterValidation = () => ({
  filter: NewPendingValidation(),
  filteredField: NewPendingValidation(),
  operator: NewPendingValidation(),
  value: NewPendingValidation(),
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

  const filteredDataModalFieldOptions = aggregatedField?.tableName
    ? dataModelFieldOptions.filter(
        ({ tableName }) => tableName == aggregatedField?.tableName
      )
    : dataModelFieldOptions;

  const onFilterChange = (
    newFieldValue: Partial<FilterViewModel>,
    filterIndex: number
  ): void => {
    onChange(
      value.map((filter, index) =>
        index === filterIndex
          ? {
              ...filter,
              ...newFieldValue,
              validation: newFilterValidation(),
            }
          : filter
      )
    );
  };

  const addNewFilter = () => {
    onChange([
      ...value,
      {
        operator: null,
        filteredField: null,
        value: adaptEditorNodeViewModel({ ast: NewUndefinedAstNode() }),
        validation: newFilterValidation(),
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
          return (
            <div key={filterIndex}>
              <div className="flex flex-row items-center gap-1">
                <span className="text-grey-50 text-xs">
                  {t('scenarios:edit_aggregation.filter_and')}
                </span>
                <EditDataModelField
                  className="grow"
                  value={filter.filteredField}
                  options={filteredDataModalFieldOptions}
                  onChange={(filteredField) =>
                    onFilterChange({ filteredField }, filterIndex)
                  }
                  validation={filter.validation.filteredField}
                />

                <FilterOperatorSelect
                  value={filter.operator}
                  onChange={(operator) =>
                    onFilterChange({ operator }, filterIndex)
                  }
                  validation={filter.validation.operator}
                />

                <Operand
                  builder={builder}
                  operandViewModel={filter.value}
                  onSave={(astNode) =>
                    onFilterChange(
                      { value: adaptEditorNodeViewModel({ ast: astNode }) },
                      filterIndex
                    )
                  }
                />

                <RemoveButton onClick={() => removeFilter(filterIndex)} />
              </div>
              {filter.validation.filter.state === 'fail' && (
                <ErrorMessage errors={filter.validation.filter.errors} />
              )}
            </div>
          );
        })}
      </div>
      <Button className="my-2" onClick={addNewFilter}>
        <Plus width={'24px'} height={'24px'} />{' '}
        {t('scenarios:edit_aggregation.add_filter')}
      </Button>
    </div>
  );
};
