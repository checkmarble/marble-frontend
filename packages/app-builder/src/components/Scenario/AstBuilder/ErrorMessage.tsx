import { type EvaluationError } from '@app-builder/models/node-evaluation';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';

export interface ErrorMessageProps {
  errors?: EvaluationError[];
}

/**
 * @deprecated Use ScenarioValidationError instead
 */
export function ErrorMessage({ errors }: ErrorMessageProps) {
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();

  const firstError = errors?.[0];

  return (
    <p className="text-s font-medium text-red-100 transition-opacity duration-200 ease-in-out">
      {firstError
        ? getNodeEvaluationErrorMessage(
            // glitch for ISO compatibility with former code
            adaptEvaluationErrorViewModels([firstError])[0],
          )
        : null}
    </p>
  );
}
