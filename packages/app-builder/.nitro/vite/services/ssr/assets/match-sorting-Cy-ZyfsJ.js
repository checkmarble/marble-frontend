import { bc as isOpenSanctionTopic } from "./services-middleware-DR8Hua1Y.js";
import { t as toOrderedTopic, a as topicCategoryPriority } from "./FreeformMatchCard-JGOBIPO0.js";
function getDisplayedTopics(topics) {
  const hasPepPrimary = topics.includes("pep.kind.primary");
  return topics.filter((topic) => !(hasPepPrimary && topic === "pep.kind.secondary"));
}
function getMatchTopicPriority(entity) {
  const topics = entity.properties?.["topics"] ?? [];
  if (topics.length === 0) return 999;
  const displayedTopics = getDisplayedTopics(topics);
  if (displayedTopics.length === 0) return 999;
  const minPriority = Math.min(
    ...displayedTopics.map((topic) => {
      const category = topic.split(".")[0] ?? "";
      return topicCategoryPriority[category] ?? 999;
    })
  );
  return minPriority;
}
function sortPayloadsByTopics(a, b) {
  const aPriority = getMatchTopicPriority(a);
  const bPriority = getMatchTopicPriority(b);
  if (aPriority !== bPriority) {
    return aPriority - bPriority;
  }
  return b.score - a.score;
}
const matchStatusPriority = {
  confirmed_hit: 0,
  pending: 1,
  no_hit: 2,
  skipped: 2
};
function getMatchStatusPriority(status) {
  return matchStatusPriority[status] ?? 1;
}
function sortScreeningMatchesByTopics(a, b) {
  const aStatus = getMatchStatusPriority(a.status);
  const bStatus = getMatchStatusPriority(b.status);
  if (aStatus !== bStatus) {
    return aStatus - bStatus;
  }
  const aPriority = getMatchTopicPriority(a.payload);
  const bPriority = getMatchTopicPriority(b.payload);
  if (aPriority !== bPriority) {
    return aPriority - bPriority;
  }
  return b.payload.score - a.payload.score;
}
function withEnrichedOpenSanctionTopics(payload) {
  const topics = payload.properties?.["topics"];
  if (!topics) return payload;
  return {
    ...payload,
    properties: {
      ...payload.properties,
      topics: topics.map(toOrderedTopic)
    }
    // Cast required: ScreeningMatchPayload['properties'] intersects entity arrays
    // with Record<string, string[]>, an internally contradictory type.
  };
}
function getSortedPayloadByTopics(payloads) {
  const allTopics = new Set(payloads.flatMap((payload) => payload.properties?.["topics"] ?? []));
  const isOpenSanctions = Array.from(allTopics).every(isOpenSanctionTopic);
  if (!isOpenSanctions) {
    return payloads.toSorted(sortPayloadsByTopics);
  }
  return payloads.toSorted(
    (a, b) => sortPayloadsByTopics(withEnrichedOpenSanctionTopics(a), withEnrichedOpenSanctionTopics(b))
  );
}
export {
  getSortedPayloadByTopics as g,
  sortScreeningMatchesByTopics as s
};
