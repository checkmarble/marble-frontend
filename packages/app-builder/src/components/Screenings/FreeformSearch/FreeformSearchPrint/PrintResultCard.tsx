import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

import { MatchDetails } from '../../MatchDetails';
import { screeningsI18n } from '../../screenings-i18n';
import { TopicTag } from '../../TopicTag';

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
    <div className="border border-grey-border rounded-md break-inside-avoid mb-2">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-grey-border bg-grey-background-light/30">
        <span className="text-s font-semibold text-grey-primary">{entity.caption}</span>
        <span className="text-s text-grey-placeholder">
          {t(`screenings:entity.schema.${entitySchema}`, { defaultValue: entitySchema })}
        </span>
        <Tag color="grey">{t('screenings:match.similarity', { percent: Math.round(entity.score * 100) })}</Tag>
      </div>

      {/* Topics */}
      {entity.properties?.['topics'] && entity.properties['topics'].length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 py-1 border-b border-grey-border">
          {entity.properties['topics'].map((topic) => (
            <TopicTag key={`${entity.id}-${topic}`} topic={topic} />
          ))}
        </div>
      )}

      {/* Content - Always expanded */}
      <div className="text-s p-3">
        {/* Datasets */}
        {entitySchema === 'person' && entity.datasets?.length ? (
          <div className="grid grid-cols-[140px_1fr] gap-2 mb-2">
            <div className="font-bold">{t('screenings:match.datasets.title')}</div>
            <div>
              <ul className="list-disc list-inside">
                {entity.datasets.map((name, index) => (
                  <li className="break-all" key={`dataset-${index}`}>
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {/* Match Details */}
        <MatchDetails entity={entity} />

        {/* OpenSanctions Link - visible as text for print */}
        <div className="mt-2 text-xs text-grey-placeholder">
          OpenSanctions: https://www.opensanctions.org/entities/{entity.id}
        </div>
      </div>
    </div>
  );
};

export default PrintResultCard;
