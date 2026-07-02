import { useDuplicateRuleMutation } from '@app-builder/queries/scenarios/duplicate-rule';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

export function DuplicateRule({
  ruleId,
  scenarioId,
  iterationId,
  children,
  onDuplicateSuccess,
}: {
  ruleId: string;
  scenarioId: string;
  iterationId: string;
  children?: React.ReactElement;
  onDuplicateSuccess: (ruleId: string) => void;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const duplicateRuleMutation = useDuplicateRuleMutation(scenarioId, iterationId);
  const [open, setOpen] = useState(false);

  const handleDuplicateRule = () => {
    duplicateRuleMutation.mutateAsync({ ruleId }).then((rule) => {
      setOpen(false);
      onDuplicateSuccess(rule.id);
      toast.success(t('scenarios:duplicate_rule.success'));
    });
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      {children ? <Modal.Trigger asChild>{children}</Modal.Trigger> : null}
      <Modal.Content>
        <Modal.Title>{t('scenarios:clone_rule.title')}</Modal.Title>
        <div className="flex flex-col gap-lg p-lg">
          <p>{t('scenarios:clone_rule.content')}</p>
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} />
          <Modal.FooterButton
            label={t('scenarios:clone_rule.confirmation_button')}
            onClick={handleDuplicateRule}
            isLoading={duplicateRuleMutation.isPending}
            leadingIcon="copy"
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
