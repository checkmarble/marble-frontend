import { useGenerateRuleMutation } from '@app-builder/queries/scenarios/generate-rule';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface AiGenerateRuleProps {
  ruleId: string;
  onFormulaGenerated: (formula: any) => void;
}

export function AiGenerateRule({ ruleId, onFormulaGenerated }: AiGenerateRuleProps) {
  const { t } = useTranslation(['scenarios']);
  const [instruction, setInstruction] = useState('');
  const mutation = useGenerateRuleMutation(ruleId);

  const handleGenerate = async () => {
    try {
      const result = await mutation.mutateAsync(instruction);

      // Apply the generated formula regardless of validation status
      if (result.rule_ast) {
        onFormulaGenerated(result.rule_ast);
        setInstruction('');
      }

      // Show validation errors if any
      if (!result.validation.is_valid && result.validation.errors.length > 0) {
        console.warn('Generated rule has validation errors:', result.validation.errors);
        // TODO: Show toast with errors for now
        alert(`Generated rule has errors:\n${result.validation.errors.join('\n')}`);
      }
    } catch (error) {
      alert(`Error generating rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-surface-card border-grey-border rounded-md border p-4 max-w-2xl">
      <h3 className="text-s font-medium mb-3">{t('scenarios:ai_generate_rule.title', 'Generate with AI')}</h3>

      <div className="flex flex-col gap-2">
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.currentTarget.value)}
          placeholder={t('scenarios:ai_generate_rule.placeholder', 'Describe what rule you want to create...')}
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
              Generating...
            </>
          ) : (
            <>
              <Icon icon="wand" className="size-4" aria-hidden />
              Generate Rule
            </>
          )}
        </Button>

        {mutation.data?.validation && (
          <div className="mt-3 p-3 bg-grey-background rounded text-sm">
            <div className="font-medium mb-2">
              {mutation.data.validation.is_valid ? '✓ Valid' : '⚠️ Validation Issues'}
            </div>
            {mutation.data.validation.errors.length > 0 && (
              <div className="text-red-600">
                <div className="font-medium">Errors:</div>
                <ul className="list-disc pl-4">
                  {mutation.data.validation.errors.map((err, i) => (
                    <li key={i} className="text-xs">
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {mutation.data.validation.warnings.length > 0 && (
              <div className="text-yellow-600 mt-2">
                <div className="font-medium">Warnings:</div>
                <ul className="list-disc pl-4">
                  {mutation.data.validation.warnings.map((warn, i) => (
                    <li key={i} className="text-xs">
                      {warn}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
