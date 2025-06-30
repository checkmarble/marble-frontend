import { CaseEventType } from '@app-builder/models/cases';

export const CASE_EVENT_CATEGORIES = [
  'case_review_action',
  'case_assignation',
  'sar_related',
  'others',
] as const;

export type CaseEventCategory = (typeof CASE_EVENT_CATEGORIES)[number];

export const CASE_EVENT_CATEGORY_TO_EVENTS_MAPPING = {
  others: [
    'case_created',
    'decision_reviewed',
    'name_updated',
    'tags_updated',
    'status_updated',
    'case_snoozed',
    'case_unsnoozed',
    'rule_snooze_created',
    'outcome_updated',
  ],
  case_assignation: ['inbox_changed', 'case_assigned'],
  sar_related: ['sar_created', 'sar_deleted', 'sar_status_changed', 'sar_file_uploaded'],
  case_review_action: ['comment_added', 'file_added', 'decision_reviewed', 'entity_annotated'],
} as const satisfies Record<CaseEventCategory, CaseEventType[]>;

export const DEFAULT_CASE_EVENT_CATEGORIES_FILTER = [
  'case_review_action',
] as const satisfies CaseEventCategory[];
