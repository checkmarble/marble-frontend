import { faker } from '@faker-js/faker/locale/en';

import {
  type DecisionDetailDto,
  type getDecision,
  type listDecisions,
} from '../generated/marble-api';

const fakeDecisions: DecisionDetailDto[] = Array.from({
  length: Number(faker.number.int(100)),
}).map(() => ({
  id: faker.string.uuid(),
  created_at: faker.date.recent().toISOString(),
  trigger_object: {
    type: faker.helpers.arrayElement(['transaction', 'user', undefined]),
  },
  trigger_object_type: faker.word.noun(),
  outcome: faker.helpers.arrayElement([
    'approve',
    'review',
    'decline',
    'null',
    'unknown',
  ]),
  pivot_values: [],
  scenario: {
    id: faker.string.uuid(),
    name: faker.word.noun(),
    description: faker.lorem.sentence(),
    version: Number(faker.number.int(10)),
    scenario_iteration_id: faker.string.uuid(),
  },
  rules: Array.from({ length: Number(faker.number.int(500)) }).map(() => ({
    rule_id: faker.string.uuid(),
    name: faker.word.noun(),
    description: faker.lorem.sentence(),
    score_modifier: Number(faker.number.int(100)),
    result: Math.random() < 0.5,
  })),
  score: Number(faker.number.int(100)),
}));

const fakeDecisionsWithPagination = {
  items: fakeDecisions,
  total_count: { value: fakeDecisions.length, is_max_count: false },
  start_index: 0,
  end_index: fakeDecisions.length,
};

export const listDecisionsFake: typeof listDecisions = () =>
  Promise.resolve(fakeDecisionsWithPagination);

export const getDecisionFake: typeof getDecision = (decisionId) => {
  const decision = fakeDecisions.find(({ id }) => decisionId === id);
  if (decision) return Promise.resolve(decision);
  return Promise.reject('NotFound');
};
