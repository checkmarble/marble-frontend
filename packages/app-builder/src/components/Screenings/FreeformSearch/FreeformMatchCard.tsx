import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { CollapsibleV2, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { MatchDetails } from '../MatchDetails';
import { screeningsI18n } from '../screenings-i18n';
import { TopicTag } from '../TopicTag';

interface FreeformMatchCardProps {
  entity: ScreeningMatchPayload;
  defaultOpen?: boolean;
}

export const FreeformMatchCard: FunctionComponent<FreeformMatchCardProps> = ({ entity, defaultOpen }) => {
  const { t } = useTranslation(screeningsI18n);

  const entitySchema = entity.schema.toLowerCase() as Lowercase<typeof entity.schema>;

  return (
    <div className="grid grid-cols-[1fr_max-content] gap-x-6 gap-y-2">
      <CollapsibleV2.Provider defaultOpen={defaultOpen}>
        <div className="bg-surface-elevated border border-grey-border col-span-full grid grid-cols-subgrid rounded-md">
          <div className="col-span-full flex items-center justify-between gap-2 px-4 py-3">
            <CollapsibleV2.Title className="focus-visible:text-purple-primary group flex grow items-center gap-2 rounded-sm outline-hidden transition-colors">
              <Icon
                icon="smallarrow-up"
                aria-hidden
                className="size-5 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 group-data-initial:rotate-180 rtl:-rotate-90 group-aria-expanded:rtl:-rotate-180 group-data-initial:rtl:-rotate-180"
              />
              <div className="text-s flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold">{entity.caption}</span>

                <span>
                  {t(`screenings:entity.schema.${entitySchema}`, {
                    defaultValue: entitySchema,
                  })}
                </span>
                <Tag color="grey">
                  {t('screenings:match.similarity', {
                    percent: Math.round(entity.score * 100),
                  })}
                </Tag>
                <div className="col-span-full flex w-full flex-wrap gap-1">
                  {entity.properties?.['topics']?.map((topic) => (
                    <TopicTag key={`${entity.id}-${topic}`} topic={topic} />
                  ))}
                </div>
              </div>
            </CollapsibleV2.Title>
            <div className="flex items-center gap-2">
              <a
                href={`https://www.opensanctions.org/entities/${entity.id}`}
                target="_blank"
                rel="noreferrer"
                className="border-grey-border bg-surface-card text-s flex items-center gap-2 rounded-sm border px-2 py-1 hover:bg-grey-background-light"
              >
                OpenSanctions
                <Icon icon="openinnew" className="size-4" />
              </a>
            </div>
          </div>

          <CollapsibleV2.Content className="col-span-full">
            <div className="text-s flex flex-col gap-6 p-4">
              {entitySchema === 'person' && entity.datasets?.length ? (
                <div className="grid grid-cols-[168px_1fr] gap-2">
                  <div className="font-bold">{t('screenings:match.datasets.title')}</div>
                  <div>
                    <ul>
                      {entity.datasets.map((name, index) => (
                        <li className="break-all" key={`dataset-${index}`}>
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
              <MatchDetails entity={entity} />
            </div>
          </CollapsibleV2.Content>
        </div>
      </CollapsibleV2.Provider>
    </div>
  );
};

export default FreeformMatchCard;
