import { type ScreeningMatch, type ScreeningMatchPayload } from '@app-builder/models/screening';

const topicCategoryPriority: Record<string, number> = {
  sanctions: 0,
  pep: 1,
  adverse_media: 2,
};

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
