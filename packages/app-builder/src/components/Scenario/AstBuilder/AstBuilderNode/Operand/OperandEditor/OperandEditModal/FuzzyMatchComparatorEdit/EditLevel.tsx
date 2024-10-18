import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import {
  type FuzzyMatchComparatorLevel,
  fuzzyMatchComparatorLevelData,
} from '@app-builder/models/fuzzy-match';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import { useTranslation } from 'react-i18next';
import { Select } from 'ui-design-system';

import { operatorContainerClassnames } from '../../../../Operator';

interface EditLevelProps {
  level: FuzzyMatchComparatorLevel;
  setLevel: (level: FuzzyMatchComparatorLevel) => void;
  errors: EvaluationError[];
}

export function EditLevel({ level, setLevel, errors }: EditLevelProps) {
  const { t } = useTranslation(['common', 'scenarios']);
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();

  return (
    <div className="flex flex-1 flex-col gap-2">
      <label htmlFor="level" className="text-m text-grey-100 font-normal">
        {t('scenarios:edit_fuzzy_match.level.label')}
      </label>
      <Select.Root value={level} onValueChange={setLevel}>
        <Select.Trigger
          id="level"
          className={operatorContainerClassnames({
            validationStatus: errors.length > 0 ? 'error' : 'valid',
          })}
        >
          <span className="text-s text-grey-100 w-full text-center font-medium">
            <Select.Value placeholder="..." />
          </span>
        </Select.Trigger>
        <Select.Content className="max-h-60">
          <Select.Viewport>
            {fuzzyMatchComparatorLevelData.map(({ level }) => {
              return (
                <Select.Item
                  className="min-w-[110px]"
                  key={level}
                  value={level}
                >
                  <Select.ItemText>
                    <span className="text-s text-grey-100 font-semibold uppercase">
                      {t(`scenarios:edit_fuzzy_match.level.${level}`, {
                        defaultValue: level,
                      })}
                    </span>
                  </Select.ItemText>
                </Select.Item>
              );
            })}
          </Select.Viewport>
        </Select.Content>
      </Select.Root>
      <EvaluationErrors
        errors={adaptEvaluationErrorViewModels(errors).map(
          getNodeEvaluationErrorMessage,
        )}
      />
    </div>
  );
}
