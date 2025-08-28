import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeleteRuleMutation } from '@app-builder/queries/scenarios/delete-rule';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DeleteRule({
  ruleId,
  scenarioId,
  iterationId,
  children,
}: {
  ruleId: string;
  scenarioId: string;
  iterationId: string;
  children: React.ReactElement;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const deleteRuleMutation = useDeleteRuleMutation(scenarioId, iterationId);
  const revalidate = useLoaderRevalidator();

  const handleDeleteRule = () => {
    deleteRuleMutation.mutateAsync({ ruleId }).then(() => {
      revalidate();
    });
  };

  return (
    <ModalV2.Root>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content>
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <div className="bg-red-95 mb-6 box-border rounded-[90px] p-4">
              <Icon icon="delete" className="text-red-47 size-16" />
            </div>
            <h1 className="text-l font-semibold">{t('scenarios:delete_rule.title')}</h1>
            <p className="text-center">{t('scenarios:delete_rule.content')}</p>
          </div>
          <div className="flex flex-1 flex-row gap-2">
            <ModalV2.Close render={<Button className="flex-1" variant="secondary" />}>
              {t('common:cancel')}
            </ModalV2.Close>
            <Button
              color="red"
              className="flex-1"
              variant="primary"
              type="button"
              onClick={handleDeleteRule}
              disabled={deleteRuleMutation.isPending}
            >
              <Icon icon="delete" className="size-6" />
              {t('common:delete')}
            </Button>
          </div>
        </div>
      </ModalV2.Content>
    </ModalV2.Root>
  );
}
