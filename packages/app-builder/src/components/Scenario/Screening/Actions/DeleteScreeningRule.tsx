import { useDeleteScreeningRuleMutation } from '@app-builder/queries/scenarios/delete-screening-rule';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

export function DeleteScreeningRule({
  scenarioId,
  iterationId,
  screeningId,
  children,
  onDeleteSuccess,
}: {
  scenarioId: string;
  iterationId: string;
  screeningId: string;
  children: React.ReactElement;
  onDeleteSuccess: () => void;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const deleteScreeningRuleMutation = useDeleteScreeningRuleMutation(scenarioId, iterationId);

  const handleDeleteScreeningRule = () => {
    deleteScreeningRuleMutation.mutateAsync(screeningId).then(() => {
      onDeleteSuccess();
    });
  };

  return (
    <Modal.Root>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('scenarios:delete_sanction.title')}</Modal.Title>
        <div className="flex flex-col gap-lg p-lg">
          <p>{t('scenarios:delete_sanction.content')}</p>
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} />
          <Modal.FooterButton
            label={t('common:delete')}
            variant="destructive"
            onClick={handleDeleteScreeningRule}
            isLoading={deleteScreeningRuleMutation.isPending}
            leadingIcon="delete"
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
