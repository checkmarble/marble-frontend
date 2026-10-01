import type { MotivaMatchResult, MotivaProperties } from '@bo/schemas/screenings';

export type MotivaPropertyEntry = {
  property: string;
  values: string[];
};

export type MotivaComparison = {
  key: string;
  label: string;
  submitted: MotivaPropertyEntry[];
  candidate: MotivaPropertyEntry[];
  explanations: Array<[string, MotivaMatchResult['explanations'][string]]>;
};

type PropertyGroup = {
  key: string;
  label: string;
  properties: ReadonlySet<string>;
  explanationMatches: (name: string) => boolean;
};

const group = (
  key: string,
  label: string,
  properties: string[],
  explanationMatches: (name: string) => boolean,
): PropertyGroup => ({ key, label, properties: new Set(properties), explanationMatches });

// FollowTheMoney compares compatible properties by their property type. These
// groups cover the matchable properties used by Marble's supported FTM entities.
const PROPERTY_GROUPS: PropertyGroup[] = [
  group(
    'names',
    'Names',
    [
      'name',
      'alias',
      'previousName',
      'weakAlias',
      'abbreviation',
      'firstName',
      'middleName',
      'lastName',
      'fatherName',
      'motherName',
      'nameSuffix',
    ],
    (name) => name.includes('name') || name.includes('alias'),
  ),
  group(
    'countries',
    'Countries',
    ['country', 'nationality', 'birthCountry', 'citizenship', 'jurisdiction', 'mainCountry', 'flag', 'pastFlags'],
    (name) => name.includes('country'),
  ),
  group(
    'dates',
    'Dates',
    [
      'birthDate',
      'deathDate',
      'incorporationDate',
      'dissolutionDate',
      'buildDate',
      'registrationDate',
      'deregistrationDate',
      'nameChangeDate',
    ],
    (name) => name.startsWith('dob_') || name.includes('date'),
  ),
  group(
    'identifiers',
    'Identifiers',
    [
      'idNumber',
      'passportNumber',
      'socialSecurityNumber',
      'registrationNumber',
      'taxNumber',
      'vatCode',
      'licenseNumber',
      'leiCode',
      'isinCode',
      'bvdId',
      'ogrnCode',
      'innCode',
      'bicCode',
      'imoNumber',
      'mmsi',
      'crsNumber',
      'callSign',
      'serialNumber',
      'icaoCode',
    ],
    (name) =>
      name.includes('identifier') ||
      name.includes('code_match') ||
      name.includes('imo_mmsi') ||
      name.includes('security_match'),
  ),
  group('emails', 'Email addresses', ['email'], (name) => name.includes('email')),
  group('phones', 'Phone numbers', ['phone'], (name) => name.includes('phone')),
  group('websites', 'Websites', ['website'], (name) => name.includes('url') || name.includes('website')),
  group('addresses', 'Addresses', ['address'], (name) => name.includes('address')),
  group('gender', 'Gender', ['gender'], (name) => name.includes('gender')),
];

const groupForProperty = (property: string): PropertyGroup =>
  PROPERTY_GROUPS.find((candidate) => candidate.properties.has(property)) ??
  group(`property:${property}`, humanizeFtmProperty(property), [property], () => false);

export function humanizeFtmProperty(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (firstLetter) => firstLetter.toUpperCase());
}

export function buildMotivaComparisons(
  submittedProperties: MotivaProperties,
  candidateProperties: MotivaProperties = {},
  explanations: MotivaMatchResult['explanations'] = {},
): MotivaComparison[] {
  const comparisons = new Map<string, MotivaComparison>();

  for (const [property, values] of Object.entries(submittedProperties)) {
    if (values.length === 0) continue;

    const propertyGroup = groupForProperty(property);
    const comparison = comparisons.get(propertyGroup.key) ?? {
      key: propertyGroup.key,
      label: propertyGroup.label,
      submitted: [],
      candidate: [],
      explanations: [],
    };
    comparison.submitted.push({ property, values });
    comparisons.set(propertyGroup.key, comparison);
  }

  for (const comparison of comparisons.values()) {
    const propertyGroup = groupForProperty(comparison.submitted[0]?.property ?? '');
    comparison.candidate = Object.entries(candidateProperties)
      .filter(([property, values]) => values.length > 0 && groupForProperty(property).key === comparison.key)
      .map(([property, values]) => ({ property, values }));
    comparison.explanations = Object.entries(explanations)
      .filter(
        ([name, explanation]) =>
          propertyGroup.explanationMatches(name) &&
          (explanation.score !== undefined || explanation.weighted !== undefined),
      )
      .sort(([, left], [, right]) => (right.weighted ?? right.score ?? 0) - (left.weighted ?? left.score ?? 0));
  }

  return [...comparisons.values()];
}
