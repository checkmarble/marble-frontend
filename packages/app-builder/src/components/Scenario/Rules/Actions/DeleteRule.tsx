import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeleteRuleMutation } from '@app-builder/queries/scenarios/delete-rule';
import { useTranslation } from 'react-i18next';
import { Modal, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DeleteRule({
  ruleId,
  scenarioId,
  iterationId,
  children,
  open,
  onOpenChange,
}: {
  ruleId: string;
  scenarioId: string;
  iterationId: string;
  children?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      {children ? <Modal.Trigger asChild>{children}</Modal.Trigger> : null}
      <Modal.Content>
        <div className="flex flex-col gap-lg p-lg">
          <div className="flex flex-1 flex-col items-center justify-center gap-sm">
            <div className="bg-red-background mb-lg box-border rounded-[90px] p-md">
              <Icon icon="delete" className="text-red-primary size-16" />
            </div>
            <Typo variant="title1">{t('scenarios:delete_rule.title')}</Typo>
            <p className="text-center">{t('scenarios:delete_rule.content')}</p>
          </div>
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} />
          <Modal.FooterButton
            label={t('common:delete')}
            variant="destructive"
            onClick={handleDeleteRule}
            isLoading={deleteRuleMutation.isPending}
            leadingIcon="delete"
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
