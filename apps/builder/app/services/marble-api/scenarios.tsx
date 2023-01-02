import type { PlainMessage } from '@bufbuild/protobuf';
import { faker } from '@faker-js/faker';
import type { Scenario } from '@marble-front/api/marble';

const fakeScenarios: PlainMessage<Scenario>[] = Array.from({
  length: 25,
}).map(() => {
  const versions = Array.from({
    length: Math.max(Math.floor(Math.random() * 10), 1),
  }).map((_) => ({
    id: faker.database.mongodbObjectId(),
    rules: Array.from({
      length: Math.max(Math.floor(Math.random() * 10), 1),
    }).map((_) => ({
      id: faker.database.mongodbObjectId(),
      name: faker.name.fullName(),
      description: faker.lorem.sentences(),
      orGroups: [],
    })),
  }));

  return {
    id: faker.database.mongodbObjectId(),
    name: faker.name.fullName(),
    description: faker.lorem.sentences(),
    mainTable: faker.name.lastName(),
    versions,
    activeVersion: versions?.[versions?.length - 1],
  };
});

export async function getScenarios() {
  return Promise.resolve(fakeScenarios);
}
