import {
  adaptEvaluationErrorViewModels,
  commonErrorMessages,
} from '@app-builder/services/validation';
import { computed } from '@preact/signals-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';

import { AstBuilderNodeSharpFactory } from './node-store';

export const EditionEvaluationErrors = memo(function EditionEvaluationErrors({
  direct,
  id,
  className,
}: {
  direct?: boolean;
  id: string;
  className?: string;
}) {
  const { t } = useTranslation(['scenarios']);
  const evaluation = AstBuilderNodeSharpFactory.select((s) => s.evaluation);
  const errors = computed(() => {
    return evaluation
      .filter((row) => (direct ? row.nodeId === id : row.relatedIds.includes(id)))
      .flatMap((row) => row.errors);
  });
  const errorModels = adaptEvaluationErrorViewModels(errors.value);
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
EditionEvaluationErrors.displayName = 'EditionEvaluationErrors';
