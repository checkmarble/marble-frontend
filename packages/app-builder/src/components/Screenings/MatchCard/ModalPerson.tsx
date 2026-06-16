import { FreeFormMatchCardDataContent } from '@app-builder/components/Screenings/FreeformSearch/FreeformMatchCard';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export default function ModalPerson({ personId, personName }: { personId: string; personName: string }) {
  const { t } = useTranslation(['common', 'screenings']);
  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button variant="secondary" mode="icon" aria-label={t('screenings:see_details')}>
          <Icon icon="eye" className="size-5 text-purple-primary" />
        </Button>
      </Modal.Trigger>
      <Modal.Content size="xlarge">
        <Modal.Title>{personName}</Modal.Title>
        <Modal.Description asChild>
          <FreeFormMatchCardDataContent entityId={personId} isOpen={true} withTopics={true} />
        </Modal.Description>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button variant="secondary" appearance="stroked" size="large">
              {t('common:close')}
            </Button>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
