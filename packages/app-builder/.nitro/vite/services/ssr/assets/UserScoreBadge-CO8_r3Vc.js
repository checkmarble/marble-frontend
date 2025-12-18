import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { u as useCreateAnnotationMutation } from "./ClientCommentForm-D-0vcWN7.js";
import { u as useGetAnnotationsQuery } from "./get-annotations-CiR2trFM.js";
import { u as useOrganizationObjectTags } from "./organization-object-tags-C9Gf0Ixc.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { B as Button, e as Icon, e8 as MenuCommand, j as Tag, d as cn, u as useTranslation } from "./format-NPGUXq-g.js";
import { u as useDebouncedCallbackRef } from "./use-debounced-callback-ref-5JUm5kmy.js";
import { e as getScoreLatestFn, f as getScoringSettingsFn } from "./scoring-NycAI253.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { A as isAccessible } from "./feature-access-B8PIS8ad.js";
import { S as ScoreDetailPanel } from "./ScoreDetailPanel-BpXEd2Rh.js";
import { S as SCORING_LEVELS_COLORS, a as SCORING_LEVELS_LABEL_KEYS } from "./display-TKj7AN5a.js";
function TagList({ tags, value, editable, align = "start", ...rest }) {
  const [open, setOpen] = reactExports.useState(false);
  const [internalValue, setInternalValue] = reactExports.useState(value);
  reactExports.useEffect(() => {
    setInternalValue(value);
  }, [value]);
  const debouncedOnChange = useDebouncedCallbackRef(rest.onChange, rest.debounceDelay ?? 300);
  const handleClick = () => {
    setOpen((o) => !o);
  };
  const handleSelect = (tag) => {
    const tagsIds = internalValue.includes(tag.id) ? internalValue.filter((tagId) => tagId !== tag.id) : [...internalValue, tag.id];
    setInternalValue(tagsIds);
    debouncedOnChange?.(tagsIds);
  };
  const anchor = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-xs items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ListContainer, { tags, value: internalValue, onClick: handleClick }),
    editable ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "secondary",
        appearance: "link",
        mode: internalValue.length > 0 ? "icon" : "normal",
        onClick: handleClick,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
          internalValue.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: rest.placeholder }) : null
        ]
      }
    ) : null
  ] });
  return !editable ? anchor : /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { persistOnSelect: true, open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Anchor, { children: anchor }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { sideOffset: 4, align, className: "min-w-[16rem]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Item, { onSelect: () => handleSelect(tag), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { children: tag.name }),
      internalValue.includes(tag.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "size-4" }) : null
    ] }, tag.id)) }) })
  ] });
}
function ListContainer({ tags, value, onClick }) {
  const valueTags = value.map((id) => tags.find((t) => t.id === id)).filter(Boolean);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex gap-xs", { "cursor-pointer": !!onClick, hidden: value.length === 0 }), children: valueTags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { tabIndex: 0, onClick, children: tag.name }, tag.id)) });
}
function ClientObjectTagList({
  caseId,
  tableName,
  objectId,
  annotations,
  placeholder
}) {
  const { t } = useTranslation(["common"]);
  const queryClient = useQueryClient();
  const { orgObjectTags } = useOrganizationObjectTags();
  const createAnnotationMutation = useCreateAnnotationMutation();
  const internalQuery = useGetAnnotationsQuery(tableName, objectId);
  const tagAnnotations = annotations ?? internalQuery.data?.annotations.tags ?? [];
  const serverTagIds = tagAnnotations.map((a) => a.payload.tag_id);
  const [pendingTagIds, setPendingTagIds] = reactExports.useState(null);
  const displayedTagIds = pendingTagIds ?? serverTagIds;
  const handleChange = (next) => {
    const previous = pendingTagIds ?? serverTagIds;
    const addedTags = next.filter((id) => !previous.includes(id));
    const removedAnnotations = tagAnnotations.filter((a) => !next.includes(a.payload.tag_id)).map((a) => a.id);
    if (addedTags.length === 0 && removedAnnotations.length === 0) return;
    setPendingTagIds(next);
    createAnnotationMutation.mutateAsync({
      tableName,
      objectId,
      caseId,
      type: "tag",
      payload: { addedTags, removedAnnotations }
    }).then(async (result) => {
      if (!result.success) {
        zt.error(t("common:errors.unknown"));
        setPendingTagIds(null);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["annotations", tableName, objectId] });
      setPendingTagIds(null);
    }).catch(() => {
      zt.error(t("common:errors.unknown"));
      setPendingTagIds(null);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    TagList,
    {
      editable: true,
      tags: orgObjectTags,
      value: displayedTagIds,
      onChange: handleChange,
      placeholder: placeholder ?? "Add a tag"
    }
  );
}
const useScoreLatestQuery = (objectType, objectId) => {
  const getScoreLatest = useServerFn(getScoreLatestFn);
  return useQuery({
    queryKey: ["scoring", "score-latest", objectType, objectId],
    queryFn: () => getScoreLatest({ data: { objectType, objectId } }),
    enabled: !!objectType && !!objectId
  });
};
const useScoringSettingsQuery = () => {
  const getScoringSettings = useServerFn(getScoringSettingsFn);
  return useQuery({
    queryKey: ["scoring", "settings"],
    queryFn: () => getScoringSettings(),
    staleTime: 5 * 60 * 1e3
  });
};
function UserScoreBadge({ objectType, objectId, userScoringAccess }) {
  const { t } = useTranslation(["cases", "user-scoring"]);
  const [panelOpen, setPanelOpen] = reactExports.useState(false);
  const settingsQuery = useScoringSettingsQuery();
  const scoreQuery = useScoreLatestQuery(objectType, objectId);
  if (!isAccessible(userScoringAccess)) return null;
  const settings = settingsQuery.data?.settings;
  const score = scoreQuery.data?.score;
  if (!settings || !score) return null;
  const maxRiskLevel = settings.maxRiskLevel;
  const scoreColor = SCORING_LEVELS_COLORS[maxRiskLevel][score.risk_level] ?? "inherit";
  const scoreLabel = t(SCORING_LEVELS_LABEL_KEYS[maxRiskLevel][score.risk_level] ?? score.risk_level.toString());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => setPanelOpen(true),
        className: "inline-flex items-center gap-xs rounded-md border px-sm py-xs text-small cursor-pointer",
        style: { backgroundColor: `${scoreColor}20`, borderColor: scoreColor },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-3 rounded-full shrink-0", style: { backgroundColor: scoreColor } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("cases:manager.client.risk_label") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: scoreLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "visibility", className: "size-4" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScoreDetailPanel,
      {
        open: panelOpen,
        onOpenChange: setPanelOpen,
        objectType,
        activeScore: score,
        scoringSettings: settings
      }
    )
  ] });
}
export {
  ClientObjectTagList as C,
  TagList as T,
  UserScoreBadge as U
};
