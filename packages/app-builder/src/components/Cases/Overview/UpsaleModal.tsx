import { useState } from 'react';
import { ButtonV2, Modal, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface UpsaleModalProps {
  title?: string;
  description?: string;
  benefits?: string[];
  /** Show wand icon for AI-related features */
  showWand?: boolean;
}

export function UpsaleModal({
  title = 'Fonctionnalité premium',
  description = 'Découvrez les avantages de cette fonctionnalité',
  benefits = [],
  showWand = false,
}: UpsaleModalProps) {
  const [open, setOpen] = useState(false);

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
            Découvrir
            {showWand && <Icon icon="wand" className="size-3" />}
          </Tag>
          <Icon icon="arrow-right" className="size-5 text-purple-65" />
        </div>
      </Modal.Trigger>
      <Modal.Content size="small">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-2">
            <h2 className="text-l font-semibold">{title}</h2>
            <Tag
              color="yellow"
              size="small"
              border="rounded-sm"
              className="border border-[#fde9af] bg-[#fef6df] text-[#eea200] rounded-full flex items-center gap-1"
            >
              Découvrir
              {showWand && <Icon icon="wand" className="size-3" />}
            </Tag>
          </div>
          <div className="text-s text-grey-50">
            <p className="mb-2">{description}</p>
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
              Annuler
            </ButtonV2>
          </Modal.Close>
          <ButtonV2 variant="primary" onClick={handleContact}>
            Contacter Marble
          </ButtonV2>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
