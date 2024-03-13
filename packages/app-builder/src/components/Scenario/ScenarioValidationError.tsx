import { type EvaluationError } from '@app-builder/models';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import clsx from 'clsx';
import type React from 'react';

export function ScenarioValidationError({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        'bg-red-05 text-s flex h-8 items-center justify-center rounded px-2 py-1 font-medium text-red-100',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EvaluationErrors({
  evaluationErrors,
  className,
}: {
  evaluationErrors: EvaluationError[];
  className?: string;
}) {
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();
  if (evaluationErrors.length === 0) return null;

  const errors = adaptEvaluationErrorViewModels(evaluationErrors).map((error) =>
    getNodeEvaluationErrorMessage(error),
  );
  return (
    <div className={clsx('flex flex-row flex-wrap gap-2', className)}>
      {errors.map((error) => (
        <ScenarioValidationError key={error}>{error}</ScenarioValidationError>
      ))}
    </div>
  );
}
