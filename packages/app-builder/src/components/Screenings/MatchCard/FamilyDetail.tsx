import { IconDot } from '@app-builder/components/Screenings/MatchCard/match-card-entity-components';
import {
  type FamilyPersonEntity,
  type FamilyRelationshipEntry,
  type FamilyRelativeEntity,
  PersonEntity,
} from '@app-builder/models/screening';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, cn, ExpandableGroupTagLine } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { getFilteredAndSortedTopics } from '../TopicsDisplay';
import { isDisplayableTopic, TopicTag } from '../TopicTag';
import ModalPerson from './ModalPerson';
import { getPersonName, hasDisplayableName } from './match-card-utility-functions';

const MAX_FAMILY_MEMBERS = 5;

export type RelationType = 'familyPerson' | 'familyRelative';
export type RelationEntity<T extends RelationType> = T extends 'familyPerson'
  ? FamilyPersonEntity[]
  : FamilyRelativeEntity[];

export type FamilyDetailProps<T extends RelationType> = {
  relation: T;
  familyMembers: RelationEntity<T>;
};

export type FamilyMemberRow = {
  key: string;
  member: FamilyPersonEntity | FamilyRelativeEntity;
  id: string;
  properties: PersonEntity['properties'];
  relationshipEntries: FamilyRelationshipEntry[];
};

function FamilyRelationshipTag({ value, source }: FamilyRelationshipEntry) {
  const { t } = useTranslation(['screenings']);
  const label = value
    ? t(`screenings:relation.${R.toCamelCase(value)}.label`, {
        defaultValue: value,
      })
    : t('screenings:match.family.unknown_relationship');

  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-grey-border bg-surface-card p-1 font-mono">
      <Icon icon="arrow-forward" className={cn('size-4', source === 'familyRelative' && 'rotate-180')} />
      <span>{label}</span>
    </span>
  );
}

function flattenFamilyMembers<T extends RelationType>(
  familyMembers: RelationEntity<T>,
  relation: T,
): FamilyMemberRow[] {
  const rows: FamilyMemberRow[] = [];

  familyMembers.forEach((member, memberIndex) => {
    const entities = member.properties[relation === 'familyPerson' ? 'relative' : 'person'] as PersonEntity[];
    const relationshipEntries: FamilyRelationshipEntry[] =
      member.properties.relationships ??
      (member.properties.relationship ?? []).map((value) => ({ value, source: relation }));

    entities?.forEach(({ id, properties }, idx) => {
      if (!properties || !hasDisplayableName(properties)) return;
      rows.push({
        key: `person-${memberIndex}-${id}-${idx}`,
        member,
        id,
        properties,
        relationshipEntries,
      });
    });
  });

  return rows;
}

export function FamilyDetail<T extends RelationType>({ familyMembers, relation }: FamilyDetailProps<T>) {
  const { t } = useTranslation(['screenings', 'common']);
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => flattenFamilyMembers(familyMembers, relation), [familyMembers, relation]);
  const hiddenCount = Math.max(0, rows.length - MAX_FAMILY_MEMBERS);
  const visibleRows = showAll ? rows : rows.slice(0, MAX_FAMILY_MEMBERS);

  return (
    <ul className="grid grid-cols-[146px_1fr] gap-2">
      {visibleRows.map((row, rowIndex) => {
        const { key, member, id, properties, relationshipEntries } = row;
        const isFirstElement = rowIndex === 0;

        const tags = properties.topics?.length
          ? getFilteredAndSortedTopics(properties.topics)
              .filter(isDisplayableTopic)
              .map((topic) => <TopicTag key={`${id}-${topic}`} topic={topic} />)
          : [];

        const expandableItems = [
          <IconDot key="dot-1" dark spaced />,
          properties.caption?.length > 0 ? (
            <span key="caption" className="text-sm text-grey-70 shrink-0 font-medium">
              {properties.caption}
            </span>
          ) : (
            <span key="alias" className="shrink-0">
              {getPersonName(row)}
            </span>
          ),
          <IconDot key="dot-2" />,
          ...(relationshipEntries.length > 0
            ? relationshipEntries.map((entry, relIdx) => (
                <FamilyRelationshipTag key={`rel-${key}-${relIdx}`} {...entry} />
              ))
            : [<FamilyRelationshipTag key={`rel-${key}-unknown`} value="" source={relation} />]),
          ...(tags.length > 0 ? [<IconDot key="dot-3" />, ...tags] : []),
        ];

        return (
          <li key={key} className="contents">
            <div className="font-semibold">
              {isFirstElement && <div className="font-bold mb-2">{t('screenings:match.family-members.title')}</div>}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-v2-sm">
                <ExpandableGroupTagLine items={expandableItems} classname="gap-v2-sm" overflowTagWidth={60} />
                <ModalPerson personId={id} personName={getPersonName(row)} />
              </div>
              {member.properties.sourceUrl && member.properties.sourceUrl.length > 0 && (
                <span className="col-span-full flex w-full flex-col gap-1">
                  <div className="font-semibold">{t('screenings:match.family.source.label')}</div>
                  <ul className="list-disc list-inside pl-2">
                    {member.properties.sourceUrl.map((url, urlIdx) => (
                      <li key={`source-${id}-${urlIdx}`}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-primary hover:text-purple-75 underline"
                        >
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </span>
              )}
            </div>
          </li>
        );
      })}
      {hiddenCount > 0 && !showAll && (
        <li className="contents">
          <span />
          <Button appearance="link" variant="primary" onClick={() => setShowAll(true)}>
            {t('common:more_remains', { count: hiddenCount })}
          </Button>
        </li>
      )}
    </ul>
  );
}
