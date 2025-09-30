import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeleteScreeningRuleMutation } from '@app-builder/queries/scenarios/delete-screening-rule';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DeleteScreeningRule({
  scenarioId,
  iterationId,
  screeningId,
  children,
}: {
  scenarioId: string;
  iterationId: string;
  screeningId: string;
  children: React.ReactElement;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const deleteScreeningRuleMutation = useDeleteScreeningRuleMutation(scenarioId, iterationId);
  const revalidate = useLoaderRevalidator();

  const handleDeleteScreeningRule = () => {
    deleteScreeningRuleMutation.mutateAsync(screeningId).then(() => {
      revalidate();
    });
  };

  return (
    <Modal.Root>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <div className="bg-red-95 mb-6 box-border rounded-[90px] p-4">
              <Icon icon="delete" className="text-red-47 size-16" />
            </div>
            <h1 className="text-l font-semibold">{t('scenarios:delete_sanction.title')}</h1>
            <p className="text-center">{t('scenarios:delete_sanction.content')}</p>
          </div>
          <div className="flex flex-1 flex-row gap-2">
            <Modal.Close asChild>
              <Button className="flex-1" variant="secondary">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button
              color="red"
              variant="primary"
              className="flex-1"
              type="button"
              name="delete"
              onClick={handleDeleteScreeningRule}
              disabled={deleteScreeningRuleMutation.isPending}
            >
              <Icon icon="delete" className="size-6" />
              {t('common:delete')}
            </Button>
          </div>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
