import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ReleaseMarkdown } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface VersionUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  version: string;
  releaseNotes: string;
  releaseUrl: string;
}

export const VersionUpdateModal: FunctionComponent<VersionUpdateModalProps> = ({
  open,
  onOpenChange,
  version,
  releaseNotes,
  releaseUrl,
}) => {
  const { t } = useTranslation(['common']);

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="xlarge" fixedHeight className="max-h-[80vh] flex flex-col">
        <Modal.Title className="flex items-center gap-sm border-b border-grey-border text-l font-semibold text-start">
          <Icon icon="speakerphone" className="size-8 shrink-0 text-purple-primary" />
          {t('common:version_update.title', { version })}
        </Modal.Title>

        <div className="flex-1 overflow-y-auto p-md">
          <ReleaseMarkdown>{releaseNotes}</ReleaseMarkdown>
        </div>

        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:understand')} onClick={() => onOpenChange(false)} />
          <Modal.FooterButton
            label={t('common:version_update.view_release')}
            onClick={() => window.open(releaseUrl, '_blank', 'noopener,noreferrer')}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
