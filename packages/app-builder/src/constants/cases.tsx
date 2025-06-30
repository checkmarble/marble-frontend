import { CaseEventType } from '@app-builder/models/cases';

export const DEFAULT_CASE_EVENT_TYPES_FILTER = [
  'comment_added',
  'file_added',
  'decision_reviewed',
] as const satisfies CaseEventType[];
