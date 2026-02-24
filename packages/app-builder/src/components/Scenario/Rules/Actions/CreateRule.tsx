import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useCreateRuleMutation } from '@app-builder/queries/scenarios/create-rule';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateRule({ scenarioId, iterationId }: { scenarioId: string; iterationId: string }) {
  const { t } = useTranslation(['scenarios']);
  const createRuleMutation = useCreateRuleMutation(scenarioId, iterationId);
  const revalidate = useLoaderRevalidator();

  const handleCreateRule = () => {
    createRuleMutation.mutateAsync().then(() => {
      revalidate();
    });
  };

  return (
    <Button
      variant="secondary"
      appearance="link"
      disabled={createRuleMutation.isPending}
      className="w-full gap-2"
      onClick={handleCreateRule}
    >
      <div className="flex items-center gap-4">
        <Icon icon="plus" className="size-5" />
        <span className="font-normal">{t('scenarios:create_rule.title')}</span>
      </div>
    </Button>
  );
}
