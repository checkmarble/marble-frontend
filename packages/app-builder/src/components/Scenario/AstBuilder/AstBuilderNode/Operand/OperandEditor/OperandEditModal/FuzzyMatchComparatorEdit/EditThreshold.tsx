import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import { useTranslation } from 'react-i18next';
import { Input } from 'ui-design-system';

interface EditThresholdProps {
  threshold: number;
  setThreshold: (threshold: number) => void;
  errors: EvaluationError[];
}

export function EditThreshold({
  threshold,
  setThreshold,
  errors,
}: EditThresholdProps) {
  const { t } = useTranslation(['common', 'scenarios']);
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();

  return (
    <div className="flex flex-1 flex-col gap-2">
      <label htmlFor="threshold" className="text-m text-grey-100 font-normal">
        {t('scenarios:edit_fuzzy_match.threshold.label')}
      </label>
      <Input
        id="threshold"
        type="number"
        value={threshold}
        onChange={(e) => {
          const newThreshold = parseInt(e.target.value, 10);
          if (isNaN(newThreshold)) {
            setThreshold(0);
            return;
          }
          if (newThreshold < 0) {
            setThreshold(0);
            return;
          }
          if (newThreshold > 100) {
            setThreshold(100);
            return;
          }
          setThreshold(newThreshold);
        }}
        borderColor={errors.length > 0 ? 'red-100' : 'grey-10'}
        min={0}
        max={100}
      />
      <EvaluationErrors
        errors={adaptEvaluationErrorViewModels(errors).map(
          getNodeEvaluationErrorMessage,
        )}
      />
    </div>
  );
}
