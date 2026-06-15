import {
  type FamilyPersonEntity,
  type FamilyRelationshipEntry,
  type FamilyRelativeEntity,
  type ScreeningMatch,
} from '@app-builder/models/screening';
import { ReactNode, useMemo } from 'react';
import { EntityProperties } from './EntityProperties';
import { Associations } from './MatchCard/Associations';
import { FamilyDetail } from './MatchCard/FamilyDetail';
import { MemberShip } from './MatchCard/MemberShip';
import { Sanctions } from './MatchCard/Sanctions';

export type MatchDetailsProps = {
  entity: ScreeningMatch['payload'];
  before?: ReactNode;
  highlightText?: string;
};

function relationshipKey({ source, value }: FamilyRelationshipEntry) {
  return `${source}:${value}`;
}

function dedupeRelationships(entries: FamilyRelationshipEntry[]) {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = relationshipKey(entry);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function MatchDetails({ entity, before, highlightText }: MatchDetailsProps) {
  const deduplicatedEntity = useMemo(() => {
    if (entity.schema !== 'Person') return entity;

    let familyPerson = entity.properties.familyPerson;
    let familyRelative = entity.properties.familyRelative;

    if (entity.properties.familyPerson?.length) {
      const familyPersonIds = new Set(
        entity.properties.familyPerson.flatMap(({ properties }) => properties.person ?? []),
      );
      const ignoredFamilyRelative: Array<{ relativePersonId: string; relationship: string[] }> = [];

      familyRelative = entity.properties.familyRelative?.filter(({ properties }) => {
        const matchingPersonId = properties.relative?.find((relativeId) => familyPersonIds.has(relativeId));
        if (matchingPersonId) {
          if (properties.relationship?.length) {
            properties.person?.forEach((person) => {
              ignoredFamilyRelative.push({
                relativePersonId: person.id,
                relationship: properties.relationship!,
              });
            });
          }
          return false;
        }
        return true;
      });

      familyPerson = entity.properties.familyPerson.map((entry) => ({
        ...entry,
        properties: {
          ...entry.properties,
          relationships: dedupeRelationships(
            (entry.properties.relationship ?? []).map((value) => ({
              value,
              source: 'familyPerson' as const,
            })),
          ),
        },
      })) as FamilyPersonEntity[];

      ignoredFamilyRelative.forEach(({ relativePersonId, relationship }) => {
        const familyPersonEntry = familyPerson?.find(({ properties }) =>
          properties.relative?.some((relative) => relative.id === relativePersonId),
        );
        if (!familyPersonEntry) return;

        familyPersonEntry.properties.relationships = dedupeRelationships([
          ...(familyPersonEntry.properties.relationships ?? []),
          ...relationship.map((value) => ({ value, source: 'familyRelative' as const })),
        ]);

        const relationshipValues = new Set(familyPersonEntry.properties.relationship ?? []);
        relationship.forEach((value) => relationshipValues.add(value));
        familyPersonEntry.properties.relationship = Array.from(relationshipValues);
      });

      familyRelative = familyRelative?.map((entry) => ({
        ...entry,
        properties: {
          ...entry.properties,
          relationships: (entry.properties.relationship ?? []).map((value) => ({
            value,
            source: 'familyRelative' as const,
          })),
        },
      })) as FamilyRelativeEntity[];
    }

    let associations = entity.properties.associations;
    if (entity.properties.associations?.length) {
      const associateIds = new Set(
        entity.properties.associations.flatMap(({ properties }) => properties.person?.map((p) => p.id) ?? []),
      );
      const ignoredAssociation: Array<{ id: string; relationship: string[] }> = [];

      associations = entity.properties.associations.filter(({ properties }) => {
        if (!properties.person) return false;
        if (properties.person.some((p) => associateIds.has(p.id))) {
          const personId = properties.person.find((p) => associateIds.has(p.id))?.id;
          if (personId) associateIds.delete(personId);
          return true;
        }
        properties.person.forEach((p) =>
          ignoredAssociation.push({ id: p.id, relationship: properties.relationship ?? [] }),
        );
        return false;
      });

      ignoredAssociation.forEach((person) => {
        const association = associations?.find(({ properties }) => properties.person?.some((p) => p.id === person.id));
        if (association) {
          const relationships = new Set(association.properties.relationship ?? []);
          person.relationship.forEach((r) => relationships.add(r));
          association.properties.relationship = Array.from(relationships);
        }
      });
    }

    return {
      ...entity,
      properties: {
        ...entity.properties,
        familyPerson,
        familyRelative,
        associations,
      },
    };
  }, [entity]);

  return (
    <div className="flex flex-col gap-4">
      <EntityProperties entity={entity} before={before} highlightText={highlightText} />
      <Sanctions sanctions={entity.properties?.sanctions} />
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
