import { type PropertyForSchema } from '@app-builder/constants/screening-entity';
import { type ScreeningMatch, type ScreeningSanctionEntity } from '@app-builder/models/screening';
import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { EntityProperties } from './EntityProperties';
import { Associations } from './MatchCard/Associations';
import { FamilyDetail } from './MatchCard/FamilyDetail';
import { MemberShip } from './MatchCard/MemberShip';
import { screeningsI18n } from './screenings-i18n';

export type MatchDetailsProps = {
  entity: ScreeningMatch['payload'];
  before?: ReactNode;
  highlightText?: string;
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

export function MatchDetails({ entity, before, highlightText }: MatchDetailsProps) {
  const { t } = useTranslation(screeningsI18n);
  const [selectedSanction, setSelectedSanction] = useState<ScreeningSanctionEntity | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const deduplicatedEntity = useMemo(() => {
    if (entity.schema !== 'Person') return entity;
    // family person & relative
    const familyPersonIds = new Set(entity.properties?.familyPerson?.flatMap(({ properties }) => properties?.person));
    if (!familyPersonIds.size) return entity;
    const familyRelative = entity.properties.familyRelative?.filter(
      ({ properties }) => !properties.relative?.some((relativeId) => familyPersonIds.has(relativeId)),
    );
    // assocations
    const associateIds = new Set(
      entity.properties?.associations?.flatMap(({ properties }) => properties?.person?.map((p) => p.id)),
    );
    const ignored: Array<{ id: string; relationship: string[] }> = [];
    const associations = entity.properties?.associations?.filter(({ properties }) => {
      if (!properties?.person) return false;
      if (properties.person?.some((p) => associateIds.has(p.id))) {
        const personId = properties.person?.find((p) => associateIds.has(p.id))?.id;
        associateIds.delete(personId);
        return true;
      }
      properties.person.forEach((p) => ignored.push({ id: p.id, relationship: properties.relationship! }));
      return false;
    });
    // complete relationships of original associations with ignored relationships (only once)
    ignored.forEach((person) => {
      const association = entity.properties?.associations?.find(({ properties }) =>
        properties?.person?.some((p) => p.id === person.id),
      );
      if (association) {
        const relationships = new Set(association.properties.relationship ?? []);
        person.relationship.forEach((r) => relationships.add(r));
        association.properties.relationship = Array.from(relationships);
      }
    });

    return {
      ...entity,
      properties: {
        ...entity.properties,
        familyRelative,
        associations,
      },
    };
  }, [entity]);

  return (
    <div className="flex flex-col gap-4">
      <EntityProperties
        entity={entity}
        before={before}
        highlightText={highlightText}
        after={
          entity.properties?.sanctions ? (
            <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
              <span className="font-bold">{t('screenings:entity.property.sanctions')}</span>
              <div className="flex flex-col gap-2">
                {entity.properties.sanctions.map((sanction) => (
                  <div
                    key={sanction.id}
                    className="group/sanction bg-surface-card grid grid-cols-[1fr_20px] gap-2 rounded-sm p-2"
                  >
                    <span className="truncate">{sanction.properties['authority']}</span>
                    <Modal.Trigger asChild>
                      <button type="button" onClick={() => setSelectedSanction(sanction)}>
                        <Icon
                          icon="visibility-on"
                          className="text-grey-secondary hover:text-purple-primary size-5 cursor-pointer"
                        />
                      </button>
                    </Modal.Trigger>
                  </div>
                ))}
              </div>
              <Modal.Content size="large" className="max-h-[80vh]">
                <div className="relative">
                  <Modal.Title>{t('screenings:sanction_detail.title')}</Modal.Title>
                  <Modal.Close asChild>
                    <Button variant="secondary" appearance="link" className="absolute top-2 right-2">
                      <Icon icon="cross" className="size-5" />
                    </Button>
                  </Modal.Close>
                </div>
                <div className="overflow-y-auto p-6">
                  {selectedSanction ? (
                    <EntityProperties entity={selectedSanction} forcedProperties={sanctionProps} />
                  ) : null}
                </div>
              </Modal.Content>
            </Modal.Root>
          ) : null
        }
      />
      {entity.schema === 'Person' &&
      entity.properties?.['membershipMember']?.length &&
      entity.properties?.['membershipMember']?.[0]?.caption ? (
        <MemberShip membershipMember={entity.properties['membershipMember']} />
      ) : null}

      <Associations associations={deduplicatedEntity.properties['associations']} />

      {entity.schema === 'Person' && deduplicatedEntity.properties?.['familyPerson']?.length ? (
        <FamilyDetail relation="familyPerson" familyMembers={deduplicatedEntity.properties['familyPerson']} />
      ) : null}

      {entity.schema === 'Person' && deduplicatedEntity.properties?.['familyRelative']?.length ? (
        <FamilyDetail relation="familyRelative" familyMembers={deduplicatedEntity.properties['familyRelative']} />
      ) : null}
    </div>
  );
}
