import type { CaseDetail } from './cases';
import type {
  ContinuousScreening,
  ContinuousScreeningMarbleToScreeningEntity,
  ContinuousScreeningMatchPayload,
  ContinuousScreeningScreeningEntityToMarble,
} from './continuous-screening';

export function reviewPayload(id: string, name: string, score = 0.9): ContinuousScreeningMatchPayload {
  return {
    id,
    caption: name,
    schema: 'Person',
    match: true,
    score,
    properties: { name: [name], birthDate: ['1970-01-01'], topics: ['sanction'] },
    datasets: ['test'],
    target: true,
  };
}

export function objectReviewScreening(
  id = 'screening-1',
  customerId = 'alice',
): ContinuousScreeningMarbleToScreeningEntity {
  return {
    id,
    organizationId: 'org',
    continuousScreeningConfigId: 'config',
    continuousScreeningConfigStableId: 'stable',
    triggerType: 'object_added',
    objectType: 'people',
    objectId: customerId,
    objectInternalId: customerId,
    status: 'in_review',
    partial: false,
    numberOfMatches: 2,
    request: {
      searchInput: {
        queries: { customer: { schema: 'Person', properties: { name: [customerId === 'alice' ? 'Alice' : 'Bob'] } } },
      },
    },
    matches: [
      {
        id: `${id}-high`,
        continuousScreeningId: id,
        opensanctionEntityId: 'record-high',
        status: 'pending',
        payload: reviewPayload('record-high', 'List record A', 0.95),
        comments: [],
      },
      {
        id: `${id}-low`,
        continuousScreeningId: id,
        opensanctionEntityId: 'record-low',
        status: 'pending',
        payload: reviewPayload('record-low', 'List record B', 0.8),
        comments: [],
      },
    ],
  };
}

export function datasetReviewScreening(id = 'dataset-1'): ContinuousScreeningScreeningEntityToMarble {
  return {
    id,
    organizationId: 'org',
    continuousScreeningConfigId: 'config',
    continuousScreeningConfigStableId: 'stable',
    triggerType: 'dataset_updated',
    opensanctionEntityId: 'shared-list-record',
    opensanctionEntityPayload: {
      id: 'shared-list-record',
      caption: 'Shared list record',
      schema: 'Person',
      properties: { name: ['Shared list record'], topics: ['sanction'] },
      datasets: ['test'],
    },
    status: 'in_review',
    partial: false,
    numberOfMatches: 2,
    request: { searchInput: { queries: {} } },
    matches: [
      {
        id: `${id}-alice`,
        continuousScreeningId: id,
        objectType: 'people',
        objectId: 'alice',
        status: 'pending',
        payload: reviewPayload('customer-alice', 'Alice', 0.9),
        comments: [],
      },
      {
        id: `${id}-bob`,
        continuousScreeningId: id,
        objectType: 'people',
        objectId: 'bob',
        status: 'pending',
        payload: reviewPayload('customer-bob', 'Bob', 0.7),
        comments: [],
      },
    ],
  };
}

export function reviewCase(
  id: string,
  continuousScreenings: ContinuousScreening[] = [objectReviewScreening()],
  overrides: Partial<CaseDetail> = {},
): CaseDetail {
  return {
    id,
    type: 'continuous_screening',
    createdAt: '2026-11-01T10:00:00Z',
    decisionsCount: 0,
    name: `Case ${id}`,
    status: 'pending',
    inboxId: 'inbox',
    contributors: [],
    outcome: 'unset',
    tags: [],
    assignedTo: 'analyst',
    decisions: [],
    continuousScreenings,
    events: [],
    files: [],
    entities: [],
    ...overrides,
  };
}
