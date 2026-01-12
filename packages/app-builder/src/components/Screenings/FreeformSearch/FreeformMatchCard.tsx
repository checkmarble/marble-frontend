import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
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
    <CollapsiblePrimitive.Root defaultOpen={defaultOpen}>
      <div className="bg-surface-card border border-grey-border rounded-md">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <CollapsiblePrimitive.Trigger className="focus-visible:text-purple-primary group flex grow items-center gap-2 rounded-sm outline-hidden transition-colors">
            <Icon
              icon="smallarrow-up"
              aria-hidden
              className="size-5 rotate-90 transition-transform duration-200 group-data-[state=open]:rotate-180 rtl:-rotate-90 group-data-[state=open]:rtl:-rotate-180"
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
          </CollapsiblePrimitive.Trigger>
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

        <CollapsiblePrimitive.Content className="data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up overflow-hidden">
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
        </CollapsiblePrimitive.Content>
      </div>
    </CollapsiblePrimitive.Root>
  );
};

export default FreeformMatchCard;
