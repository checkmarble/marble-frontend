import { type EvaluationErrorCode } from '@app-builder/models/node-evaluation';
import {
  adaptEvaluationErrorViewModels,
  commonErrorMessages,
} from '@app-builder/services/validation';
import { computed } from '@preact/signals-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { cn } from 'ui-design-system';

import { AstBuilderNodeSharpFactory } from './node-store';

type EditionEvaluationErrorsProps = {
  direct?: boolean;
  id: string;
  className?: string;
  filterOut?: EvaluationErrorCode[];
};
export const EditionEvaluationErrors = memo(function (props: EditionEvaluationErrorsProps) {
  const { t } = useTranslation(['scenarios']);
  const nodeSharp = AstBuilderNodeSharpFactory.useOptionalSharp();
  const evaluation = nodeSharp?.select((s) => s.validation.evaluation);

  const errors = computed(() => {
    if (!evaluation) return [];
    return R.pipe(
      evaluation,
      R.filter((row) =>
        props.direct ? row.nodeId === props.id : row.relatedIds.includes(props.id),
      ),
      R.flatMap((row) => row.errors),
      R.filter((err) => !(props.filterOut ?? []).includes(err.error)),
    );
  });
  const errorModels = adaptEvaluationErrorViewModels(errors.value);
  const translateError = commonErrorMessages(t);

  if (errorModels.length === 0) return null;

  return (
    <div className={cn('flex flex-row flex-wrap gap-2', props.className)}>
      {errorModels.map((errorModel, i) => (
        <span
          key={i}
          className="bg-red-95 text-s text-red-47 flex h-8 items-center justify-center rounded-sm px-2 py-1 font-medium"
        >
          {translateError(errorModel)}
        </span>
      ))}
    </div>
  );
});
EditionEvaluationErrors.displayName = 'EditionEvaluationErrors';
