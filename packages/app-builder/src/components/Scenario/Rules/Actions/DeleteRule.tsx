import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeleteRuleMutation } from '@app-builder/queries/scenarios/delete-rule';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
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
    <Modal.Root>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <div className="bg-red-background mb-6 box-border rounded-[90px] p-4">
              <Icon icon="delete" className="text-red-primary size-16" />
            </div>
            <h1 className="text-l font-semibold">{t('scenarios:delete_rule.title')}</h1>
            <p className="text-center">{t('scenarios:delete_rule.content')}</p>
          </div>
        </div>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" appearance="stroked">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            className="flex-1"
            variant="destructive"
            type="button"
            onClick={handleDeleteRule}
            disabled={deleteRuleMutation.isPending}
          >
            <Icon icon="delete" className="size-5" />
            {t('common:delete')}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
