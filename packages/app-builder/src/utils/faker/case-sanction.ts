import { faker } from '@faker-js/faker';

export type SanctionCheck = {
  id: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  status: 'confirmed_hit' | 'in_review' | 'error';
  searchInput: Record<string, any>;
  searchDatasets: string[];
  searchThreshold: number;
  isManual: boolean;
  requestedBy: string | null;
  decisionId: string;
  matches: SanctionCheckMatch[];
};

export type SanctionCheckMatch = {
  id: string;
  createdAt: string;
  updatedAt: string;
  sanctionCheckId: string;
  opensanctionEntityId: string;
  status: 'pending' | 'confirmed_hit' | 'no_hit';
  reviewedBy: string | null;
  payload: PersonEntity;
  queryIds: string[];
  comments: SanctionCheckMatchComment[];
};

export type SanctionCheckMatchComment = {
  id: string;
  sanctionCheckMatchId: string;
  createdAt: string;
  comment: string;
  commentedBy?: string;
};

export type EntityProperties<T extends string> = Record<T, string[]>;

export const personEntityProperties = [
  'topics',
  'name',
  'position',
  'religion',
  'alias',
  'birthDate',
  'website',
  'sourceUrl',
  'lastName',
  'gender',
  'education',
  'modifiedAt',
  'firstName',
  'nationality',
  'country',
  'keywords',
  'wikidataId',
  'notes',
  'birthPlace',
  'citizenship',
  'birthCountry',
] as const;

export type PersonProperty = (typeof personEntityProperties)[number];

export type PersonEntity = {
  id: string;
  caption: string;
  schema: 'Person';
  properties: EntityProperties<(typeof personEntityProperties)[number]>;
};

export function createRandomSanctionCheck(decisionId: string, matchCount: number = 1): SanctionCheck {
  const id = faker.string.uuid();
  const createdAt = faker.date.recent().toISOString();

  return {
    id,
    createdAt,
    updatedAt: createdAt,
    isArchived: false,
    status: faker.helpers.arrayElement(['confirmed_hit', 'in_review', 'error']),
    searchInput: {},
    searchDatasets: [],
    searchThreshold: 0,
    isManual: false,
    requestedBy: null,
    decisionId,
    matches: faker.helpers.multiple(() => createRandomSanctionCheckMatch(id), {
      count: matchCount,
    }),
  };
}

export function createRandomSanctionCheckMatch(sanctionCheckId: string): SanctionCheckMatch {
  const createdAt = faker.date.recent().toISOString();
  const entityId = faker.string.alphanumeric({
    length: { min: 3, max: 20 },
  });

  return {
    id: faker.string.uuid(),
    createdAt,
    updatedAt: createdAt,
    sanctionCheckId,
    opensanctionEntityId: entityId,
    status: faker.helpers.arrayElement(['pending', 'confirmed_hit', 'no_hit']),
    reviewedBy: null,
    payload: createRandomPersonEntity(entityId),
    queryIds: [],
    comments: [],
  };
}

export function createRandomPersonEntity(entityId: string): PersonEntity {
  const sex = faker.person.sex() as 'female' | 'male';

  return {
    id: entityId,
    caption: faker.person.fullName(),
    schema: 'Person',
    properties: {
      ...createProperty('topics', () => `role:${faker.string.alpha({ length: { min: 2, max: 5 } })}`),
      ...createProperty('name', () => faker.person.fullName({ sex })),
      ...createProperty('position', () => faker.person.jobTitle()),
      ...createProperty('religion', () => faker.person.zodiacSign()),
      ...createProperty('alias', () => faker.person.fullName({ sex })),
      ...createProperty('birthDate', () => faker.date.past().toISOString()),
      ...createProperty('website', () => faker.internet.url(), {
        min: 1,
        max: 3,
      }),
      ...createProperty('sourceUrl', () => faker.internet.url(), 1),
      ...createProperty('lastName', () => faker.person.lastName(sex)),
      ...createProperty('gender', () => sex, 1),
      ...createProperty('education', () => faker.person.fullName()), //
      ...createProperty('modifiedAt', () => faker.date.past().toISOString(), 3),
      ...createProperty('firstName', () => faker.person.firstName(sex)),
      ...createProperty('nationality', () => faker.location.countryCode()),
      ...createProperty('country', () => faker.location.countryCode()),
      ...createProperty('keywords', () => faker.person.fullName()),
      ...createProperty('wikidataId', () => faker.string.alphanumeric(), 1),
      ...createProperty('notes', () => faker.person.bio(), { min: 1, max: 5 }),
      ...createProperty('birthPlace', () => faker.location.city()),
      ...createProperty('citizenship', () => faker.location.countryCode()),
      ...createProperty('birthCountry', () => faker.location.countryCode()),
    },
  };
}

export function createProperty<P extends string>(name: P, fn: () => string, count: number | { min: number; max: number } = { min: 1, max: 40 }): { [k in P]: string[] } {
  return {
    [name]: faker.helpers.multiple(fn, { count }),
  } as { [k in P]: string[] };
}

export const fakeSanctionCheck = createRandomSanctionCheck('to_replace', 3);

export const getSanctionCheckForDecision = (decisionId: string) => {
  return { ...fakeSanctionCheck, decisionId };
};
