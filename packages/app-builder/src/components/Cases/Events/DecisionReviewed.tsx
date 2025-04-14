import { type DecisionReviewedEvent } from '@app-builder/models/cases';

export const DecisionReviewedDetail = (_: { event: DecisionReviewedEvent }) => {
  return <span>Decision reviewed</span>;
};
