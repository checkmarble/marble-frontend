import { type ScreeningMatchPayload } from '@app-builder/models/screening';

// Instructions given to the on-device summarizer for every entity.
export const ENTITY_SUMMARY_SHARED_CONTEXT =
  'You assist an AML / sanctions compliance analyst reviewing a screening match. ' +
  'Summarize the most significant risk facts about the screened entity: sanctions, political exposure, ' +
  'criminal or regulatory issues, roles, nationality and key dates.';

// +'Never mention the name of the entity, it is already displayed.';

const MAX_VALUE_LENGTH = 2500; //600;
const MAX_VALUES_PER_PROPERTY = 5;

// Properties of the screened entity worth summarizing, ordered by significance.
// Names, aliases, identifiers, addresses and URLs are deliberately left out.
const ENTITY_PROPERTIES: Array<[key: string, label: string]> = [
  ['position', 'Positions'],
  ['program', 'Programs'],
  ['classification', 'Classification'],
  ['sector', 'Sector'],
  ['status', 'Status'],
  ['legalForm', 'Legal form'],
  ['nationality', 'Nationality'],
  ['citizenship', 'Citizenship'],
  ['country', 'Countries'],
  ['jurisdiction', 'Jurisdiction'],
  ['mainCountry', 'Main country'],
  ['flag', 'Flag'],
  ['birthDate', 'Birth date'],
  ['birthPlace', 'Birth place'],
  ['deathDate', 'Death date'],
  ['incorporationDate', 'Incorporation date'],
  ['dissolutionDate', 'Dissolution date'],
  ['gender', 'Gender'],
  ['education', 'Education'],
  ['political', 'Political affiliation'],
  ['religion', 'Religion'],
  ['keywords', 'Keywords'],
  ['summary', 'Summary'],
  ['description', 'Description'],
  ['notes', 'Notes'],
];

const SANCTION_PROPERTIES: Array<[key: string, label: string]> = [
  ['authority', 'authority'],
  ['program', 'program'],
  ['country', 'country'],
  ['startDate', 'from'],
  ['endDate', 'until'],
  ['listingDate', 'listed'],
  ['reason', 'reason'],
  ['provisions', 'provisions'],
];

function truncate(value: string) {
  return value.length > MAX_VALUE_LENGTH ? `${value.slice(0, MAX_VALUE_LENGTH)}…` : value;
}

function stringValues(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const strings = values.filter((value): value is string => typeof value === 'string' && value.trim() !== '');
  return [...new Set(strings.map((value) => truncate(value.trim())))].slice(0, MAX_VALUES_PER_PROPERTY);
}

function relationshipKinds(entities: Array<{ properties: Record<string, unknown> }> | undefined) {
  return [...new Set(entities?.flatMap(({ properties }) => stringValues(properties['relationship'])) ?? [])];
}

function relationLine(label: string, entities: Array<{ properties: Record<string, unknown> }> | undefined) {
  if (!entities?.length) return null;
  const kinds = relationshipKinds(entities);
  return `${label}: ${entities.length}${kinds.length ? ` (${kinds.join(', ')})` : ''}`;
}

/**
 * Serializes the significant facts of an enriched screening entity into plain text for the summarizer.
 * Lines are ordered by significance so the input can be trimmed from the end when it exceeds the model quota.
 */
export function buildEntitySummaryInput(
  entity: ScreeningMatchPayload,
  formatTopic: (topic: string) => string = (topic) => topic,
): string {
  const { properties } = entity;
  const lines: string[] = [`Entity type: ${entity.schema}`];

  const topics = stringValues(properties['topics']);
  if (topics.length) lines.push(`Risk topics: ${topics.map(formatTopic).join(', ')}`);

  for (const sanction of properties.sanctions ?? []) {
    const details = SANCTION_PROPERTIES.flatMap(([key, label]) => {
      const values = stringValues(sanction.properties[key]);
      return values.length ? [`${label}: ${values.join(', ')}`] : [];
    });
    if (details.length) lines.push(`Sanction - ${details.join('; ')}`);
  }

  for (const [key, label] of ENTITY_PROPERTIES) {
    const values = stringValues(properties[key]);
    if (values.length) lines.push(`${label}: ${values.join(', ')}`);
  }

  const relations = [
    relationLine('Family members', [...(properties.familyPerson ?? []), ...(properties.familyRelative ?? [])]),
    relationLine('Associates', properties.associations),
    relationLine('Memberships', properties.membershipMember),
  ];
  lines.push(...relations.filter((line): line is string => line !== null));

  return lines.join('\n');
}
