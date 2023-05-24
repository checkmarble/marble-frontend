import { faker } from '@faker-js/faker';
import {
  type Decision,
  type getDecision as getDecisionAPI,
  type listDecisions as listDecisionsAPI,
} from '@marble-front/api/marble';

const fakeDecisions: Decision[] = Array.from({
  length: Number(faker.random.numeric(2)),
}).map(() => ({
  id: faker.datatype.uuid(),
  created_at: faker.date.recent().toISOString(),
  trigger_object: {
    type: faker.helpers.arrayElement(['transaction', 'user', undefined]),
  },
  trigger_object_type: faker.word.noun(),
  outcome: faker.helpers.arrayElement([
    'approve',
    'review',
    'reject',
    'null',
    'unknown',
  ]),
  scenario: {
    id: faker.datatype.uuid(),
    name: faker.random.words(),
    description: faker.random.words(7),
    version: Number(faker.random.numeric()),
  },
  rules: Array.from({ length: Number(faker.random.numeric()) }).map(() => ({
    name: faker.random.words(),
    description: faker.random.words(7),
    score_modifier: Number(faker.random.numeric(2)),
    result: Math.random() < 0.5,
  })),
  score: Number(faker.random.numeric(2)),
}));

export const listDecisions: typeof listDecisionsAPI = () =>
  Promise.resolve(fakeDecisions);

export const getDecision: typeof getDecisionAPI = (decisionId) => {
  const decision = fakeDecisions.find(({ id }) => decisionId === id);
  if (decision) return Promise.resolve(decision);
  return Promise.reject('NotFound');
};
