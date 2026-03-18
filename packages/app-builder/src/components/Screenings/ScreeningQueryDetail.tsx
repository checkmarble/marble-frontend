import { scenarioI18n } from '@app-builder/components';
import { FormatData } from '@app-builder/components/FormatData';
import { type Screening, type ScreeningQuery } from '@app-builder/models/screening';
import { parseUnknownData } from '@app-builder/utils/parse';
import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Tabs, tabClassName } from 'ui-design-system';

import { screeningsI18n } from './screenings-i18n';

const QueryObjectDetail = ({ query }: { query: ScreeningQuery }) => {
  const { t } = useTranslation(scenarioI18n);
  const parsed = useMemo(
    () => Object.entries(query.properties).map(([k, v]) => [k, parseUnknownData(v)] as const),
    [query.properties],
  );

  return (
    <div className="text-s text-grey-primary bg-grey-background-light grid grid-cols-[max-content_1fr] gap-3 gap-x-4 break-all rounded-lg p-4 mb-2">
      <span className="font-semibold">type</span>
      <span>
        {match(query.schema)
          .with('Thing', () => t('scenarios:edit_sanction.entity_type.thing'))
          .with('Person', () => t('scenarios:edit_sanction.entity_type.person'))
          .with('Organization', () => t('scenarios:edit_sanction.entity_type.organization'))
          .with('Vehicle', () => t('scenarios:edit_sanction.entity_type.vehicle'))
          .otherwise(() => '')}
      </span>
      {parsed.map(([property, data]) => (
        <Fragment key={property}>
          <span className="font-semibold">{property}</span>
          <FormatData data={data} />
        </Fragment>
      ))}
    </div>
  );
};

export function ScreeningQueryDetail({
  request,
  initialQuery,
}: {
  request: NonNullable<Screening['request']>;
  initialQuery: Screening['initialQuery'];
}) {
  const { t } = useTranslation(screeningsI18n);
  const processedQueries = Object.values(request.queries);
  const hasInitialQuery = Array.isArray(initialQuery) && initialQuery.length > 0;
  const [activeTab, setActiveTab] = useState<'initial' | 'preprocessed'>('preprocessed');

  return (
    <div>
      <Tabs>
        {hasInitialQuery && (
          <button
            type="button"
            className={tabClassName}
            data-status={activeTab === 'initial' ? 'active' : undefined}
            onClick={() => setActiveTab('initial')}
          >
            {t('screenings:initial_query')}
          </button>
        )}
        <button
          type="button"
          className={tabClassName}
          data-status={activeTab === 'preprocessed' ? 'active' : undefined}
          onClick={() => setActiveTab('preprocessed')}
        >
          {!hasInitialQuery ? t('screenings:query') : t('screenings:processed_query')}
        </button>
      </Tabs>
      <div className="mt-2">
        {activeTab === 'initial' && hasInitialQuery && (
          <>
            {initialQuery.map((q, i) => (
              <QueryObjectDetail key={i} query={q as ScreeningQuery} />
            ))}
          </>
        )}
        {activeTab === 'preprocessed' && (
          <>
            {processedQueries.map((q, i) => (
              <QueryObjectDetail key={i} query={q as ScreeningQuery} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
