import { bu as SCREENING_CATEGORY_TO_DTO_SECTION } from "./services-middleware-DR8Hua1Y.js";
import { u as useTranslation } from "./format-NPGUXq-g.js";
const capitalize = (str) => {
  if (!str || str.length === 0)
    return "";
  const lower = str.toLowerCase();
  return lower.substring(0, 1).toUpperCase() + lower.substring(1, lower.length);
};
const SPECIAL_TOPICS = [
  {
    section: "peps",
    groupKey: "kind",
    name: "pep.kind.primary",
    title: "continuousScreening:topics.kind.primary"
  },
  {
    section: "peps",
    groupKey: "status",
    name: "pep.status.active",
    title: "continuousScreening:topics.status.exclude_inactive"
  }
];
function findInSection(section, kind, itemName) {
  if (kind === "dataset") {
    for (const dataset of section.datasets ?? []) {
      if (dataset.name === itemName) {
        return { name: dataset.name, title: dataset.title ?? dataset.name };
      }
    }
    return void 0;
  }
  for (const topicGroup of Object.values(section.topics ?? {})) {
    for (const topic of topicGroup ?? []) {
      if (topic.name === itemName) {
        return { name: topic.name, title: topic.title ?? topic.name };
      }
    }
  }
  return void 0;
}
function findDatasetOrTopicByKey(filters, key) {
  const normalizedKey = key?.trim() ?? "";
  if (normalizedKey === "" || !filters) return void 0;
  const [sectionKey, kind, ...rest] = normalizedKey.split(":");
  if (kind !== "dataset" && kind !== "topic") return void 0;
  const itemName = kind === "dataset" ? rest.join(":") : rest.slice(1).join(":");
  if (itemName === "") return void 0;
  const dtoSection = SCREENING_CATEGORY_TO_DTO_SECTION[sectionKey];
  const targetSection = filters.sections?.[dtoSection];
  if (targetSection) {
    const match = findInSection(targetSection, kind, itemName);
    if (match) return match;
  }
  if (kind === "topic") {
    for (const conditionalFilter of filters.conditional_filters ?? []) {
      for (const topic of conditionalFilter.topics ?? []) {
        if (topic.name === itemName) {
          return { name: topic.name, title: topic.title ?? topic.name };
        }
      }
    }
  }
  return void 0;
}
function findDatasetByName(filters, name) {
  const normalizedName = name?.trim() ?? "";
  if (normalizedName === "" || !filters) return void 0;
  for (const section of Object.values(filters)) {
    if (!section) continue;
    for (const group of section.datasets ?? []) {
      for (const dataset of group.datasets) {
        if (dataset.name === normalizedName) {
          return { name: dataset.name, title: dataset.title ?? dataset.name };
        }
      }
    }
  }
  return void 0;
}
function getSpecialTopicConfig(sectionKey, groupKey) {
  const normalized = groupKey.toLowerCase();
  return SPECIAL_TOPICS.find((t) => t.section === sectionKey && t.groupKey === normalized);
}
function isSpecialTopic(sectionKey, groupKey) {
  return getSpecialTopicConfig(sectionKey, groupKey) !== void 0;
}
function buildGlobalTopicConfig(groupKey, items) {
  const keys = items.map((i) => i.name);
  return {
    groupKey,
    keys,
    value: keys[1] ?? "",
    label: `screenings:freeform_search.global.${groupKey}`
  };
}
function getAvailableGlobalTopicConfigs(listConfig) {
  const globalTopics = listConfig.global?.topics;
  if (!globalTopics) return [];
  return Object.entries(globalTopics).filter(([, items]) => items.length >= 2).map(([groupKey, items]) => buildGlobalTopicConfig(groupKey, items));
}
function sortTopicGroupEntries(sectionKey, entries) {
  return [...entries].sort(([keyA], [keyB]) => {
    const aSpecial = isSpecialTopic(sectionKey, keyA);
    const bSpecial = isSpecialTopic(sectionKey, keyB);
    if (aSpecial !== bSpecial) return aSpecial ? -1 : 1;
    return keyA.localeCompare(keyB, void 0, { sensitivity: "base" });
  });
}
function getSpecialTopicLabel(sectionKey, groupKey) {
  return getSpecialTopicConfig(sectionKey, groupKey)?.title;
}
function getSpecialTopicValue(sectionKey, groupKey) {
  return getSpecialTopicConfig(sectionKey, groupKey)?.name ?? groupKey;
}
function getSectionLeafKeys(section, sectionKey) {
  const datasetKeys = (section.datasets ?? []).flatMap((g) => g.datasets.map((d) => `${sectionKey}:dataset:${d.name}`));
  const topicKeys = Object.entries(section.topics ?? {}).flatMap(
    ([group, items]) => items.map((i) => `${sectionKey}:topic:${group}:${i.name}`)
  );
  const conditionalTopicKeys = Object.entries(section.conditionalTopics ?? {}).flatMap(
    ([group, ct]) => ct.items.map((i) => `${sectionKey}:topic:${group}:${i.name}`)
  );
  return [.../* @__PURE__ */ new Set([...datasetKeys, ...topicKeys, ...conditionalTopicKeys])];
}
function getDatasetNames(section) {
  return (section.datasets ?? []).flatMap((g) => g.datasets.map((d) => d.name));
}
const FILTER_TRANSLATION_MAP = {
  "filter.pep.category.govt_branch_member": "continuousScreening:filter.pep.category.govt_branch_member",
  "filter.pep.category.family_member": "continuousScreening:filter.pep.category.family_member",
  "filter.pep.category.manager_state_owned_enterprise": "continuousScreening:filter.pep.category.manager_state_owned_enterprise",
  "filter.pep.category.legislature": "continuousScreening:filter.pep.category.legislature",
  "filter.pep.category.state_owned_enterprise": "continuousScreening:filter.pep.category.state_owned_enterprise",
  "filter.pep.category.diplomat": "continuousScreening:filter.pep.category.diplomat",
  "filter.pep.category.judiciary": "continuousScreening:filter.pep.category.judiciary",
  "filter.pep.category.senior_party_member": "continuousScreening:filter.pep.category.senior_party_member",
  "filter.pep.category.associate": "continuousScreening:filter.pep.category.associate",
  "filter.pep.category.pep_controlled_business": "continuousScreening:filter.pep.category.pep_controlled_business",
  "filter.pep.category.intl_org_leadership": "continuousScreening:filter.pep.category.intl_org_leadership",
  "filter.pep.category.military": "continuousScreening:filter.pep.category.military",
  "filter.pep.category.law_enforce_authority": "continuousScreening:filter.pep.category.law_enforce_authority",
  "filter.pep.category.ngo_leadership": "continuousScreening:filter.pep.category.ngo_leadership",
  "filter.pep.category.chief_of_state": "continuousScreening:filter.pep.category.chief_of_state",
  "filter.pep.category.intelligence": "continuousScreening:filter.pep.category.intelligence",
  "filter.pep.category.manager_sovereign_wealth_fund": "continuousScreening:filter.pep.category.manager_sovereign_wealth_fund",
  "filter.pep.category.traditional_leadership": "continuousScreening:filter.pep.category.traditional_leadership",
  "filter.pep.category.union_leadership": "continuousScreening:filter.pep.category.union_leadership",
  "filter.pep.category.attorney": "continuousScreening:filter.pep.category.attorney",
  "filter.alive": "continuousScreening:filter.alive",
  "filter.deceased": "continuousScreening:filter.deceased",
  eu: "continuousScreening:dataset.eu",
  as: "continuousScreening:dataset.as",
  oc: "continuousScreening:dataset.oc",
  af: "continuousScreening:dataset.af",
  na: "continuousScreening:dataset.na",
  sa: "continuousScreening:dataset.sa",
  un: "continuousScreening:dataset.un"
};
function useDatasetTitle() {
  const { t } = useTranslation("continuousScreening");
  function formatDatasetTitle(title) {
    const last = title.includes(":") ? title.split(":").at(-1) ?? title : title.includes(".") ? title.split(".").at(-1) ?? title : title;
    const translation = hasTranslation(last);
    if (translation) return t(translation);
    return capitalize(last.replace(/_/g, " "));
  }
  function formatTopicLabel(label) {
    return label.split(".").at(-1) ?? label;
  }
  function hasTranslation(key) {
    const hasKey = Object.keys(FILTER_TRANSLATION_MAP).includes(key);
    return hasKey ? FILTER_TRANSLATION_MAP[key] : void 0;
  }
  function formatItemName(item) {
    const label = item.title ?? item.name;
    if (label.startsWith("continuousScreening:")) {
      return t(label.slice("continuousScreening:".length));
    }
    const translation = hasTranslation(label);
    if (translation) return t(translation);
    const last = label.split(".").at(-1) ?? label;
    return capitalize(last);
  }
  return { formatDatasetTitle, formatTopicLabel, hasTranslation, formatItemName, t };
}
export {
  getAvailableGlobalTopicConfigs as a,
  getDatasetNames as b,
  getSpecialTopicValue as c,
  getSpecialTopicLabel as d,
  findDatasetOrTopicByKey as e,
  findDatasetByName as f,
  getSectionLeafKeys as g,
  capitalize as h,
  isSpecialTopic as i,
  sortTopicGroupEntries as s,
  useDatasetTitle as u
};
