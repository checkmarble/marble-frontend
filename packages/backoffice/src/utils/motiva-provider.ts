import type { SCREENING_PROVIDERS } from '@bo/schemas/screenings';

export type ScreeningProvider = (typeof SCREENING_PROVIDERS)[number];

export const SCREENING_PROVIDER_LABELS: Record<ScreeningProvider, string> = {
  opensanctions: 'OpenSanctions',
  lexisnexis: 'LexisNexis',
};

export function getMotivaMatchDataset(provider: ScreeningProvider | undefined) {
  return provider === 'lexisnexis' ? 'lexisnexis' : 'default';
}
