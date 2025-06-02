import type { FlatNodeEvaluation } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/validate-ast';
import {
  adaptEvaluationErrorViewModels,
  commonErrorMessages,
} from '@app-builder/services/validation';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';

export const ViewingEvaluationErrors = memo(function ViewingEvaluationErrors({
  direct,
  id,
  className,
  evaluation,
}: {
  direct?: boolean;
  id: string;
  className?: string;
  evaluation: FlatNodeEvaluation;
}) {
  const { t } = useTranslation(['scenarios']);
  const errors = useMemo(() => {
    return evaluation
      .filter((row) => (direct ? row.nodeId === id : row.relatedIds.includes(id)))
      .flatMap((row) => row.errors);
  }, [evaluation, direct, id]);
  const errorModels = adaptEvaluationErrorViewModels(errors);
  const translateError = commonErrorMessages(t);

  if (errorModels.length === 0) return null;

  return (
    <div className={cn('flex flex-row flex-wrap gap-2', className)}>
      {errorModels.map((errorModel, i) => (
        <span
          key={i}
          className="bg-red-95 text-s text-red-47 flex h-8 items-center justify-center rounded px-2 py-1 font-medium"
        >
          {translateError(errorModel)}
        </span>
      ))}
    </div>
  );
});
ViewingEvaluationErrors.displayName = 'ViewingEvaluationErrors';
