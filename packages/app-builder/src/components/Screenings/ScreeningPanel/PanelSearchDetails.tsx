import { scenarioI18n } from '@app-builder/components';
import {
  isScreeningReviewCompleted,
  type Screening,
  type ScreeningMatchPayload,
  type ScreeningQuery,
} from '@app-builder/models/screening';
import { type RefineSearchInput } from '@app-builder/server-fns/screenings';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button } from 'ui-design-system';
import { screeningsI18n } from '../screenings-i18n';
import { InlineRefineSearch } from './InlineRefineSearch';

export function PanelSearchDetails({
  screening,
  onRefineSuccess,
  onSearchComplete,
}: {
  screening: Screening;
  onRefineSuccess: (screeningId: string) => void;
  onSearchComplete: (results: ScreeningMatchPayload[], formValues: RefineSearchInput) => void;
}) {
  const { t } = useTranslation(screeningsI18n);
  const [isRefining, setIsRefining] = useState(false);
  const isRefinable = !isScreeningReviewCompleted(screening);

  const request = screening.request;
  const queries = request ? Object.values(request.queries) : [];

  if (isRefining) {
    return (
      <InlineRefineSearch
        screening={screening}
        onBack={() => setIsRefining(false)}
        onSearchComplete={onSearchComplete}
      />
    );
  }

  return (
    <div className="sticky top-0 flex h-fit w-[360px] shrink-0 flex-col gap-4 pl-4">
      <span className="text-m font-medium">{t('screenings:panel.search_details')}</span>

      {request ? (
        <div className="bg-grey-background-light border border-grey-border flex flex-col rounded-lg p-4">
          <div className="flex flex-col gap-2">
            <span className="text-s font-medium">{t('screenings:panel.search_label')}</span>

            {/* Query properties */}
            <div className="flex flex-col gap-2">
              {queries.map((query, idx) => (
                <QueryProperties key={idx} query={query} />
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-grey-border my-2" />

          {/* Config: threshold */}
          <div className="flex flex-col gap-2">
            <SearchDetailRow label={t('screenings:match_threshold')}>
              <span>{`> ${request.threshold}%`}</span>
            </SearchDetailRow>
          </div>
        </div>
      ) : null}

      {isRefinable ? (
        <Button
          variant="primary"
          appearance="stroked"
          size="small"
          className="w-fit"
          onClick={() => setIsRefining(true)}
        >
          {t('screenings:refine_search')}
        </Button>
      ) : null}
    </div>
  );
}

function SearchDetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start text-s">
      <span className="w-[133px] shrink-0 opacity-50">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function QueryProperties({ query }: { query: ScreeningQuery }) {
  const { t } = useTranslation(scenarioI18n);

  const entityTypeLabel = match(query.schema)
    .with('Thing', () => t('scenarios:edit_sanction.entity_type.thing'))
    .with('Person', () => t('scenarios:edit_sanction.entity_type.person'))
    .with('Organization', () => t('scenarios:edit_sanction.entity_type.organization'))
    .with('Vehicle', () => t('scenarios:edit_sanction.entity_type.vehicle'))
    .otherwise(() => query.schema);

  return (
    <>
      {Object.entries(query.properties).map(([key, values]) => (
        <SearchDetailRow key={key} label={key}>
          <span>{values.join(', ')}</span>
        </SearchDetailRow>
      ))}
      <SearchDetailRow label={t('screenings:search_entity_type')}>
        <span className="inline-flex items-center rounded-full border border-grey-border bg-white px-2 py-0.5 text-xs text-grey-secondary">
          {entityTypeLabel}
        </span>
      </SearchDetailRow>
    </>
  );
}
