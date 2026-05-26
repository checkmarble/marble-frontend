import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { TopicTag } from './TopicTag';

const topicsPart1Order: Record<string, number> = {
  sanctions: 0,
  pep: 1,
  adverse_media: 2,
};

const secondaryPriority: Record<string, Record<string, number>> = {
  pep: { kind: 0, status: 1, category: 2 },
  adverse_media: { kind: 0, category: 1 },
};

export function sortTopics(topicA: string, topicB: string): number {
  const aParts = topicA.split('.');
  const bParts = topicB.split('.');
  const aPrefix = aParts[0] ?? '';
  const bPrefix = bParts[0] ?? '';

  const aOrder = topicsPart1Order[aPrefix] ?? 999;
  const bOrder = topicsPart1Order[bPrefix] ?? 999;

  if (aOrder !== bOrder) {
    return aOrder - bOrder;
  }

  const aSecondary = secondaryPriority[aPrefix]?.[aParts[1] ?? ''] ?? 999;
  const bSecondary = secondaryPriority[bPrefix]?.[bParts[1] ?? ''] ?? 999;

  return aSecondary - bSecondary;
}

interface TopicsDisplayProps {
  entity: ScreeningMatchPayload | { id: string; properties: { topics?: string[] } };
  containerClassName?: string;
}

export function getFilteredAndSortedTopics(topics: string[]): string[] {
  const hasPepPrimary = topics.includes('pep.kind.primary');
  return topics.filter((topic) => !(hasPepPrimary && topic === 'pep.kind.secondary')).sort(sortTopics);
}

export function TopicsDisplay({ entity, containerClassName }: TopicsDisplayProps) {
  const topics = entity.properties?.['topics'] ?? [];
  if (topics.length === 0) return null;

  const filteredTopics = getFilteredAndSortedTopics(topics);

  if (filteredTopics.length === 0) return null;

  return (
    <div className={containerClassName ?? 'flex flex-wrap gap-1'}>
      {filteredTopics.map((topic) => (
        <TopicTag key={`${entity.id}-${topic}`} topic={topic} />
      ))}
    </div>
  );
}
