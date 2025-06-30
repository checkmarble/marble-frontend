import { FamilyPersonEntity } from '@app-builder/models/sanction-check';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Collapsible } from 'ui-design-system';
import { TopicTag } from '../TopicTag';

export const FamilyDetail = ({ familyMembers }: { familyMembers: FamilyPersonEntity[] }) => {
  const language = useFormatLanguage();

  const { t } = useTranslation(['sanctions']);

  return (
    <div className="grid grid-cols-[168px,_1fr] gap-y-2">
      <div className="font-bold py-6">{t('sanctions:match.family-members.title')}</div>
      <Collapsible.Container defaultOpen={familyMembers.length <= 3}>
        <Collapsible.Title>
          {t('sanctions:match.family-member.count', { count: familyMembers.length })}
        </Collapsible.Title>
        <Collapsible.Content>
          <div className="flex flex-col gap-2">
            {familyMembers.map((member, memberIndex) => {
              return member.properties.relative?.map(({ id, properties }, idx) => {
                if (!properties.name?.[0]) return null;
                const rel =
                  member.properties.relationship
                    ?.map((relation) =>
                      t(`sanctions:relation.${R.toCamelCase(relation)}.label`, {
                        defaultValue: relation,
                      }),
                    )
                    .join(' · ') ?? t('sanctions:match.family.unknown_relationship');

                return (
                  <div key={`person-${id}-${idx}`} className="contents">
                    <div className="flex flex-row items-start  gap-2 rounded p-2 bg-grey-100">
                      <div className="flex flex-col  gap-2">
                        {properties.caption?.length > 0 ? (
                          <div className="text-sm text-grey-70 font-medium">
                            {properties.caption}
                          </div>
                        ) : (
                          <div className="col-span-full flex w-full flex-wrap gap-1">
                            <span>
                              {properties.firstName?.slice(0, 3).join(' ')}{' '}
                              {properties['secondName']?.[0]}
                            </span>
                            <span className="font-semibold">
                              {properties.lastName?.slice(0, 3).join(' ') ?? 'unknown'}
                            </span>
                          </div>
                        )}
                        <div className="text-sm text-grey-70 font-medium">
                          {rel}
                          {member.properties.startDate?.[0] && (
                            <span>
                              {' '}
                              (
                              {formatDateTimeWithoutPresets(member.properties.startDate[0], {
                                language,
                                dateStyle: 'medium',
                              })}
                              {member.properties.endDate?.[0] && (
                                <>
                                  {' - '}
                                  {formatDateTimeWithoutPresets(member.properties.endDate[0], {
                                    language,
                                    dateStyle: 'medium',
                                  })}
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
};
