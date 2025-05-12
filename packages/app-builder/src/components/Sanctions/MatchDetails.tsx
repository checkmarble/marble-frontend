import type { PropertyForSchema } from '@app-builder/constants/sanction-check-entity';
import type {
  SanctionCheckMatch,
  SanctionCheckSanctionEntity,
} from '@app-builder/models/sanction-check';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { EntityProperties } from './EntityProperties';
import { sanctionsI18n } from './sanctions-i18n';

export type MatchDetailsProps = {
  entity: SanctionCheckMatch['payload'];
};

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

export function MatchDetails({ entity }: MatchDetailsProps) {
  const { t } = useTranslation(sanctionsI18n);
  const [selectedSanction, setSelectedSanction] = useState<SanctionCheckSanctionEntity | null>(
    null,
  );

  return (
    <div className="flex flex-col gap-4">
      <EntityProperties
        entity={entity}
        after={
          entity.properties.sanctions ? (
            <>
              <span className="font-bold">{t('sanctions:entity.property.sanctions')}</span>
              <div className="flex flex-col gap-2">
                {entity.properties.sanctions.map((sanction) => (
                  <div
                    key={sanction.id}
                    className="group/sanction bg-grey-100 grid grid-cols-[1fr_20px] gap-2 rounded p-2"
                  >
                    <span className="truncate">{sanction.properties['authority']}</span>
                    <button type="button" onClick={() => setSelectedSanction(sanction)}>
                      <Icon
                        icon="visibility-on"
                        className="text-grey-90 hover:text-purple-65 size-5 cursor-pointer"
                      />
                    </button>
                  </div>
                ))}
              </div>

              <ModalV2.Content
                open={!!selectedSanction}
                onClose={() => setSelectedSanction(null)}
                size="large"
                className="max-h-[80vh]"
              >
                <ModalV2.Title>{t('sanctions:sanction_detail.title')}</ModalV2.Title>
                <div className="overflow-y-auto p-6">
                  {selectedSanction ? (
                    <EntityProperties entity={selectedSanction} forcedProperties={sanctionProps} />
                  ) : null}
                </div>
              </ModalV2.Content>
            </>
          ) : null
        }
      />
    </div>
  );
}
