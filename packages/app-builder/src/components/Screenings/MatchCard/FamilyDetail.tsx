import { FamilyPersonEntity, FamilyRelativeEntity, PersonEntity } from '@app-builder/models/screening';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Collapsible } from 'ui-design-system';
import { TopicTag } from '../TopicTag';

export type RelationType = 'familyPerson' | 'familyRelative';
export type RelationEntity<T extends RelationType> = T extends 'familyPerson'
  ? FamilyPersonEntity[]
  : FamilyRelativeEntity[];

export type FamilyDetailProps<T extends RelationType> = {
  relation: T;
  familyMembers: RelationEntity<T>;
};

export function FamilyDetail<T extends RelationType>({ familyMembers, relation }: FamilyDetailProps<T>) {
  const formatDateTime = useFormatDateTime();

  const { t } = useTranslation(['screenings']);

  return (
    <div className="grid grid-cols-[168px_1fr] gap-y-2">
      <div className="font-bold py-6">{t('screenings:match.family-members.title')}</div>
      <Collapsible.Container defaultOpen={familyMembers.length <= 3}>
        <Collapsible.Title>
          {t('screenings:match.family-member.count', { count: familyMembers.length })}
        </Collapsible.Title>
        <Collapsible.Content>
          <div className="flex flex-col gap-2">
            {familyMembers.map((member, memberIndex) => {
              const entities = member.properties[relation === 'familyPerson' ? 'relative' : 'person'] as PersonEntity[];

              return entities?.map(({ id, properties }, idx) => {
                if (!properties.name?.[0]) return null;
                const rel =
                  member.properties.relationship
                    ?.map((relation) =>
                      t(`screenings:relation.${R.toCamelCase(relation)}.label`, {
                        defaultValue: relation,
                      }),
                    )
                    .join(' · ') ?? t('screenings:match.family.unknown_relationship');

                return (
                  <div key={`person-${id}-${idx}`} className="contents">
                    <div className="flex flex-row items-start  gap-2 rounded-sm p-2 bg-surface-card">
                      <div className="flex flex-col  gap-2">
                        {properties.caption?.length > 0 ? (
                          <div className="text-sm text-grey-70 font-medium">{properties.caption}</div>
                        ) : (
                          <div className="col-span-full flex w-full flex-wrap gap-1">
                            <span>{properties.alias?.[0] ?? properties.name?.[0]}</span>
                          </div>
                        )}
                        <div className="text-sm text-grey-70 font-medium">
                          {rel}
                          {member.properties.startDate?.[0] && (
                            <span>
                              {' '}
                              ({formatDateTime(member.properties.startDate[0], { dateStyle: 'medium' })}
                              {member.properties.endDate?.[0] && (
                                <>
                                  {' - '}
                                  {formatDateTime(member.properties.endDate[0], { dateStyle: 'medium' })}
                                </>
                              )}
                              )
                            </span>
                          )}
                        </div>
                        <div className="col-span-full flex w-full flex-wrap gap-1">
                          {properties['topics']?.map((topic) => (
                            <TopicTag key={`${id}-${topic}`} topic={topic} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </Collapsible.Content>
      </Collapsible.Container>
    </div>
  );
}
