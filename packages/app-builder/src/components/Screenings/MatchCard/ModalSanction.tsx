import { type PropertyForSchema } from '@app-builder/constants/screening-entity';
import { type ScreeningSanctionEntity } from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { EntityProperties } from '../EntityProperties';

const sanctionProps = [
  'country',
  'authority',
  'authorityId',
  'startDate',
  'endDate',
  'listingDate',
  'program',
  'programId',
  'programUrl',
  'summary',
  'reason',
  'sourceUrl',
] satisfies PropertyForSchema<'Sanction'>[];

export function ModalSanction({ sanction }: { sanction: ScreeningSanctionEntity }) {
  const { t } = useTranslation(['screenings', 'common']);

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button variant="secondary" mode="icon" aria-label={t('screenings:see_details')}>
          <Icon icon="eye" className="size-5 text-purple-primary" />
        </Button>
      </Modal.Trigger>
      <Modal.Content size="large" className="max-h-[80vh]">
        <Modal.Title>{t('screenings:sanction_detail.title')}</Modal.Title>
        <div className="overflow-y-auto p-6">
          <EntityProperties entity={sanction} forcedProperties={sanctionProps} />
        </div>
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
