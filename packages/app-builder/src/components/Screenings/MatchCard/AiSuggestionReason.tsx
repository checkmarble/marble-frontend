type AiSuggestionReasonProps = {
  reason: string;
};

export const AiSuggestionReason = ({ reason }: AiSuggestionReasonProps) => {
  return (
    <p className="border-l-purple-primary text-grey-primary text-s border-l-2 pl-sm whitespace-pre-wrap">{reason}</p>
  );
};
