import { Outcome } from '@app-builder/models/analytics';
import { OutcomeDto } from 'marble-api';

export const getOutcomeTranslationKey = (outcome: Outcome): `decisions:outcome.${OutcomeDto}` => {
  if (outcome === 'blockAndReview') {
    return 'decisions:outcome.block_and_review';
  }
  return `decisions:outcome.${outcome}`;
};
