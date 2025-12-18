import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { b as getEnrichedDataFn } from "./screenings-CS8peAlI.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { e as Icon, d as cn, u as useTranslation, j as Tag, q as useFormatLanguage, ed as formatDuration, B as Button, e4 as Modal, ee as ExpandableGroupTagLine, eb as Collapsible } from "./format-NPGUXq-g.js";
import { D as DateBirthdateComponent, a as StringCountryComponent, S as StringCodeComponent } from "./DataField-vckdVtrg.js";
import { u as useDatasetTitle, f as findDatasetByName } from "./dataset-utils-C1Lb7jdi.js";
import { c as classifyBirthDate, g as getAgeYears, a as getBirthDateRange, d as detectNativeScript, H as HighlightText, f as formatBirthDateRange, b as getSanctionEntityProperties, m as mergeAddresses, e as createPropertyTransformer, i as isScriptTaggedProperty, h as isPropertyListed, j as getPersonName, k as cleanUrl, l as hasDisplayableName } from "./screening-entity-DVQtf50p.js";
import { s as screeningsI18n } from "./router-vb7i5euz.js";
import { u as useListConfigQuery } from "./lists-config-CsQWGvXL.js";
import { aE as getDateFnsLocale, bc as isOpenSanctionTopic, bd as openSanctionsTopicToColor, be as isLexisTopic, bf as lexisTopicToColor, bg as lexisTopicIgnoreDisplay, bh as getCategoryForTopic, bi as n } from "./services-middleware-DR8Hua1Y.js";
function EntityDatasetsList({ datasets, useCase, listClassName, itemClassName }) {
  const listConfigQuery = useListConfigQuery(useCase);
  const { formatItemName } = useDatasetTitle();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: listClassName, children: datasets.map((name, index) => {
    const found = findDatasetByName(listConfigQuery.data?.filters, name);
    const label = found ? formatItemName(found) : name;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: itemClassName, children: label }, `dataset-${name}-${index}`);
  }) });
}
function ParseAlias({ value, highlightText }) {
  const language = useFormatLanguage();
  const { t } = useTranslation(screeningsI18n);
  const script = detectNativeScript(value, language);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-sm", children: [
    script ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "white", size: "small", appearance: "monospace", children: t("screenings:entity.property.native_script", { script }) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(HighlightText, { text: value, highlight: highlightText })
  ] });
}
function ParseAddress({ address }) {
  const { t } = useTranslation(screeningsI18n);
  const notesLabel = address.properties.notes ?? t("screenings:entity.property.address.notes.associated", { defaultValue: "Associated" });
  const cityLabel = [address.properties.postalCode, address.properties.city].filter(Boolean).join(" ").trim();
  const segments = [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "white", size: "small", appearance: "monospace", children: notesLabel }, "notes"),
    address.properties.street ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: address.properties.street }, "street") : null,
    cityLabel ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: cityLabel }, "city") : null,
    address.properties.country ? StringCountryComponent({ value: address.properties.country, withCountryName: true }) : null
  ].filter((segment) => segment !== null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, { dark: true, spaced: true }),
    segments.map((segment, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm me-sm", children: [
      segment,
      index < segments.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, {}) : null
    ] }, index))
  ] });
}
function IconDot({ dark, spaced }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Icon,
    {
      icon: "dot",
      className: cn(
        "text-grey-border size-4 shrink-0 inline-block",
        dark && "text-grey-secondary opacity-100",
        spaced && "mx-sm",
        dark && spaced && "ms-0"
      )
    }
  );
}
function ApproximativeAge({ ageYears, range }) {
  const language = useFormatLanguage();
  const { t } = useTranslation(screeningsI18n);
  const formatted = formatDuration(
    { years: Math.max(0, Math.round(ageYears)) },
    { locale: getDateFnsLocale(language) }
  );
  const rangeLabel = range ? formatBirthDateRange(range, language, t) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-secondary text-xs", children: [
    "~",
    formatted,
    rangeLabel ? ` ${rangeLabel}` : null
  ] }) });
}
function BirthdDateAverage({ values }) {
  const classified = values.map((value) => ({ value, kind: classifyBirthDate(value) })).filter(
    (entry) => entry.kind !== null
  );
  if (classified.length === 0) {
    const fallback = values[0];
    return fallback ? DateBirthdateComponent({ value: fallback }) : null;
  }
  if (classified.length === 1) {
    const entry = classified[0];
    if (entry.kind === "full") {
      return DateBirthdateComponent({ value: entry.value });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ApproximativeAge, { ageYears: getAgeYears(entry.value, entry.kind), range: null });
  }
  const averageAge = classified.reduce((sum, { value, kind }) => sum + getAgeYears(value, kind), 0) / classified.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ApproximativeAge, { ageYears: averageAge, range: getBirthDateRange(classified) });
}
function isDisplayableTopic(topic) {
  if (topic.startsWith("filter.")) return false;
  if (isLexisTopic(topic) && lexisTopicIgnoreDisplay(topic)) return false;
  return true;
}
const TopicTag = ({ topic, className }) => {
  const { t } = useTranslation(["screeningTopics"]);
  if (!isDisplayableTopic(topic)) {
    return null;
  }
  if (isOpenSanctionTopic(topic)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: openSanctionsTopicToColor(topic), className, children: t(`screeningTopics:os.${topic}`, { defaultValue: topic }) });
  }
  if (isLexisTopic(topic)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: lexisTopicToColor(topic), className, children: t(`screeningTopics:lexis.${topic}`, { defaultValue: topic }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", className, children: topic });
};
const topicCategoryPriority = {
  sanctions: 0,
  pep: 1,
  adverse_media: 2,
  custom: 3
};
const secondaryPriority = {
  pep: { kind: 0, status: 1, category: 2 },
  adverse_media: { kind: 0, category: 1 }
};
function sortTopics(topicA, topicB) {
  const aParts = topicA.split(".");
  const bParts = topicB.split(".");
  const aPrefix = aParts[0] ?? "";
  const bPrefix = bParts[0] ?? "";
  const aOrder = topicCategoryPriority[aPrefix] ?? 999;
  const bOrder = topicCategoryPriority[bPrefix] ?? 999;
  if (aOrder !== bOrder) {
    return aOrder - bOrder;
  }
  const aSecondary = secondaryPriority[aPrefix]?.[aParts[1] ?? ""] ?? 999;
  const bSecondary = secondaryPriority[bPrefix]?.[bParts[1] ?? ""] ?? 999;
  return aSecondary - bSecondary;
}
const TOPIC_ORDER = {
  sanctions: "sanctions",
  peps: "pep",
  "adverse-media": "adverse_media",
  custom: "custom",
  "third-parties": "",
  global: ""
};
function toOrderedTopic(topic) {
  return `${TOPIC_ORDER[getCategoryForTopic(topic) ?? "third-parties"]}.${topic}`;
}
function getFilteredAndSortedTopics(topics) {
  if (topics.every(isOpenSanctionTopic)) {
    const topicsWithCategory = new Set(topics.map(toOrderedTopic));
    const sorted = Array.from(topicsWithCategory).toSorted(sortTopics);
    return sorted.map((sortedTopic) => {
      const dot = sortedTopic.indexOf(".");
      return sortedTopic.slice(dot + 1);
    });
  }
  const hasPepPrimary = topics.includes("pep.kind.primary");
  return topics.filter((topic) => !(hasPepPrimary && topic === "pep.kind.secondary")).sort(sortTopics);
}
function TopicsDisplay({ entity, containerClassName }) {
  const topics = entity.properties?.["topics"] ?? [];
  if (topics.length === 0) return null;
  const filteredTopics = getFilteredAndSortedTopics(topics);
  if (filteredTopics.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: containerClassName ?? "flex flex-wrap gap-xs font-normal", children: filteredTopics.map((topic) => /* @__PURE__ */ jsxRuntimeExports.jsx(TopicTag, { topic }, `${entity.id}-${topic}`)) });
}
const useGetEnrichedDataQuery = (input, enabled) => {
  const getEnrichedData = useServerFn(getEnrichedDataFn);
  return useQuery({
    queryKey: ["screening", "get-enriched-data", input.entityId],
    queryFn: async () => {
      return getEnrichedData({ data: input });
    },
    enabled
  });
};
function deduplicationKey(value) {
  return value.normalize("NFD").replace(new RegExp("\\p{M}", "gu"), "").toLowerCase();
}
function deduplicatedStrings(values) {
  const seen = /* @__PURE__ */ new Set();
  return values.filter((value) => {
    const normalized = deduplicationKey(value);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}
function EntityProperties({
  entity,
  forcedProperties,
  showUnavailable = false,
  before,
  after,
  highlightText
}) {
  const [displayAll, setDisplayAll] = reactExports.useState({});
  const displayProperties = forcedProperties ?? getSanctionEntityProperties(entity.schema);
  const { t, i18n } = useTranslation(screeningsI18n);
  const language = useFormatLanguage();
  const entityPropertyList = reactExports.useMemo(() => {
    const rows = displayProperties.map((property) => {
      const items = entity.properties?.[property] ?? [];
      const itemsToDisplay = displayAll[property] ? items : items.slice(0, 5);
      const isAddressProperty = property === "address" || property === "addressEntity";
      const restItemsCount = isAddressProperty ? Math.max(0, items.length - itemsToDisplay.length) : Math.max(
        0,
        deduplicatedStrings(items).length - deduplicatedStrings(itemsToDisplay).length
      );
      return {
        property,
        values: itemsToDisplay,
        restItemsCount
      };
    });
    const hasAddress = displayProperties.includes("address");
    const hasAddressEntity = displayProperties.includes("addressEntity");
    if (!hasAddress && !hasAddressEntity) {
      return rows.filter((prop) => showUnavailable ? true : prop.values.length > 0);
    }
    const addressStrings = (entity.properties?.["address"] ?? []).filter(
      (value) => typeof value === "string"
    );
    const rawAddressEntities = entity.properties?.["addressEntity"] ?? [];
    const mergedAddresses = mergeAddresses(addressStrings, rawAddressEntities);
    const displayProperty = hasAddress ? "address" : "addressEntity";
    const showAllAddresses = displayAll[displayProperty] ?? false;
    const addressesToDisplay = showAllAddresses ? mergedAddresses : mergedAddresses.slice(0, 5);
    const insertAt = displayProperties.findIndex((property) => property === "address" || property === "addressEntity");
    const insertPosition = insertAt >= 0 ? displayProperties.slice(0, insertAt).filter((property) => property !== "address" && property !== "addressEntity").length : rows.length;
    const withoutAddressRows = rows.filter((row) => row.property !== "address" && row.property !== "addressEntity");
    const mergedRow = {
      property: displayProperty,
      values: addressesToDisplay,
      restItemsCount: Math.max(0, mergedAddresses.length - addressesToDisplay.length),
      isAddress: true
    };
    const mergedList = [
      ...withoutAddressRows.slice(0, insertPosition),
      mergedRow,
      ...withoutAddressRows.slice(insertPosition)
    ];
    return mergedList.filter((prop) => showUnavailable ? true : prop.values.length > 0);
  }, [displayProperties, entity.properties, displayAll, showUnavailable]);
  const TransformProperty = reactExports.useMemo(
    () => createPropertyTransformer({
      language: i18n.language,
      highlightText
    }),
    [i18n.language, language, highlightText]
  );
  const handleShowMore = (prop) => {
    setDisplayAll((prev) => ({ ...prev, [prop]: true }));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[146px_1fr] gap-md text-xs", children: [
    before,
    entityPropertyList.map(({ property, values, restItemsCount, isAddress }) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "opacity-50", children: t(`screenings:entity.property.${property}`, {
          defaultValue: property
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "wrap-break-word", children: property === "birthDate" ? /* @__PURE__ */ jsxRuntimeExports.jsx(BirthdDateAverage, { values }) : isAddress ? /* @__PURE__ */ jsxRuntimeExports.jsxs(PropertyContainer, { property, children: [
          values.map((address, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(ParseAddress, { address }, index)),
          restItemsCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "primary",
              appearance: "link",
              onClick: (e) => {
                e.preventDefault();
                handleShowMore(property);
              },
              children: t("common:more_remains", { count: restItemsCount })
            }
          ) }) : null
        ] }) : isScriptTaggedProperty(property) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(PropertyContainer, { property, children: [
          deduplicatedStrings(values).map((value, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(ParseAlias, { value, highlightText }, index)),
          restItemsCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "primary",
              appearance: "link",
              onClick: (e) => {
                e.preventDefault();
                handleShowMore(property);
              },
              children: t("common:more_remains", { count: restItemsCount })
            }
          ) }) : null
        ] }) : values.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(PropertyContainer, { property, children: [
          deduplicatedStrings(values).map((v, i, deduplicatedValues) => /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TransformProperty, { property, value: v }),
            i === deduplicatedValues.length - 1 || isPropertyListed(property) ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, { spaced: true })
          ] }, i)),
          restItemsCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            isPropertyListed(property) ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, { spaced: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "primary",
                appearance: "link",
                onClick: (e) => {
                  e.preventDefault();
                  handleShowMore(property);
                },
                children: t("common:more_remains", { count: restItemsCount })
              }
            )
          ] }) : null
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: t("screenings:match.not_available") }) })
      ] }, property);
    }),
    after
  ] });
}
function PropertyContainer({ property, children }) {
  if (isPropertyListed(property)) return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Fragment, { children });
}
function ModalPerson({ personId, personName }) {
  const { t } = useTranslation(["common", "screenings"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", mode: "icon", "aria-label": t("screenings:see_details"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "eye", className: "size-5 text-purple-primary" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { size: "xlarge", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: personName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FreeFormMatchCardDataContent, { entityId: personId, isOpen: true, withTopics: true, withExploreButton: false }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Footer, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:close") }) })
    ] })
  ] });
}
const MAX_ASSOCIATIONS = 5;
function flattenAssociations(associations) {
  const rows = [];
  associations.forEach((association, associationIndex) => {
    association.properties.person?.forEach((person, idx) => {
      if (!person.properties || !hasDisplayableName(person.properties)) return;
      rows.push({
        key: `person-${associationIndex}-${person.id}-${idx}`,
        association,
        id: person.id,
        properties: person.properties
      });
    });
  });
  return rows;
}
const Associations = ({
  associations,
  withExploreButton
}) => {
  const { t } = useTranslation(["screenings", "common"]);
  const [showAll, setShowAll] = reactExports.useState(false);
  const rows = reactExports.useMemo(() => associations ? flattenAssociations(associations) : [], [associations]);
  const hiddenCount = Math.max(0, rows.length - MAX_ASSOCIATIONS);
  const visibleRows = showAll ? rows : rows.slice(0, MAX_ASSOCIATIONS);
  if (rows.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "grid grid-cols-[146px_1fr] gap-sm", children: [
    visibleRows.map((row, rowIndex) => {
      const { key, association, id, properties } = row;
      const isFirstElement = rowIndex === 0;
      const rel = association.properties.relationship?.map(
        (relation) => t(`screenings:relation.${n(relation)}.label`, {
          defaultValue: relation
        })
      );
      const tags = properties.topics?.length ? getFilteredAndSortedTopics(properties.topics).filter(isDisplayableTopic).map((topic) => /* @__PURE__ */ jsxRuntimeExports.jsx(TopicTag, { topic }, `${id}-${topic}`)) : [];
      const expandableItems = [
        /* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, { dark: true, spaced: true }, "dot-1"),
        properties.caption?.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-grey-70 shrink-0 font-medium", children: properties.caption }, "caption") : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0", children: getPersonName(row) }, "alias"),
        /* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, {}, "dot-2"),
        rel?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(StringCodeComponent, { children: rel?.map((r, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          r,
          index < rel.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, { spaced: true }) : null
        ] }, r)) }, "rel") : /* @__PURE__ */ jsxRuntimeExports.jsx(StringCodeComponent, { value: t("screenings:match.family.unknown_relationship") }, "rel"),
        /* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, {}, "dot-3"),
        ...tags
      ];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "contents", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: isFirstElement && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold mb-sm", children: t("screenings:match.associations.title") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandableGroupTagLine, { items: expandableItems, classname: "gap-sm", overflowTagWidth: 60 }),
            withExploreButton ? /* @__PURE__ */ jsxRuntimeExports.jsx(ModalPerson, { personId: id, personName: getPersonName(row) }) : null
          ] }),
          association.properties.sourceUrl && association.properties.sourceUrl.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "col-span-full flex w-full flex-col gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: t("screenings:match.family.source.label") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-inside ps-sm", children: association.properties.sourceUrl.map((url, urlIdx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "external-link", className: "size-4 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-purple-primary hover:text-purple-75 underline",
                  children: cleanUrl(url)
                }
              ),
              urlIdx < association.properties.sourceUrl.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, { spaced: true }) : null
            ] }, `source-${id}-${urlIdx}`)) })
          ] })
        ] })
      ] }, key);
    }),
    hiddenCount > 0 && !showAll && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "contents", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { appearance: "link", variant: "primary", onClick: () => setShowAll(true), children: t("common:more_remains", { count: hiddenCount }) })
    ] })
  ] });
};
const MAX_FAMILY_MEMBERS = 5;
function preferFamilyPersonRelationships(entries) {
  const familyPersonValues = new Set(
    entries.filter((entry) => entry.source === "familyPerson").map((entry) => entry.value)
  );
  return entries.filter((entry) => entry.source !== "familyRelative" || !familyPersonValues.has(entry.value));
}
function FamilyRelationshipTag({ value, source }) {
  const { t } = useTranslation(["screenings"]);
  const label = value ? t(`screenings:relation.${n(value)}.label`, {
    defaultValue: value
  }) : t("screenings:match.family.unknown_relationship");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex shrink-0 items-center gap-xs rounded-sm border border-grey-border bg-surface-card p-xs font-mono", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-forward", className: cn("size-4", source === "familyRelative" && "rotate-180") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
  ] });
}
function flattenFamilyMembers(familyMembers, relation) {
  const rows = [];
  familyMembers.forEach((member, memberIndex) => {
    const entities = member.properties[relation === "familyPerson" ? "relative" : "person"];
    const relationshipEntries = preferFamilyPersonRelationships(
      member.properties.relationships ?? (member.properties.relationship ?? []).map((value) => ({ value, source: relation }))
    );
    entities?.forEach(({ id, properties }, idx) => {
      if (!properties || !hasDisplayableName(properties)) return;
      rows.push({
        key: `person-${memberIndex}-${id}-${idx}`,
        member,
        id,
        properties,
        relationshipEntries
      });
    });
  });
  return rows;
}
function FamilyDetail({
  familyMembers,
  relation,
  withExploreButton
}) {
  const { t } = useTranslation(["screenings", "common"]);
  const [showAll, setShowAll] = reactExports.useState(false);
  const rows = reactExports.useMemo(() => flattenFamilyMembers(familyMembers, relation), [familyMembers, relation]);
  const hiddenCount = Math.max(0, rows.length - MAX_FAMILY_MEMBERS);
  const visibleRows = showAll ? rows : rows.slice(0, MAX_FAMILY_MEMBERS);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "grid grid-cols-[146px_1fr] gap-sm", children: [
    visibleRows.map((row, rowIndex) => {
      const { key, member, id, properties, relationshipEntries } = row;
      const isFirstElement = rowIndex === 0;
      const tags = properties.topics?.length ? getFilteredAndSortedTopics(properties.topics).filter(isDisplayableTopic).map((topic) => /* @__PURE__ */ jsxRuntimeExports.jsx(TopicTag, { topic }, `${id}-${topic}`)) : [];
      const expandableItems = [
        /* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, { dark: true, spaced: true }, "dot-1"),
        properties.caption?.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-grey-70 shrink-0 font-medium", children: properties.caption }, "caption") : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0", children: getPersonName(row) }, "alias"),
        /* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, {}, "dot-2"),
        ...relationshipEntries.length > 0 ? relationshipEntries.map((entry, relIdx) => /* @__PURE__ */ jsxRuntimeExports.jsx(FamilyRelationshipTag, { ...entry }, `rel-${key}-${relIdx}`)) : [/* @__PURE__ */ jsxRuntimeExports.jsx(FamilyRelationshipTag, { value: "", source: relation }, `rel-${key}-unknown`)],
        ...tags.length > 0 ? [/* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, {}, "dot-3"), ...tags] : []
      ];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "contents", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: isFirstElement && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold mb-sm", children: t("screenings:match.family-members.title") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandableGroupTagLine, { items: expandableItems, classname: "gap-sm", overflowTagWidth: 60 }),
            withExploreButton ? /* @__PURE__ */ jsxRuntimeExports.jsx(ModalPerson, { personId: id, personName: getPersonName(row) }) : null
          ] }),
          member.properties.sourceUrl && member.properties.sourceUrl.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "col-span-full flex w-full flex-col gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: t("screenings:match.family.source.label") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-inside ps-sm", children: member.properties.sourceUrl.map((url, urlIdx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "external-link", className: "size-4 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-purple-primary hover:text-purple-75 underline",
                  children: cleanUrl(url)
                }
              )
            ] }, `source-${id}-${urlIdx}`)) })
          ] })
        ] })
      ] }, key);
    }),
    hiddenCount > 0 && !showAll && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "contents", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { appearance: "link", variant: "primary", onClick: () => setShowAll(true), children: t("common:more_remains", { count: hiddenCount }) })
    ] })
  ] });
}
const MemberShip = ({ membershipMember }) => {
  const { t } = useTranslation(["screenings"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-[146px_1fr] gap-sm", children: membershipMember?.map((membership, idx) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "contents", children: [
      idx === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: t("screenings:match.membership.title") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row items-start gap-sm rounded-sm p-sm bg-surface-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full flex w-full flex-wrap gap-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: membership.caption || t("screenings:match.membership.no-caption") }) }) }) })
    ] }, `membership-${membership.id}-${idx}`);
  }) }) });
};
const sanctionProps = [
  "country",
  "authority",
  "authorityId",
  "startDate",
  "endDate",
  "listingDate",
  "program",
  "programId",
  "programUrl",
  "summary",
  "reason",
  "sourceUrl"
];
function ModalSanction({ sanction }) {
  const { t } = useTranslation(["screenings", "common"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", mode: "icon", "aria-label": t("screenings:see_details"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "eye", className: "size-5 text-purple-primary" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { size: "large", className: "max-h-[80vh]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("screenings:sanction_detail.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-y-auto p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityProperties, { entity: sanction, forcedProperties: sanctionProps }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Footer, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:close") }) })
    ] })
  ] });
}
const MAX_SANCTIONS = 5;
function getSanctionLabel(sanction) {
  return sanction.properties["authority"]?.[0] ?? sanction.id;
}
function getSanctionDedupeKey(sanction) {
  const normalizedProperties = Object.entries(sanction.properties).sort(([propertyA], [propertyB]) => propertyA.localeCompare(propertyB)).map(([property, values]) => [property, [...values].sort()]);
  return JSON.stringify(normalizedProperties);
}
function dedupeSanctions(sanctions) {
  const seen = /* @__PURE__ */ new Set();
  return sanctions.filter((sanction) => {
    const key = getSanctionDedupeKey(sanction);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function Sanctions({ sanctions }) {
  const { t } = useTranslation(["screenings", "common"]);
  const [showAll, setShowAll] = reactExports.useState(false);
  const rows = reactExports.useMemo(() => dedupeSanctions(sanctions ?? []), [sanctions]);
  const hiddenCount = Math.max(0, rows.length - MAX_SANCTIONS);
  const visibleRows = showAll ? rows : rows.slice(0, MAX_SANCTIONS);
  if (rows.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "grid grid-cols-[146px_1fr] gap-sm", children: [
    visibleRows.map((sanction, rowIndex) => {
      const isFirstElement = rowIndex === 0;
      const label = getSanctionLabel(sanction);
      const expandableItems = [
        /* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, { dark: true, spaced: true }, "dot"),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0", children: label }, "label")
      ];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "contents", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: isFirstElement && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold mb-sm", children: t("screenings:entity.property.sanctions") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandableGroupTagLine, { items: expandableItems, classname: "gap-sm", overflowTagWidth: 60 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ModalSanction, { sanction })
        ] }) })
      ] }, sanction.id);
    }),
    hiddenCount > 0 && !showAll && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "contents", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { appearance: "link", variant: "primary", onClick: () => setShowAll(true), children: t("common:more_remains", { count: hiddenCount }) })
    ] })
  ] });
}
function relationshipKey({ source, value }) {
  return `${source}:${value}`;
}
function dedupeRelationships(entries) {
  const seen = /* @__PURE__ */ new Set();
  return entries.filter((entry) => {
    const key = relationshipKey(entry);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function MatchDetails({ entity, before, highlightText, withExploreButton }) {
  const deduplicatedEntity = reactExports.useMemo(() => {
    if (entity.schema !== "Person") return entity;
    let familyPerson = entity.properties.familyPerson;
    let familyRelative = entity.properties.familyRelative;
    if (entity.properties.familyPerson?.length) {
      const familyPersonIds = new Set(
        entity.properties.familyPerson.flatMap(({ properties }) => properties.person ?? [])
      );
      const ignoredFamilyRelative = [];
      familyRelative = entity.properties.familyRelative?.filter(({ properties }) => {
        const matchingPersonId = properties.relative?.find((relativeId) => familyPersonIds.has(relativeId));
        if (matchingPersonId) {
          if (properties.relationship?.length) {
            properties.person?.forEach((person) => {
              ignoredFamilyRelative.push({
                relativePersonId: person.id,
                relationship: properties.relationship
              });
            });
          }
          return false;
        }
        return true;
      });
      familyPerson = entity.properties.familyPerson.map((entry) => ({
        ...entry,
        properties: {
          ...entry.properties,
          relationships: dedupeRelationships(
            (entry.properties.relationship ?? []).map((value) => ({
              value,
              source: "familyPerson"
            }))
          )
        }
      }));
      ignoredFamilyRelative.forEach(({ relativePersonId, relationship }) => {
        const familyPersonEntry = familyPerson?.find(
          ({ properties }) => properties.relative?.some((relative) => relative.id === relativePersonId)
        );
        if (!familyPersonEntry) return;
        familyPersonEntry.properties.relationships = dedupeRelationships([
          ...familyPersonEntry.properties.relationships ?? [],
          ...relationship.map((value) => ({ value, source: "familyRelative" }))
        ]);
        const relationshipValues = new Set(familyPersonEntry.properties.relationship ?? []);
        relationship.forEach((value) => relationshipValues.add(value));
        familyPersonEntry.properties.relationship = Array.from(relationshipValues);
      });
      familyRelative = familyRelative?.map((entry) => ({
        ...entry,
        properties: {
          ...entry.properties,
          relationships: (entry.properties.relationship ?? []).map((value) => ({
            value,
            source: "familyRelative"
          }))
        }
      }));
    }
    let associations = entity.properties.associations;
    if (entity.properties.associations?.length) {
      const associateIds = new Set(
        entity.properties.associations.flatMap(({ properties }) => properties.person?.map((p) => p.id) ?? [])
      );
      const ignoredAssociation = [];
      associations = entity.properties.associations.filter(({ properties }) => {
        if (!properties.person) return false;
        if (properties.person.some((p) => associateIds.has(p.id))) {
          properties.person.forEach((p) => associateIds.delete(p.id));
          return true;
        }
        properties.person.forEach(
          (p) => ignoredAssociation.push({ id: p.id, relationship: properties.relationship ?? [] })
        );
        return false;
      });
      const extraRelationshipsByPersonId = /* @__PURE__ */ new Map();
      ignoredAssociation.forEach(({ id, relationship }) => {
        const existing = extraRelationshipsByPersonId.get(id) ?? /* @__PURE__ */ new Set();
        relationship.forEach((r) => existing.add(r));
        extraRelationshipsByPersonId.set(id, existing);
      });
      associations = associations?.map((association) => {
        const matchingPerson = association.properties.person?.find((p) => extraRelationshipsByPersonId.has(p.id));
        if (!matchingPerson) return association;
        const relationships = new Set(association.properties.relationship ?? []);
        extraRelationshipsByPersonId.get(matchingPerson.id).forEach((r) => relationships.add(r));
        return {
          ...association,
          properties: {
            ...association.properties,
            relationship: Array.from(relationships)
          }
        };
      });
    }
    return {
      ...entity,
      properties: {
        ...entity.properties,
        familyPerson,
        familyRelative,
        associations
      }
    };
  }, [entity]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(EntityProperties, { entity, before, highlightText }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sanctions, { sanctions: entity.properties?.sanctions }),
    entity.schema === "Person" && entity.properties?.["membershipMember"]?.length && entity.properties?.["membershipMember"]?.[0]?.caption ? /* @__PURE__ */ jsxRuntimeExports.jsx(MemberShip, { membershipMember: entity.properties["membershipMember"] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Associations,
      {
        associations: deduplicatedEntity.properties["associations"],
        withExploreButton
      }
    ),
    entity.schema === "Person" && deduplicatedEntity.properties?.["familyPerson"]?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      FamilyDetail,
      {
        relation: "familyPerson",
        familyMembers: deduplicatedEntity.properties["familyPerson"],
        withExploreButton
      }
    ) : null,
    entity.schema === "Person" && deduplicatedEntity.properties?.["familyRelative"]?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      FamilyDetail,
      {
        relation: "familyRelative",
        familyMembers: deduplicatedEntity.properties["familyRelative"],
        withExploreButton
      }
    ) : null
  ] });
}
function FreeformMatchCard({
  entity,
  defaultOpen,
  searchTerm,
  background,
  withExploreButton
}) {
  const { t } = useTranslation(screeningsI18n);
  const [isOpen, setIsOpen] = reactExports.useState(defaultOpen ?? false);
  const entitySchema = entity.schema.toLowerCase();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { defaultOpen, onOpenChange: setIsOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Collapsible.Title,
      {
        iconPosition: "left",
        className: cn(background === "grey" && "bg-grey-background-light", background === "card" && "bg-surface-card"),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s flex flex-wrap items-center gap-x-2 gap-y-1 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: entity.caption }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t(`screenings:entity.schema.${entitySchema}`, {
            defaultValue: entitySchema
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: t("screenings:match.similarity", {
            percent: Math.round(entity.score * 100)
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TopicsDisplay, { entity, containerClassName: "flex w-full flex-wrap gap-xs font-normal" })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Collapsible.Content,
      {
        className: cn(background === "grey" && "bg-grey-background-light", background === "card" && "bg-surface-card"),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s flex flex-col gap-lg p-md", children: [
          entitySchema === "person" && entity.datasets?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[146px_1fr] gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: t("screenings:match.datasets.title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityDatasetsList, { datasets: entity.datasets, useCase: "manual_search", itemClassName: "break-all" }) })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FreeFormMatchCardDataContent,
            {
              entityId: entity.id,
              searchTerm,
              isOpen,
              withExploreButton
            }
          )
        ] })
      }
    )
  ] });
}
function FreeFormMatchCardDataContent({
  entityId,
  searchTerm,
  isOpen,
  withTopics = false,
  withExploreButton = true
}) {
  const { t } = useTranslation(screeningsI18n);
  const enrichedData = useGetEnrichedDataQuery({ entityId }, isOpen);
  if (enrichedData.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6 shrink-0 block" });
  if (enrichedData.isError) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t("screenings:match.enriched_data_error") });
  const entity = enrichedData.data;
  if (!entity) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t("screenings:match.enriched_data_error") });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s flex flex-col gap-lg p-md", children: [
    withTopics && /* @__PURE__ */ jsxRuntimeExports.jsx(TopicsDisplay, { entity, containerClassName: "flex w-full flex-wrap gap-xs font-normal" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MatchDetails, { entity, highlightText: searchTerm, withExploreButton })
  ] });
}
export {
  EntityDatasetsList as E,
  FreeformMatchCard as F,
  IconDot as I,
  MatchDetails as M,
  TopicsDisplay as T,
  topicCategoryPriority as a,
  TopicTag as b,
  EntityProperties as c,
  toOrderedTopic as t
};
