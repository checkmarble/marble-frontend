import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeleteScreeningRuleMutation } from '@app-builder/queries/scenarios/delete-screening-rule';
import { useTranslation } from 'react-i18next';
import { Modal, Typo } from 'ui-design-system';
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
            <Typo variant="title1">{t('scenarios:delete_sanction.title')}</Typo>
            <p className="text-center">{t('scenarios:delete_sanction.content')}</p>
          </div>
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
