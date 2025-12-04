import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Modal, ReleaseMarkdown } from 'ui-design-system';
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
        <div className="flex items-center gap-2 border-b border-grey-90 p-4">
          <Icon icon="speakerphone" className="size-8 shrink-0 text-purple-65" />
          <Modal.Title className="text-l font-semibold text-left !bg-transparent !border-none !p-0 !rounded-none">
            {t('common:version_update.title', { version })}
          </Modal.Title>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ReleaseMarkdown>{releaseNotes}</ReleaseMarkdown>
        </div>

        <Modal.Footer>
          <div className="flex items-center justify-end gap-2 p-4">
            <ButtonV2 appearance="stroked" onClick={() => onOpenChange(false)}>
              {t('common:understand')}
            </ButtonV2>
            <ButtonV2 onClick={() => window.open(releaseUrl, '_blank')}>
              {t('common:version_update.view_release')}
            </ButtonV2>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
