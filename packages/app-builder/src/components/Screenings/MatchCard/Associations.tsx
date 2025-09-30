import { AssociationEntity } from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { TopicTag } from '../TopicTag';

export const Associations = ({ associations }: { associations: AssociationEntity[] }) => {
  const { t } = useTranslation(['sanctions']);

  return (
    <>
      <div className="grid grid-cols-[168px_1fr] gap-2">
        {associations?.map((association, associationIndex) => {
          return association.properties.person?.map((person: any, idx: number) => {
            const { id, properties } = person;
            if (!properties.name?.[0]) return null;
            const rel =
              association.properties.relationship
                ?.map((relation: string) =>
                  t(`sanctions:relation.${R.toCamelCase(relation)}.label`, {
                    defaultValue: relation,
                  }),
                )
                .join(' · ') ?? t('sanctions:match.family.unknown_relationship');

            const isFirstElement = associationIndex === 0 && idx === 0;

            return (
              <div key={`person-${id}-${idx}`} className="contents">
                <div className="font-semibold">
                  {isFirstElement && (
                    <div className="font-bold mb-2">{t('sanctions:match.associations.title')}</div>
                  )}
                </div>
                <div className="flex flex-row items-start gap-2 rounded-sm p-2 bg-grey-100">
                  <div className="flex flex-col gap-2">
                    <div className="col-span-full flex w-full flex-wrap gap-1">
                      <span>
                        {properties.firstName?.slice(0, 3).join(' ')}{' '}
                        {properties['secondName']?.[0]}
                      </span>
                      <span className="font-semibold">
                        {properties.lastName?.slice(0, 3).join(' ') ?? 'unknown'}
                      </span>
                    </div>
                    <div className="text-sm text-grey-70 font-medium">{rel}</div>
                    <div className="col-span-full flex w-full flex-wrap gap-1">
                      {properties.topics?.map((topic: string) => (
                        <TopicTag key={`${id}-${topic}`} topic={topic} />
                      ))}
                    </div>
                    {association.properties.sourceUrl &&
                      association.properties.sourceUrl.length > 0 && (
                        <div className="col-span-full flex w-full flex-col gap-1">
                          <div className="font-semibold">
                            {t('sanctions:match.family.source.label')}
                          </div>
                          <ul className="list-disc list-inside pl-2">
                            {association.properties.sourceUrl.map((url, urlIdx) => (
                              <li key={`source-${id}-${urlIdx}`}>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-65 hover:text-purple-75 underline"
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
      </div>
    </>
  );
};
