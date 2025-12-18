import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { s as screeningsI18n, a1 as decisionsI18n } from "./router-vb7i5euz.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { e as enrichMatchFn } from "./screenings-CS8peAlI.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { u as useCallbackRef } from "./use-callback-ref-AfyBSz95.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useTranslation, B as Button, e as Icon, e8 as MenuCommand, er as TextArea, dz as Switch, e4 as Modal, t as useFormatDateTime, eb as Collapsible, j as Tag, d as cn } from "./format-NPGUXq-g.js";
import { T as TopicsDisplay, E as EntityDatasetsList, M as MatchDetails } from "./FreeformMatchCard-JGOBIPO0.js";
import { j as reviewScreeningMatchPayloadSchema } from "./cases-PZYcTUxr.js";
import { r as reviewScreeningMatchFn } from "./cases-DJ9ABIdo.js";
import { h as handleSubmit } from "./form-D2XmDKeG.js";
import { R as RadioProvider, a as RadioGroup, b as RadioItem, S as StatusTag } from "./StatusRadioGroup-BTpRIK0f.js";
import { u as useForm, a as useStore } from "./useForm-BwABQKAs.js";
import { u as useOrganizationUsers } from "./organization-users-Bxl0ZW8k.js";
import { g as getFullName } from "./user-C_y5ayGi.js";
import { A as Avatar } from "./Avatar-DpA4jY60.js";
import { e as DataFields, p as parseUnknownData } from "./DataField-vckdVtrg.js";
import { C as Card } from "./Card-9LKESqlf.js";
import { F as FormatData } from "./FormatData-TXRe9nHU.js";
import { u as t, p as t$2, _ as t$3 } from "./services-middleware-DR8Hua1Y.js";
import { t as t$1 } from "./mapToObj-wQ-uHOuD.js";
const useEnrichMatchMutation = () => {
  const enrichMatch = useServerFn(enrichMatchFn);
  return useMutation({
    mutationKey: ["screening", "enrich-match"],
    mutationFn: async (matchId) => {
      return enrichMatch({ data: { matchId } });
    }
  });
};
function EnrichMatchButton({ matchId }) {
  const { t: t2 } = useTranslation(screeningsI18n);
  const enrichMatchMutation = useEnrichMatchMutation();
  const revalidate = useLoaderRevalidator();
  const handleButtonClick = useCallbackRef(() => {
    enrichMatchMutation.mutateAsync(matchId).then((res) => {
      if (res && "error" in res) {
        zt.error(t2("screenings:error.match_already_enriched"));
        return;
      }
      zt.success(t2("screenings:success.match_enriched"));
      revalidate();
    }).catch(() => {
      zt.error(t2("common:errors.unknown"));
    });
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "secondary", className: "h-8", onClick: handleButtonClick, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "download", className: "size-5" }),
    t2("screenings:enrich_button")
  ] });
}
const useReviewScreeningMatchMutation = () => {
  const reviewScreeningMatch = useServerFn(reviewScreeningMatchFn);
  return useMutation({
    mutationFn: async (payload) => reviewScreeningMatch({ data: payload })
  });
};
function ReviewMatchPopover({
  screening,
  screeningMatch,
  open,
  onOpenChange
}) {
  const { t: t2 } = useTranslation(["common", ...screeningsI18n]);
  const reviewScreeningMatchMutation = useReviewScreeningMatchMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: {
      matchId: screeningMatch.id,
      status: "no_hit",
      comment: "",
      whitelist: true
    },
    onSubmit: async ({ value }) => {
      try {
        await reviewScreeningMatchMutation.mutateAsync(value);
        onOpenChange(false);
        revalidate();
      } catch {
        zt.error(t2("common:errors.unknown"));
      }
    },
    validators: {
      onSubmit: reviewScreeningMatchPayloadSchema
    }
  });
  const currentStatus = useStore(form.store, (state) => state.values.status);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange, persistOnSelect: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "primary",
        size: "small",
        onClick: (e) => {
          e.stopPropagation();
        },
        children: [
          t2("screenings:start_reviewing"),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "caret-down", className: "size-4" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { align: "end", sideOffset: 4, className: "w-[420px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "flex flex-col gap-sm p-md", onSubmit: handleSubmit(form), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium", children: t2("screenings:review_modal.status_label") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "status", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(RadioProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(RadioGroup, { className: "flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          RadioItem,
          {
            value: "confirmed_hit",
            checked: field.state.value === "confirmed_hit",
            onCheck: () => field.handleChange("confirmed_hit"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: t2("screenings:match.status.confirmed_hit") })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          RadioItem,
          {
            value: "no_hit",
            checked: field.state.value === "no_hit",
            onCheck: () => field.handleChange("no_hit"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: t2("screenings:match.status.no_hit") })
          }
        )
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "comment", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextArea,
        {
          name: field.name,
          value: field.state.value,
          onChange: (e) => field.handleChange(e.target.value),
          placeholder: t2("screenings:review_modal.comment_label"),
          className: "h-[100px]"
        }
      ) }),
      currentStatus === "no_hit" && screening.uniqueCounterpartyIdentifier ? /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "whitelist", children: (field) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { name: field.name, checked: field.state.value, onCheckedChange: field.handleChange }),
            " ",
            t2("screenings:review_modal.whitelist_label")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border bg-grey-background-light flex flex-col gap-sm rounded-sm border p-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: t2("screenings:match.unique_counterparty_identifier") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: screening.uniqueCounterpartyIdentifier })
          ] })
        ] });
      } }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { variant: "secondary", label: t2("common:cancel"), onClick: () => onOpenChange(false) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            type: "submit",
            label: t2("common:save"),
            disabled: !currentStatus || reviewScreeningMatchMutation.isPending
          }
        )
      ] })
    ] }) })
  ] });
}
const CommentLine = ({ comment }) => {
  const formatDateTime = useFormatDateTime();
  const { getOrgUserById } = useOrganizationUsers();
  const user = getOrgUserById(comment.authorId);
  const fullName = getFullName(user);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { size: "xs", firstName: user?.firstName, lastName: user?.lastName }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-baseline gap-xs", children: [
        fullName,
        /* @__PURE__ */ jsxRuntimeExports.jsx("time", { className: "text-grey-secondary text-xs", dateTime: comment.createdAt, children: formatDateTime(comment.createdAt, { dateStyle: "short", timeStyle: "short" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: comment.comment })
  ] }, comment.id);
};
const MatchCard = ({
  screening,
  match,
  readonly,
  unreviewable,
  defaultOpen,
  hideEnrich,
  hideReview,
  aiSuggestion
}) => {
  const { t: t2 } = useTranslation(screeningsI18n);
  const [isPopoverOpen, setIsPopoverOpen] = reactExports.useState(false);
  const entity = match.payload;
  const entitySchema = entity.schema.toLowerCase();
  const canReview = match.status === "pending" && !readonly && !unreviewable;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { defaultOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex grow items-center justify-between gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium", children: entity.caption }),
        aiSuggestion && match.status === "pending" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: "grey", children: [
          t2(`screenings:match.ai_suggestion.${aiSuggestion.confidence}`),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "wand", className: "size-4" })
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: t2("screenings:match.similarity", {
          percent: Math.round(entity.score * 100)
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", onClick: (e) => e.stopPropagation(), children: [
        !hideEnrich && !match.enriched ? /* @__PURE__ */ jsxRuntimeExports.jsx(EnrichMatchButton, { matchId: match.id }) : null,
        !hideReview ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex h-8 shrink-0 text-nowrap", children: unreviewable ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: t2("screenings:match.not_reviewable") }) : canReview ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          ReviewMatchPopover,
          {
            screening,
            screeningMatch: match,
            open: isPopoverOpen,
            onOpenChange: setIsPopoverOpen
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(StatusTag, { status: match.status, disabled: true }) }) : null
      ] })
    ] }) }),
    entity.properties["topics"]?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-md pb-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TopicsDisplay, { entity, containerClassName: "flex flex-wrap gap-xs" }) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-grey-background-light border-grey-border flex flex-col gap-sm rounded-lg border p-sm", children: [
      entitySchema === "person" && entity.datasets?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[146px_1fr] gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-50", children: t2("screenings:match.datasets.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          EntityDatasetsList,
          {
            datasets: entity.datasets,
            useCase: "transaction_monitoring",
            listClassName: "list-disc ps-md",
            itemClassName: "break-all text-xs"
          }
        ) })
      ] }) : null,
      match.comments.map((comment) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CommentLine, { comment }, comment.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MatchDetails, { entity })
    ] }) })
  ] });
};
function useParsedTriggerObject(triggerObject) {
  return reactExports.useMemo(() => t(triggerObject, t$3(parseUnknownData), t$2()), [triggerObject]);
}
function DecisionDetailTriggerObject({
  table,
  triggerObject
}) {
  const { t: t2 } = useTranslation(decisionsI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { className: "bg-surface-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t2("decisions:trigger_object.type") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DataFields, { table, object: { data: triggerObject }, options: { mapHeight: 200 } }) })
  ] });
}
function CaseDetailTriggerObject({
  dataModel,
  triggerObject,
  triggerObjectType,
  className,
  onLinkClicked
}) {
  const parsedTriggerObject = useParsedTriggerObject(triggerObject);
  const dataModelTable = dataModel.find((table) => table.name === triggerObjectType);
  const links = t(
    dataModelTable?.linksToSingle ?? [],
    t$1((link) => {
      return [link.childFieldName, link.parentTableName];
    })
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: dataModelTable?.name ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    DataFields,
    {
      table: dataModelTable.name,
      object: { data: triggerObject },
      options: { hideLinks: true, withOptionalHidden: true },
      className
    }
  ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("grid grid-cols-[max-content_1fr] gap-md ", className), children: parsedTriggerObject.map(([property, data]) => {
    const fieldType = dataModelTable?.fields?.find((f) => f.name === property)?.dataType;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: property }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center gap-sm", children: links[property] && data.value ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "text-purple-primary group flex items-center gap-xs text-left",
          onClick: () => onLinkClicked(links[property], data.value),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormatData, { type: fieldType, data, mapHeight: 200 })
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(FormatData, { type: fieldType, data, mapHeight: 200 }) })
    ] }, property);
  }) }) });
}
export {
  CaseDetailTriggerObject as C,
  DecisionDetailTriggerObject as D,
  MatchCard as M
};
