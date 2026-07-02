import { useCreateRuleMutation } from '@app-builder/queries/scenarios/create-rule';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateRule({
  scenarioId,
  iterationId,
  onSuccess,
}: {
  scenarioId: string;
  iterationId: string;
  onSuccess: (ruleId: string) => void;
}) {
  const { t } = useTranslation(['scenarios']);
  const createRuleMutation = useCreateRuleMutation(scenarioId, iterationId);

  const handleCreateRule = () => {
    createRuleMutation.mutateAsync().then((rule) => {
      onSuccess(rule.id);
    });
  };

  return (
    <Button
      variant="secondary"
      appearance="link"
      disabled={createRuleMutation.isPending}
      className="w-full gap-sm"
      onClick={handleCreateRule}
    >
      <div className="flex items-center gap-md">
        <Icon icon="plus" className="size-5" />
        <span className="font-normal">{t('scenarios:create_rule.title')}</span>
      </div>
    </Button>
  );
}
