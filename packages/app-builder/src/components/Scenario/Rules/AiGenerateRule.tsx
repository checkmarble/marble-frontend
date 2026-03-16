import { useGenerateRuleMutation } from '@app-builder/queries/scenarios/generate-rule';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface AiGenerateRuleProps {
  ruleId: string;
  onFormulaGenerated: () => void;
}

export function AiGenerateRule({ ruleId, onFormulaGenerated }: AiGenerateRuleProps) {
  const { t } = useTranslation(['scenarios']);
  const [instruction, setInstruction] = useState('');
  const mutation = useGenerateRuleMutation(ruleId);

  const handleGenerate = async () => {
    try {
      await mutation.mutateAsync({ instruction });
      setInstruction('');
      onFormulaGenerated();
    } catch {
      toast.error(t('scenarios:rules.ai_generate.error_generating'));
    }
  };

  return (
    <div className="bg-surface-card border-grey-border rounded-md border p-4 max-w-2xl">
      <h3 className="text-s font-medium mb-3">{t('scenarios:rules.ai_generate.title')}</h3>

      <div className="flex flex-col gap-3">
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.currentTarget.value)}
          placeholder={t('scenarios:rules.ai_generate.placeholder')}
          disabled={mutation.isPending}
          className="form-textarea text-grey-primary text-s w-full resize-none border-none bg-transparent font-medium outline-hidden"
          rows={3}
        />

        <Button
          onClick={handleGenerate}
          disabled={!instruction.trim() || mutation.isPending}
          variant="primary"
          size="small"
        >
          {mutation.isPending ? (
            <>
              <Icon icon="spinner" className="size-4 animate-spin" aria-hidden />
              {t('scenarios:rules.ai_generate.generating')}
            </>
          ) : (
            <>
              <Icon icon="wand" className="size-4" aria-hidden />
              {t('scenarios:rules.ai_generate.generate_button')}
            </>
          )}
        </Button>

        {mutation.isPending ? (
          <div className="bg-grey-background text-grey-secondary animate-pulse rounded p-3 text-xs">
            {t('scenarios:rules.ai_generate.generating')}
          </div>
        ) : null}
      </div>
    </div>
  );
}
