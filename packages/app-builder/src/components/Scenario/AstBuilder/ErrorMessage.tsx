import { type EvaluationError } from '@app-builder/models';
import { useGetNodeEvaluationErrorMessage } from '@app-builder/services/validation';

export interface ErrorMessageProps {
  errors?: EvaluationError[];
}

export function ErrorMessage({ errors }: ErrorMessageProps) {
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();

  const firstError = errors?.[0];

  return (
    <p className="text-s font-medium text-red-100 transition-opacity duration-200 ease-in-out">
      {firstError && getNodeEvaluationErrorMessage(firstError)}
    </p>
  );
}
