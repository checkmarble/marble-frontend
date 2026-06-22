import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { EntityDatasetsList } from '../../MatchCard/match-card-entity-components';
import { MatchDetails } from '../../MatchDetails';
import { screeningsI18n } from '../../screenings-i18n';
import { TopicsDisplay } from '../../TopicsDisplay';

interface PrintResultCardProps {
  entity: ScreeningMatchPayload;
}

/**
 * Non-collapsible result card for print view.
 * Shows all details expanded - no interactive elements.
 */
export const PrintResultCard: FunctionComponent<PrintResultCardProps> = ({ entity }) => {
  const { t } = useTranslation(screeningsI18n);
  const entitySchema = entity.schema.toLowerCase() as Lowercase<typeof entity.schema>;

  return (
    <div className="border border-grey-border rounded-md break-inside-avoid mb-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-sm px-md py-xs border-b border-grey-border bg-grey-background-light/30">
        <span className="text-s font-semibold text-grey-primary">{entity.caption}</span>
        <span className="text-s text-grey-placeholder">
          {t(`screenings:entity.schema.${entitySchema}`, {
            defaultValue: entitySchema,
          })}
        </span>
        <Tag color="grey">
          {t('screenings:match.similarity', {
            percent: Math.round(entity.score * 100),
          })}
        </Tag>
      </div>

      {/* Topics */}
      {entity.properties?.['topics']?.length ? (
        <div className="border-b border-grey-border px-md py-2xs">
          <TopicsDisplay entity={entity} containerClassName="flex flex-wrap gap-xs" />
        </div>
      ) : null}

      {/* Content - Always expanded */}
      <div className="text-s p-md">
        {/* Datasets */}
        {entitySchema === 'person' && entity.datasets?.length ? (
          <div className="grid grid-cols-[140px_1fr] gap-sm mb-sm">
            <div className="font-bold">{t('screenings:match.datasets.title')}</div>
            <div>
              <EntityDatasetsList
                datasets={entity.datasets}
                useCase="manual_search"
                listClassName="list-disc list-inside"
                itemClassName="break-all"
              />
            </div>
          </div>
        ) : null}

        {/* Match Details */}
        <MatchDetails entity={entity} />
      </div>
    </div>
  );
};

export default PrintResultCard;
