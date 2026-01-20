import { PrintSection } from '@app-builder/components/Print';
import { type SearchableSchema } from '@app-builder/constants/screening-entity';
import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

import { screeningsI18n } from '../../screenings-i18n';

export interface PrintSearchInputs {
  entityType: SearchableSchema;
  fields: Record<string, string>;
  datasets: string[];
  threshold: number | undefined;
}

interface PrintSearchSummaryProps {
  searchInputs: PrintSearchInputs;
}

/**
 * Displays the search parameters used for the screening search in print view.
 */
export const PrintSearchSummary: FunctionComponent<PrintSearchSummaryProps> = ({ searchInputs }) => {
  const { t } = useTranslation(screeningsI18n);
  const entityTypeKey = searchInputs.entityType.toLowerCase() as Lowercase<SearchableSchema>;

  // Get non-empty fields
  const activeFields = Object.entries(searchInputs.fields).filter(([, value]) => value && value.trim() !== '');

  return (
    <PrintSection title={t('screenings:print.search_summary')}>
      <div className="border border-grey-border rounded-md p-3">
        <div className="grid grid-cols-2 gap-3 text-s">
          {/* Entity Type */}
          <div>
            <span className="font-medium text-grey-placeholder">
              {t('screenings:freeform_search.entity_type_label')}
            </span>
            <p className="font-semibold text-grey-primary">{t(`screenings:refine_modal.schema.${entityTypeKey}`)}</p>
          </div>

          {/* Threshold */}
          <div>
            <span className="font-medium text-grey-placeholder">{t('screenings:freeform_search.threshold_label')}</span>
            <p className="font-semibold text-grey-primary">
              {searchInputs.threshold !== undefined
                ? `${searchInputs.threshold}%`
                : t('screenings:print.default_threshold')}
            </p>
          </div>

          {/* Search Fields */}
          {activeFields.length > 0 && (
            <div className="col-span-2">
              <span className="font-medium text-grey-placeholder">{t('screenings:print.search_fields')}</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {activeFields.map(([field, value]) => (
                  <Tag key={field} color="grey">
                    <span className="font-medium">{t(`screenings:entity.property.${field}`)}:</span> {value}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {/* Datasets */}
          {searchInputs.datasets.length > 0 && (
            <div className="col-span-2">
              <span className="font-medium text-grey-placeholder">
                {t('screenings:freeform_search.datasets_label')}
              </span>
              <p className="text-s text-grey-primary mt-1">{searchInputs.datasets.join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    </PrintSection>
  );
};

export default PrintSearchSummary;
