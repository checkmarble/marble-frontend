import { AIText } from 'ui-design-system';
import { Icon } from 'ui-icons';

type AiSuggestionReasonProps = {
  reason: string;
};

export const AiSuggestionReason = ({ reason }: AiSuggestionReasonProps) => {
  return (
    <div className="flex items-start gap-xs">
      <Icon icon="wand" className="text-purple-primary mt-xs size-4 shrink-0" />
      <AIText text={reason} className="flex-1" />
    </div>
  );
};
