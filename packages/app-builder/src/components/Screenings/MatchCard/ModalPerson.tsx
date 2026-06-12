import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { FreeFormMatchCardDataContent } from '../FreeformSearch/FreeformMatchCard';

export default function ModalPerson({ personId, personName }: { personId: string; personName: string }) {
  const { t } = useTranslation(['common']);
  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button variant="secondary" mode="icon">
          <Icon icon="eye" className="size-5 text-purple-primary" />
        </Button>
      </Modal.Trigger>
      <Modal.Content size="xlarge">
        <Modal.Title>{personName}</Modal.Title>
        <Modal.Description>
          <FreeFormMatchCardDataContent entityId={personId} isOpen={true} withTopics={true} />
        </Modal.Description>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button variant="secondary" appearance="stroked">
              {t('common:close')}
            </Button>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
