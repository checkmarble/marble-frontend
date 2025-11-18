import { DecisionsFilter, type Outcome } from '@app-builder/models/analytics';
import { OUTCOME_COLORS } from '@app-builder/routes/_builder+/_analytics+/analytics.$scenarioId';
import { useRef } from 'react';
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
  const hasHighlightedRef = useRef<boolean>(highlight);

  const handleToggle = (key: Outcome) => {
    const newDecisions = new Map(decisions);
    newDecisions.set(key, !decisions.get(key));
    hasHighlightedRef.current = true;
    onChange(newDecisions);
  };
  const FilterItem = ({ label, outcome, checked }: { label: string; outcome: Outcome; checked: boolean }) => (
    <div className={cn('flex items-center gap-2 cursor-pointer flex-1 min-w-40')} onClick={() => handleToggle(outcome)}>
      <button
        className={
          'w-4 h-4 border border-grey-90 rounded-sm flex items-center justify-center hover:bg-grey-50 ' +
          (checked ? OUTCOME_COLORS[outcome] : 'bg-transparent') +
          ' ' +
          OUTCOME_COLORS[outcome]
        }
        style={{ backgroundColor: OUTCOME_COLORS[outcome] }}
      ></button>
      <div className="flex items-center flex-1 whitespace-nowrap min-w-0">
        <span className="text-xs">{label}</span>
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 ml-4 relative">
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

  return (
    <div className="flex flex-row gap-6 select-none">
      <FilterItem label="Approve" outcome="approve" checked={decisions.get('approve') ?? false} />
      <FilterItem label="Review" outcome="review" checked={decisions.get('review') ?? false} />
      <FilterItem
        label="Block and Review"
        outcome="blockAndReview"
        checked={decisions.get('blockAndReview') ?? false}
      />
      <FilterItem label="Decline" outcome="decline" checked={decisions.get('decline') ?? false} />
    </div>
  );
}
