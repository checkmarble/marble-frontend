import { type AstNode } from '@app-builder/models';
import { useGenerateRuleMutation } from '@app-builder/queries/scenarios/generate-rule';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Card, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { type AiRuleCatalogInfo, AiRuleCatalogSelect } from './AiRuleCatalogSelect';

interface AiGenerateRuleProps {
  scenarioId: string;
  ruleId: string;
  estimatedGenerationDurationMs: number;
  onFormulaGenerated: (ruleAst: AstNode, catalogInfo?: AiRuleCatalogInfo) => void;
}

export function AiGenerateRule({
  scenarioId,
  ruleId,
  estimatedGenerationDurationMs,
  onFormulaGenerated,
}: AiGenerateRuleProps) {
  const { t } = useTranslation(['scenarios', 'common']);
  const mutation = useGenerateRuleMutation(scenarioId);

  const handleGenerate = async (instruction: string, catalogInfo?: AiRuleCatalogInfo) => {
    const result = await mutation.mutateAsync({ ruleId, instruction }).catch(() => null);
    if (result === null || !result.success) {
      toast.error(t('scenarios:rules.ai_generate.error_generating'));
      return;
    }
    if (result.ruleAst) {
      onFormulaGenerated(result.ruleAst, catalogInfo);
    }
  };

  return (
    <Card>
      <Typo variant="subtitle1" className="text-s font-medium mb-md flex gap-xs items-center">
        <Icon icon="ai-stars" className="size-6 text-purple-primary" />
        {t('scenarios:rules.ai_generate.title')}
      </Typo>

      <div className="flex flex-col gap-md">
        <AiRuleCatalogSelect
          disabled={mutation.isPending}
          isGenerating={mutation.isPending}
          onSelect={handleGenerate}
        />
        {mutation.isPending ? <GenerationProgress estimatedDurationMs={estimatedGenerationDurationMs} /> : null}
      </div>
    </Card>
  );
}

function GenerationProgress({ estimatedDurationMs }: { estimatedDurationMs: number }) {
  const { t } = useTranslation(['scenarios']);
  const [progress, setProgress] = useState(0);
  const seconds = Math.ceil(estimatedDurationMs / 1000);

  useEffect(() => {
    const startedAt = performance.now();
    const updateProgress = () => {
      const elapsed = performance.now() - startedAt;
      const normalizedElapsed = elapsed / Math.max(estimatedDurationMs, 1);
      const logarithmicProgress = Math.log1p(7 * normalizedElapsed);
      setProgress(Math.min(95, 95 * (logarithmicProgress / Math.log1p(7))));
    };

    updateProgress();
    const interval = window.setInterval(updateProgress, 250);
    return () => window.clearInterval(interval);
  }, [estimatedDurationMs]);

  const label = t('scenarios:rules.ai_generate.estimated_duration', { seconds });

  return (
    <div className="flex flex-wrap items-center gap-sm">
      <span className="text-small text-purple-primary font-medium">{label}</span>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        className="h-2 w-28 max-w-full overflow-hidden rounded-full relative"
      >
        <div className="bg-purple-background-light border-purple-border-light h-full w-full border rounded-full" />
        <div
          className="absolute inset-s-0 top-0 bg-purple-primary h-full rounded-full transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
