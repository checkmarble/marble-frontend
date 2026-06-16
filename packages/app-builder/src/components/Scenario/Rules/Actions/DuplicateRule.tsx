import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDuplicateRuleMutation } from '@app-builder/queries/scenarios/duplicate-rule';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DuplicateRule({
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
  const duplicateRuleMutation = useDuplicateRuleMutation(scenarioId, iterationId);
  const revalidate = useLoaderRevalidator();

  const handleDuplicateRule = () => {
    duplicateRuleMutation.mutateAsync({ ruleId }).then(() => {
      revalidate();
    });
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      {children ? <Modal.Trigger asChild>{children}</Modal.Trigger> : null}
      <Modal.Content>
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <div className="bg-purple-background mb-8 box-border rounded-[90px] p-4">
              <Icon icon="copy" className="text-purple-primary size-16" />
            </div>
            <Typo variant="title1">{t('scenarios:clone_rule.title')}</Typo>
            <p className="text-center">{t('scenarios:clone_rule.content')}</p>
          </div>
        </div>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button variant="secondary" appearance="stroked" size="large">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            variant="primary"
            type="button"
            onClick={handleDuplicateRule}
            disabled={duplicateRuleMutation.isPending}
            size="large"
          >
            <Icon icon="copy" className="size-5" />
            {t('scenarios:clone_rule.confirmation_button')}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
