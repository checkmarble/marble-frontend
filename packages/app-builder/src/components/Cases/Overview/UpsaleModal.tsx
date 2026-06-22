import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Tag, Typo as TypoComponent } from 'ui-design-system';
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
        <div className="flex items-center gap-xs cursor-pointer">
          <Tag
            color="yellow"
            size="small"
            className="border border-[#fde9af] bg-[#fef6df] text-[#eea200] rounded-full flex items-center gap-xs"
          >
            {t('cases:overview.upsale.discover')}
            {showWand && <Icon icon="wand" className="size-3" />}
          </Tag>
          <Icon icon="arrow-right" className="size-5 text-purple-primary" />
        </div>
      </Modal.Trigger>
      <Modal.Content size="small">
        <div className="flex flex-col gap-md p-md">
          <div className="flex items-center gap-sm">
            <TypoComponent variant="title2">{displayTitle}</TypoComponent>
            <Tag
              color="yellow"
              size="small"
              className="border border-[#fde9af] bg-[#fef6df] text-[#eea200] rounded-full flex items-center gap-xs"
            >
              {t('cases:overview.upsale.discover')}
              {showWand && <Icon icon="wand" className="size-3" />}
            </Tag>
          </div>
          <div className="text-s text-grey-secondary">
            <p className="mb-sm">{displayDescription}</p>
            {benefits.length > 0 && (
              <ul className="list-disc list-inside">
                {benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t border-grey-border flex items-center justify-end gap-sm p-md">
          <Modal.Close asChild>
            <Button variant="secondary" type="button">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button variant="primary" onClick={handleContact}>
            {t('cases:overview.upsale.contact')}
          </Button>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
