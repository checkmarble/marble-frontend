import { Spinner } from '@app-builder/components/Spinner';
import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { useGetEnrichedDataQuery } from '@app-builder/queries/screening/get-enriched-data';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { type FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { MatchDetails } from '../MatchDetails';
import { screeningsI18n } from '../screenings-i18n';
import { TopicsDisplay } from '../TopicsDisplay';

interface FreeformMatchCardProps {
  entity: ScreeningMatchPayload;
  defaultOpen?: boolean;
  searchTerm?: string;
}

export const FreeformMatchCard: FunctionComponent<FreeformMatchCardProps> = ({ entity, defaultOpen, searchTerm }) => {
  const { t } = useTranslation(screeningsI18n);
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);

  const entitySchema = entity.schema.toLowerCase();

  return (
    <CollapsiblePrimitive.Root defaultOpen={defaultOpen} onOpenChange={setIsOpen}>
      <div className="bg-surface-page border border-grey-border rounded-md">
        <CollapsiblePrimitive.Trigger className="focus-visible:text-purple-primary group flex grow items-center gap-2 rounded-sm outline-hidden transition-colors px-4 py-3">
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
              <TopicsDisplay entity={entity} />
            </div>
          </div>
        </CollapsiblePrimitive.Trigger>
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
          <DataContent entityId={entity.id} searchTerm={searchTerm} isOpen={isOpen} />
        </div>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
};

export default FreeformMatchCard;

function DataContent({ entityId, searchTerm, isOpen }: { entityId: string; searchTerm?: string; isOpen: boolean }) {
  const { t } = useTranslation(screeningsI18n);
  const enrichedData = useGetEnrichedDataQuery({ entityId }, isOpen);
  if (enrichedData.isLoading) return <Spinner className="size-6" />;
  if (!enrichedData.data?.success) return <div>{t('screenings:match.enriched_data_error')}</div>;
  const entity = enrichedData.data.data;
  if (!entity) return <div>{t('screenings:match.enriched_data_error')}</div>;
  return (
    <div className="text-s flex flex-col gap-6 p-4">
      <MatchDetails entity={entity} highlightText={searchTerm} />
    </div>
  );
}
