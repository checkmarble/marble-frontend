import { useDeleteRuleMutation } from '@app-builder/queries/scenarios/delete-rule';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

export function DeleteRule({
  ruleId,
  scenarioId,
  iterationId,
  children,
  onDeleteSuccess,
}: {
  ruleId: string;
  scenarioId: string;
  iterationId: string;
  children?: React.ReactElement;
  onDeleteSuccess: () => void;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const deleteRuleMutation = useDeleteRuleMutation(scenarioId, iterationId);
  const [open, setOpen] = useState(false);

  const handleDeleteRule = () => {
    deleteRuleMutation.mutateAsync({ ruleId }).then(() => {
      setOpen(false);
      onDeleteSuccess();
      toast.success(t('scenarios:delete_rule.success'));
    });
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      {children ? <Modal.Trigger asChild>{children}</Modal.Trigger> : null}
      <Modal.Content>
        <Modal.Title>{t('scenarios:delete_rule.title')}</Modal.Title>
        <p className="text-center">{t('scenarios:delete_rule.content')}</p>
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
