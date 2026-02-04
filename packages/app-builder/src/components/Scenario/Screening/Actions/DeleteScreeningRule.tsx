import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeleteScreeningRuleMutation } from '@app-builder/queries/scenarios/delete-screening-rule';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Modal } from 'ui-design-system';
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
            <div className="bg-red-background mb-6 box-border rounded-[90px] p-4">
              <Icon icon="delete" className="text-red-primary size-16" />
            </div>
            <h1 className="text-l font-semibold">{t('scenarios:delete_sanction.title')}</h1>
            <p className="text-center">{t('scenarios:delete_sanction.content')}</p>
          </div>
        </div>
        <Modal.Footer>
          <Modal.Close asChild>
            <ButtonV2 className="flex-1" variant="secondary" appearance="stroked">
              {t('common:cancel')}
            </ButtonV2>
          </Modal.Close>
          <ButtonV2
            variant="destructive"
            className="flex-1"
            type="button"
            name="delete"
            onClick={handleDeleteScreeningRule}
            disabled={deleteScreeningRuleMutation.isPending}
          >
            <Icon icon="delete" className="size-5" />
            {t('common:delete')}
          </ButtonV2>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
