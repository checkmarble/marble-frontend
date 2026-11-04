import type { TracfinSelection } from '@app-builder/models/tracfin';

/** Every TRACFIN query key starts with `['tracfin']`, so `invalidateQueries({ queryKey: ['tracfin'] })` reaches all of them. */
export const tracfinKeys = {
  catalog: () => ['tracfin', 'catalog'] as const,
  configuration: () => ['tracfin', 'configuration'] as const,
  context: (caseId: string) => ['tracfin', 'case', caseId, 'context'] as const,
  draft: (caseId: string) => ['tracfin', 'case', caseId, 'draft'] as const,
  navigation: (caseId: string, selection: TracfinSelection, stepId: string, limit?: number) =>
    ['tracfin', 'case', caseId, 'navigation', stepId, selection, limit ?? null] as const,
};
