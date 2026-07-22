import { Icon } from 'ui-icons';

type AiSuggestionReasonProps = {
  reason: string;
};

export const AiSuggestionReason = ({ reason }: AiSuggestionReasonProps) => {
  return (
    <div className="bg-surface-card border-grey-border border-l-purple-primary text-grey-primary text-small flex items-start gap-xs rounded-sm border border-l-2 p-sm">
      <Icon icon="wand" className="text-purple-primary size-4 shrink-0" />
      <p className="whitespace-pre-wrap">{reason}</p>
    </div>
  );
};
