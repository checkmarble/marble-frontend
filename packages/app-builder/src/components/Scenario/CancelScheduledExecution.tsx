import { CalloutV2 } from '@app-builder/components';
import { useCancelScheduledExecutionMutation } from '@app-builder/queries/decisions/cancel-scheduled-execution';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

export function CancelScheduledExecution({
  children,
  scheduledExecutionId,
}: {
  children: React.ReactElement;
  scheduledExecutionId: string;
}) {
  const [open, setOpen] = useState(false);
  const cancelScheduledExecutionMutation = useCancelScheduledExecutionMutation(scheduledExecutionId);
  const { t } = useTranslation(['scenarios', 'common']);

  const handleCancel = () => {
    cancelScheduledExecutionMutation
      .mutateAsync()
      .then(() => {
        setOpen(false);
      })
      .catch(() => {
        toast.error(t('common:errors.unknown'));
      });
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content className="overflow-visible">
        <Modal.Title>{t('scenarios:scheduled_execution.cancel')}</Modal.Title>
        <Modal.Description asChild>
          <CalloutV2 className="m-sm">
            <p className="whitespace-pre-wrap">{t('scenarios:scheduled_execution.cancel.callout')}</p>
          </CalloutV2>
        </Modal.Description>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} />
          <Modal.FooterButton
            variant="destructive"
            label={t('scenarios:scheduled_execution.cancel')}
            onClick={handleCancel}
            isLoading={cancelScheduledExecutionMutation.isPending}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
