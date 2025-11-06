import { DecisionsFilter, type Outcome, outcomeColors } from '@app-builder/models/analytics';
import { Icon } from 'ui-icons';

export function OutcomeFilter({
  decisions,
  onChange,
}: {
  decisions: DecisionsFilter;
  onChange: (decisions: DecisionsFilter) => void;
}) {
  const handleToggle = (key: Outcome) => {
    const newDecisions = new Map(decisions);
    newDecisions.set(key, !decisions.get(key));
    onChange(newDecisions);
  };

  const FilterItem = ({ label, outcome, checked }: { label: string; outcome: Outcome; checked: boolean }) => (
    <div
      className={`flex items-center gap-2 cursor-pointer flex-1 min-w-0 ${outcome === 'blockAndReview' ? 'min-w-40' : ''} ${!checked ? 'text-grey-50' : ''}`}
      onClick={() => handleToggle(outcome)}
    >
      <button
        className={
          'w-4 h-4 border border-grey-90 rounded-sm flex items-center justify-center hover:bg-grey-50 ' +
          (checked ? outcomeColors[outcome] : 'bg-transparent') +
          ' ' +
          outcomeColors[outcome]
        }
        style={{ backgroundColor: outcomeColors[outcome] }}
      ></button>
      <div className="flex items-center flex-1 whitespace-nowrap min-w-0">
        <span className="text-xs">{label}</span>
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 ml-4">
          {!checked && <Icon icon="eye-slash" className="w-4 h-4 text-gray-400" />}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-row gap-6`}>
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
