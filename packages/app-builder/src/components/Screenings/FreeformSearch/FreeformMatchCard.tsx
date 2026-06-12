import { Spinner } from '@app-builder/components/Spinner';
import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { useGetEnrichedDataQuery } from '@app-builder/queries/screening/get-enriched-data';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsible, cn, Tag } from 'ui-design-system';
import { MatchDetails } from '../MatchDetails';
import { screeningsI18n } from '../screenings-i18n';
import { TopicsDisplay } from '../TopicsDisplay';

interface FreeformMatchCardProps {
  entity: ScreeningMatchPayload;
  defaultOpen?: boolean;
  searchTerm?: string;
  background?: 'card' | 'grey';
}

export function FreeformMatchCard({ entity, defaultOpen, searchTerm, background }: FreeformMatchCardProps) {
  const { t } = useTranslation(screeningsI18n);
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);

  const entitySchema = entity.schema.toLowerCase();

  return (
    <Collapsible.Container defaultOpen={defaultOpen} onOpenChange={setIsOpen}>
      <Collapsible.Title
        iconPosition="left"
        className={cn(background === 'grey' && 'bg-grey-background-light', background === 'card' && 'bg-surface-card')}
      >
        <div className="text-s flex flex-wrap items-center gap-x-2 gap-y-1 flex-1">
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
          <TopicsDisplay entity={entity} containerClassName="flex w-full flex-wrap gap-1 font-normal" />
        </div>
      </Collapsible.Title>

      <Collapsible.Content
        className={cn(background === 'grey' && 'bg-grey-background-light', background === 'card' && 'bg-surface-card')}
      >
        <div className="text-s flex flex-col gap-6 p-4">
          {entitySchema === 'person' && entity.datasets?.length ? (
            <div className="grid grid-cols-[146px_1fr] gap-2">
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
          <FreeFormMatchCardDataContent entityId={entity.id} searchTerm={searchTerm} isOpen={isOpen} />
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

export default FreeformMatchCard;

export function FreeFormMatchCardDataContent({
  entityId,
  searchTerm,
  isOpen,
  withTopics = false,
}: {
  entityId: string;
  searchTerm?: string;
  isOpen: boolean;
  withTopics?: boolean;
}) {
  const { t } = useTranslation(screeningsI18n);
  const enrichedData = useGetEnrichedDataQuery({ entityId }, isOpen);
  if (enrichedData.isLoading) return <Spinner className="size-6" />;
  if (!enrichedData.data?.success) return <div>{t('screenings:match.enriched_data_error')}</div>;
  const entity = enrichedData.data.data;
  if (!entity) return <div>{t('screenings:match.enriched_data_error')}</div>;
  return (
    <div className="text-s flex flex-col gap-6 p-4">
      {withTopics && <TopicsDisplay entity={entity} containerClassName="flex w-full flex-wrap gap-1 font-normal" />}
      <MatchDetails entity={entity} highlightText={searchTerm} />
    </div>
  );
}
