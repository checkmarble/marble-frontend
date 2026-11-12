import { SCREENING_REVIEW_FILTERS, type ScreeningReviewFilter } from '@app-builder/models/screening-review';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchInput, Tabs } from 'ui-design-system';

const SEARCH_DELAY_MS = 300;

/** Search by name, then the filters with what each holds among the loaded hits. */
export function QueueFilters({
  filter,
  counts,
  isCountPartial,
  query,
  onFilterChange,
  onQueryChange,
}: {
  filter: ScreeningReviewFilter;
  counts: Record<ScreeningReviewFilter, number>;
  /** The loaded hits may not hold every hit of this filter. */
  isCountPartial: (filter: ScreeningReviewFilter) => boolean;
  query: string | undefined;
  onFilterChange: (filter: ScreeningReviewFilter) => void;
  onQueryChange: (query: string | undefined) => void;
}) {
  const { t } = useTranslation(['cases']);
  return (
    <div className="flex flex-col gap-sm">
      <QueueSearch query={query} onQueryChange={onQueryChange} />
      <Tabs
        variant="pills"
        value={filter}
        onValueChange={(value) => {
          const next = SCREENING_REVIEW_FILTERS.find((candidate) => candidate === value);
          if (next && next !== filter) onFilterChange(next);
        }}
      >
        {SCREENING_REVIEW_FILTERS.map((value) => (
          <Tabs.Button key={value} value={value}>
            {t(`cases:screening_review.filter.${value}`)}
            {/* All needs no count: it's the sum of the others. */}
            {value !== 'all' ? (
              <Tabs.Count>
                {counts[value]}
                {isCountPartial(value) ? '+' : ''}
              </Tabs.Count>
            ) : null}
          </Tabs.Button>
        ))}
      </Tabs>
    </div>
  );
}

/** Writes the search after a pause in typing, or at once on Enter. */
function QueueSearch({
  query,
  onQueryChange,
}: {
  query: string | undefined;
  onQueryChange: (query: string | undefined) => void;
}) {
  const { t } = useTranslation(['cases']);
  const [text, setText] = useState(query ?? '');
  const latest = useRef({ onQueryChange, written: query });
  useEffect(() => {
    latest.current.onQueryChange = onQueryChange;
  });
  // Follow a search changed from elsewhere, such as Back, but not the echo of what was typed here.
  useEffect(() => {
    if (query === latest.current.written) return;
    latest.current.written = query;
    setText(query ?? '');
  }, [query]);

  useEffect(() => {
    const timer = window.setTimeout(() => writeQuery(latest.current, text), SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [text]);

  return (
    <SearchInput
      aria-label={t('cases:screening_review.search.label')}
      placeholder={t('cases:screening_review.search.placeholder')}
      value={text}
      onChange={setText}
      onEnterKeyDown={(value) => writeQuery(latest.current, value)}
    />
  );
}

function writeQuery(
  state: { onQueryChange: (query: string | undefined) => void; written: string | undefined },
  value: string,
) {
  const next = value.trim() || undefined;
  if (next === state.written) return;
  state.written = next;
  state.onQueryChange(next);
}
