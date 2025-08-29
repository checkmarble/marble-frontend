import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useCreateRuleMutation } from '@app-builder/queries/scenarios/create-rule';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateRule({
  scenarioId,
  iterationId,
}: {
  scenarioId: string;
  iterationId: string;
}) {
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
      variant="tertiary"
      size="dropdown"
      disabled={createRuleMutation.isPending}
      className="w-full gap-2"
      onClick={handleCreateRule}
    >
      <Icon icon="plus" className="text-grey-00 size-5" />
      <div className="flex w-full flex-col items-start">
        <span className="text-grey-00 font-normal">{t('scenarios:create_rule.title')}</span>
        <span className="text-s text-grey-50 font-normal">
          {t('scenarios:create_rule.description')}
        </span>
      </div>
    </Button>
  );
}
