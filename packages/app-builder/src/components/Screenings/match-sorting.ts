import { isOpenSanctionTopic, type ScreeningMatch, type ScreeningMatchPayload } from '@app-builder/models/screening';
import { toOrderedTopic, topicCategoryPriority } from './TopicsDisplay';

function getDisplayedTopics(topics: string[]): string[] {
  const hasPepPrimary = topics.includes('pep.kind.primary');
  return topics.filter((topic) => !(hasPepPrimary && topic === 'pep.kind.secondary'));
}

function getMatchTopicPriority(entity: ScreeningMatchPayload): number {
  const topics = entity.properties?.['topics'] ?? [];
  if (topics.length === 0) return 999;

  const displayedTopics = getDisplayedTopics(topics);
  if (displayedTopics.length === 0) return 999;

  const minPriority = Math.min(
    ...displayedTopics.map((topic) => {
      const category = topic.split('.')[0] ?? '';
      return topicCategoryPriority[category] ?? 999;
    }),
  );

  return minPriority;
}

export function sortPayloadsByTopics(a: ScreeningMatchPayload, b: ScreeningMatchPayload): number {
  const aPriority = getMatchTopicPriority(a);
  const bPriority = getMatchTopicPriority(b);

  if (aPriority !== bPriority) {
    return aPriority - bPriority;
  }

  return b.score - a.score;
}

export function sortScreeningMatchesByTopics(a: ScreeningMatch, b: ScreeningMatch): number {
  const aPriority = getMatchTopicPriority(a.payload);
  const bPriority = getMatchTopicPriority(b.payload);

  if (aPriority !== bPriority) {
    return aPriority - bPriority;
  }

  return b.payload.score - a.payload.score;
}

function withEnrichedOpenSanctionTopics(payload: ScreeningMatchPayload): ScreeningMatchPayload {
  const topics = payload.properties?.['topics'];
  if (!topics) return payload;

  return {
    ...payload,
    properties: {
      ...payload.properties,
      topics: topics.map(toOrderedTopic),
    },
    // Cast required: ScreeningMatchPayload['properties'] intersects entity arrays
    // with Record<string, string[]>, an internally contradictory type.
  } as unknown as ScreeningMatchPayload;
}

export function getSortedPayloadByTopics(payloads: ScreeningMatchPayload[]): ScreeningMatchPayload[] {
  const allTopics = new Set(payloads.flatMap((payload) => payload.properties?.['topics'] ?? []));
  const isOpenSanctions = Array.from(allTopics).every(isOpenSanctionTopic);

  if (!isOpenSanctions) {
    return payloads.toSorted(sortPayloadsByTopics);
  }

  return payloads.toSorted((a, b) =>
    sortPayloadsByTopics(withEnrichedOpenSanctionTopics(a), withEnrichedOpenSanctionTopics(b)),
  );
}
