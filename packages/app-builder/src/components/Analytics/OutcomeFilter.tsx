import { OUTCOME_COLORS, outcomes } from '@app-builder/constants/analytics';
import { DecisionsFilter, type Outcome } from '@app-builder/models/analytics';
import { getOutcomeTranslationKey } from '@app-builder/utils/analytics';
import { MutableRefObject, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function OutcomeFilter({
  decisions,
  highlight = false,
  onChange,
}: {
  decisions: DecisionsFilter;
  highlight: boolean;
  onChange: (decisions: DecisionsFilter) => void;
}) {
  const hasHighlightedRef = useRef(false);
  const { t } = useTranslation(['analytics', 'decisions']);

  useEffect(() => {
    if (!highlight) {
      hasHighlightedRef.current = false;
    }
  }, [highlight]);

  const handleToggle = (key: Outcome) => {
    const newDecisions = new Map(decisions);
    newDecisions.set(key, !decisions.get(key));
    hasHighlightedRef.current = true;
    onChange(newDecisions);
  };

  return (
    <div className="flex flex-row gap-6 select-none">
      {outcomes.map((outcome: Outcome) => (
        <FilterItem
          handleToggle={handleToggle}
          label={t(getOutcomeTranslationKey(outcome))}
          outcome={outcome}
          checked={decisions.get(outcome) ?? false}
          highlight={highlight}
          hasHighlightedRef={hasHighlightedRef}
        />
      ))}
    </div>
  );
}

const FilterItem = ({
  label,
  outcome,
  checked,
  handleToggle,
  highlight,
  hasHighlightedRef,
}: {
  label: string;
  outcome: Outcome;
  checked: boolean;
  handleToggle: (outcome: Outcome) => void;
  highlight: boolean;
  hasHighlightedRef: MutableRefObject<boolean>;
}) => (
  <div
    className={cn('flex items-center gap-2 cursor-pointer flex-1 min-w-fit', { 'opacity-50': !checked })}
    onClick={() => handleToggle(outcome)}
  >
    <button
      className={cn('w-4 h-4 border border-grey-90 rounded-sm flex items-center justify-center hover:bg-grey-50')}
      style={{ backgroundColor: OUTCOME_COLORS[outcome] }}
    ></button>
    <div className="flex items-center flex-1 whitespace-nowrap min-w-0">
      <span className="text-xs">{label}</span>
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 lg-analytics:ml-4 ml-0 relative">
        {highlight && !hasHighlightedRef.current ? (
          <Icon
            icon={checked ? 'eye' : 'eye-slash'}
            className={cn('absolute size-4 animate-ping-once', checked ? 'text-blue-58' : 'text-grey-50')}
          />
        ) : null}
        {highlight || !checked ? (
          <Icon
            icon={checked ? 'eye' : 'eye-slash'}
            className={cn('relative size-4', checked ? 'text-blue-58' : 'text-grey-50')}
          />
        ) : null}
      </div>
    </div>
  </div>
);
