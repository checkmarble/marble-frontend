import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Modal, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface UpsaleModalProps {
  title?: string;
  description?: string;
  benefits?: string[];
  /** Show wand icon for AI-related features */
  showWand?: boolean;
}

export function UpsaleModal({ title, description, benefits = [], showWand = false }: UpsaleModalProps) {
  const { t } = useTranslation(['cases', 'common']);
  const [open, setOpen] = useState(false);

  const displayTitle = title ?? t('cases:overview.upsale.title');
  const displayDescription = description ?? t('cases:overview.upsale.description');

  const handleContact = () => {
    window.open('https://checkmarble.com/upgrade', '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <div className="flex items-center gap-v2-xs cursor-pointer">
          <Tag
            color="yellow"
            size="small"
            border="rounded-sm"
            className="border border-[#fde9af] bg-[#fef6df] text-[#eea200] rounded-full flex items-center gap-1"
          >
            {t('cases:overview.upsale.discover')}
            {showWand && <Icon icon="wand" className="size-3" />}
          </Tag>
          <Icon icon="arrow-right" className="size-5 text-purple-65" />
        </div>
      </Modal.Trigger>
      <Modal.Content size="small">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-2">
            <h2 className="text-l font-semibold">{displayTitle}</h2>
            <Tag
              color="yellow"
              size="small"
              border="rounded-sm"
              className="border border-[#fde9af] bg-[#fef6df] text-[#eea200] rounded-full flex items-center gap-1"
            >
              {t('cases:overview.upsale.discover')}
              {showWand && <Icon icon="wand" className="size-3" />}
            </Tag>
          </div>
          <div className="text-s text-grey-50">
            <p className="mb-2">{displayDescription}</p>
            {benefits.length > 0 && (
              <ul className="list-disc list-inside">
                {benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t border-grey-90 flex items-center justify-end gap-2 p-4">
          <Modal.Close asChild>
            <ButtonV2 variant="secondary" type="button">
              {t('common:cancel')}
            </ButtonV2>
          </Modal.Close>
          <ButtonV2 variant="primary" onClick={handleContact}>
            {t('cases:overview.upsale.contact')}
          </ButtonV2>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
