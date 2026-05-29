import { AssociationEntity } from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { getFilteredAndSortedTopics } from '../TopicsDisplay';
import { TopicTag } from '../TopicTag';

const MAX_ASSOCIATIONS = 50;

export const Associations = ({ associations }: { associations: AssociationEntity[] | undefined }) => {
  const { t } = useTranslation(['screenings']);

  if (!associations || associations.length === 0) return null;

  return (
    <div className="grid grid-cols-[168px_1fr] gap-2">
      {associations.slice(0, MAX_ASSOCIATIONS).map((association, associationIndex) => {
        return association.properties.person?.map((person: any, idx: number) => {
          const { id, properties } = person;
          if (!properties?.name?.[0]) return null;
          const rel =
            association.properties.relationship
              ?.map((relation: string) =>
                t(`screenings:relation.${R.toCamelCase(relation)}.label`, {
                  defaultValue: relation,
                }),
              )
              .join(' · ') ?? t('screenings:match.family.unknown_relationship');

          const isFirstElement = associationIndex === 0 && idx === 0;

          return (
            <div key={`person-${associationIndex}-${id}-${idx}`} className="contents">
              <div className="font-semibold">
                {isFirstElement && <div className="font-bold mb-2">{t('screenings:match.associations.title')}</div>}
              </div>
              <div className="flex flex-row items-start gap-2 rounded-sm p-2 bg-surface-card">
                <div className="flex flex-col gap-2">
                  {properties.caption?.length > 0 ? (
                    <div className="text-sm text-grey-70 font-medium">{properties.caption}</div>
                  ) : (
                    <div className="col-span-full flex w-full flex-wrap gap-1">
                      <span>{properties.alias?.[0] ?? properties.name?.[0]}</span>
                    </div>
                  )}
                  <div className="text-sm text-grey-70 font-medium">{rel}</div>
                  {properties.topics?.length ? (
                    <div className="col-span-full flex w-full flex-wrap gap-1">
                      {getFilteredAndSortedTopics(properties.topics).map((topic: string) => (
                        <TopicTag key={`${id}-${topic}`} topic={topic} />
                      ))}
                    </div>
                  ) : null}
                  {association.properties.sourceUrl && association.properties.sourceUrl.length > 0 && (
                    <div className="col-span-full flex w-full flex-col gap-1">
                      <div className="font-semibold">{t('screenings:match.family.source.label')}</div>
                      <ul className="list-disc list-inside pl-2">
                        {association.properties.sourceUrl.map((url, urlIdx) => (
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        });
      })}
      {associations.length > MAX_ASSOCIATIONS && (
        <div className="contents">
          <span />
          <div className="font-semibold text-grey-secondary border border-grey-secondary rounded-sm p-2 mx-2 text-center">
            {t('screenings:match.associations.more', { count: associations.length - MAX_ASSOCIATIONS })}
          </div>
        </div>
      )}
    </div>
  );
};
