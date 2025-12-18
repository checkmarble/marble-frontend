import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { av as casesI18n } from "./router-vb7i5euz.js";
import { u as useTranslation, B as Button, e as Icon, s as Trans, t as useFormatDateTime, q as useFormatLanguage, e8 as MenuCommand, eg as Checkbox, e5 as Calendar, dD as Tooltip, d as cn } from "./format-NPGUXq-g.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { u as useFormDropzone } from "./useFormDropzone-BjTKexsf.js";
import { u as useAddCommentMutation } from "./add-comment-BaESvh7R.js";
import { s as submitOnCtrlEnter, h as handleSubmit, g as getFieldErrors } from "./form-D2XmDKeG.js";
import { u as useForm, a as useStore } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { h as addCommentPayloadSchema, a as editAssigneePayloadSchema, b as editInboxPayloadSchema } from "./cases-PZYcTUxr.js";
import { t as toggle, d as diff } from "./array-BFSjnO9c.js";
import { E as EventTime } from "./Time-IafhAG3W.js";
import { u as useOrganizationUsers } from "./organization-users-Bxl0ZW8k.js";
import { g as getFullName } from "./user-C_y5ayGi.js";
import { M as Markdown } from "./Markdown-sjqeOXzy.js";
import { A as Avatar } from "./Avatar-DpA4jY60.js";
import { O as OutcomeBadge } from "./OutcomeTag-BH_m80fa.js";
import { I as IngestedObjectDetailModal } from "./IngestedObjectDetailModal-BFFwOF2a.js";
import { T as TagPreview } from "./TagPreview-CjmrrQF6.js";
import { u as useOrganizationObjectTags } from "./organization-object-tags-C9Gf0Ixc.js";
import { M, aE as getDateFnsLocale, ac as startOfDay, J as protectArray, v as n } from "./services-middleware-DR8Hua1Y.js";
import { C as Code } from "./Code-C6D_KXb1.js";
import { e as endOfDay } from "./endOfDay-DlzjvxTr.js";
import { o as object, gs as datetime, k as array, _ as _enum } from "./short-uuid-MIi3jWzx.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { u as useGetInboxesQuery } from "./get-inboxes-6fSfvled.js";
import { u as useOrganizationTags } from "./organization-tags-CEJpwTHZ.js";
import { t } from "./allPass-LKKfzhYC.js";
import { d as debounce } from "./curry-D3P8tFW_.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { n as editAssigneeFn, o as editInboxFn, p as editTagsFn, q as escalateCaseFn } from "./cases-DJ9ABIdo.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { h as capitalize } from "./dataset-utils-C1Lb7jdi.js";
function AddComment({ caseId }) {
  const { t: t2 } = useTranslation([...casesI18n, "common"]);
  const addCommentMutation = useAddCommentMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: { caseId, comment: "", files: [] },
    onSubmit: ({ value }) => {
      addCommentMutation.mutateAsync(value).then(() => {
        form.reset();
        form.validate("mount");
        revalidate();
      }).catch(() => {
        zt.error(t2("common:errors.unknown"));
      });
    },
    validators: {
      onSubmit: addCommentPayloadSchema
    }
  });
  const { getInputProps, getRootProps } = useFormDropzone({
    onDrop: (acceptedFiles) => {
      form.setFieldValue("files", (prev) => [...prev, ...acceptedFiles]);
      form.validate("change");
    }
  });
  const hasContent = useStore(form.store, (s) => s.values.comment.length > 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(form), className: "bg-surface-elevated border-grey-border gap-md border-t p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "grid grid-cols-[auto_1fr_auto] gap-sm items-start group/comment-form",
      "data-has-content": hasContent,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "files", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ...getInputProps() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm invisible group-focus-within/comment-form:visible group-data-[has-content='true']/comment-form:visible", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", mode: "icon", ...getRootProps(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "attachment", className: "text-grey-secondary size-3.5" }) }),
            field.state.value.map((file) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "border-grey-border flex items-center gap-xs rounded-sm border px-2xs py-2xs",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: file.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Icon,
                    {
                      icon: "cross",
                      className: "text-grey-secondary hover:text-grey-primary size-4 cursor-pointer",
                      onClick: (e) => {
                        e.preventDefault();
                        field.handleChange((prev) => toggle(prev, file));
                        form.validate("change");
                      }
                    }
                  )
                ]
              },
              file.name
            ))
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "comment", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: field.state.value,
            onChange: (e) => field.handleChange(e.currentTarget.value),
            onBlur: field.handleBlur,
            onKeyDown: submitOnCtrlEnter,
            name: field.name,
            placeholder: t2("cases:case_detail.add_a_comment.placeholder"),
            className: "form-textarea text-s w-full resize-none border-none bg-transparent outline-hidden"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Subscribe, { selector: (state) => [state.canSubmit, state.isSubmitSuccessful], children: ([canSubmit, isSubmitSuccessful]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "submit",
            variant: "primary",
            mode: "icon",
            "aria-label": t2("cases:case_detail.add_a_comment.post"),
            disabled: !canSubmit || isSubmitSuccessful,
            className: "invisible group-focus-within/comment-form:visible group-data-[has-content='true']/comment-form:visible",
            children: isSubmitSuccessful ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "send", className: "size-3.5" })
          }
        ) })
      ]
    }
  ) });
}
const CaseAssignedDetail = ({ event }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t: t2 } = useTranslation(casesI18n);
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  const assignee = reactExports.useMemo(() => {
    return getOrgUserById(event.assignedTo);
  }, [event.assignedTo, getOrgUserById]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "case-manager", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: event.assignedTo === event.userId ? "case_detail.history.event_detail.case_assigned_himself" : "case_detail.history.event_detail.case_assigned",
        components: { Style: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" }) },
        values: { actor: user ? getFullName(user) : "Workflow", assignee: getFullName(assignee) }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const CaseCreatedDetail = ({ event }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t: t2 } = useTranslation(casesI18n);
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "case-manager", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "cases:case_detail.history.event_detail.created_by",
        components: { Actor: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" }) },
        values: { actor: user ? getFullName(user) : "Workflow" }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const CaseSnoozedDetail = ({ event }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t: t2 } = useTranslation(casesI18n);
  const formatDateTime = useFormatDateTime();
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "snooze", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "cases:case_detail.history.event_detail.case_snoozed",
        components: { Style: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" }) },
        values: {
          actor: user ? getFullName(user) : "Marble",
          date: formatDateTime(event.snoozeUntil, { dateStyle: "short", timeStyle: "short" })
        }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const CaseUnsnoozedDetail = ({ event }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t: t2 } = useTranslation(casesI18n);
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "snooze-on", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "cases:case_detail.history.event_detail.case_unsnoozed",
        components: { Style: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" }) },
        values: { actor: user ? getFullName(user) : "Marble" }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const CommentAddedDetail = ({ event }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { firstName: user?.firstName, lastName: user?.lastName, size: "xxs", color: "grey" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary whitespace-pre-wrap text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: event.comment }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const DecisionAddedDetail = ({ event }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t: t2 } = useTranslation(casesI18n);
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "decision", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "cases:case_detail.history.event_detail.decision_added",
        components: { Actor: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" }) },
        values: { actor: user ? getFullName(user) : "Workflow" }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const DecisionReviewedDetail = ({ event }) => {
  const { t: t2 } = useTranslation(casesI18n);
  const { getOrgUserById } = useOrganizationUsers();
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  const i18nKey = event.comment ? "cases:case_detail.history.event_detail.decision_reviewed_with_comment" : "cases:case_detail.history.event_detail.decision_reviewed";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "manage-search", className: "text-grey-primary size-3" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Trans,
        {
          t: t2,
          i18nKey,
          components: {
            Actor: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" }),
            Status: /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { outcome: event.status })
          },
          values: { actor: user ? getFullName(user) : "Workflow" }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
    ] }, event.id),
    event.comment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-sm ps-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "comment", className: "text-grey-primary size-3 shrink-0 mt-xs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-primary text-xs italic", children: event.comment })
    ] })
  ] });
};
const ClickableCode = ({ children, onClick }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Code, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, children }) });
};
function EntityAnnotated({ event }) {
  const { getOrgUserById } = useOrganizationUsers();
  const { getTagById } = useOrganizationObjectTags();
  const { t: t2 } = useTranslation(casesI18n);
  const [open, setOpen] = reactExports.useState(false);
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-start gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "comment", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Trans,
        {
          t: t2,
          i18nKey: "case_detail.history.event_detail.entity_annotated",
          components: {
            Actor: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" }),
            ObjectType: /* @__PURE__ */ jsxRuntimeExports.jsx(ClickableCode, { onClick: () => setOpen(true), children: "dummyChild" }),
            Type: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold" })
          },
          values: {
            actor: user ? getFullName(user) : "Workflow",
            objectType: event.annotation.object_type,
            type: event.annotation.type
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: M(event.annotation).with({ type: "tag" }, (annotation) => {
        const tag = getTagById(annotation.payload.tag_id);
        return tag ? /* @__PURE__ */ jsxRuntimeExports.jsx(TagPreview, { name: tag.name, className: "ms-sm" }) : null;
      }).with({ type: "file" }, (annotation) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "border-grey-border ms-sm flex items-center gap-xs rounded-sm border px-xs py-2xs text-xs font-medium", children: annotation.payload.files[0]?.filename });
      }).with({ type: "comment" }, (annotation) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "border-grey-border ms-sm border-l ps-sm", children: annotation.payload.text });
      }).exhaustive() }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        IngestedObjectDetailModal,
        {
          dataModel: [],
          tableName: event.annotation.object_type,
          objectId: event.annotation.object_id,
          onClose: () => setOpen(false)
        }
      ) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
}
const FileAddedDetail = ({ event }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t: t2 } = useTranslation(casesI18n);
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "decision", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "cases:case_detail.history.event_detail.file_added",
        components: {
          Actor: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" }),
          File: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "border-grey-border flex items-center gap-xs rounded-sm border px-xs py-2xs text-xs font-medium" })
        },
        values: {
          actor: user ? getFullName(user) : "Marble",
          file: event.fileName
        }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const CASE_EVENT_CATEGORIES = ["case_review_action", "case_assignation", "sar_related", "others"];
const CASE_EVENT_CATEGORY_TO_EVENTS_MAPPING = {
  others: [
    "case_created",
    "decision_reviewed",
    "name_updated",
    "tags_updated",
    "status_updated",
    "case_snoozed",
    "case_unsnoozed",
    "rule_snooze_created",
    "outcome_updated"
  ],
  case_assignation: ["inbox_changed", "case_assigned"],
  sar_related: ["sar_created", "sar_deleted", "sar_status_changed", "sar_file_uploaded"],
  case_review_action: ["comment_added", "file_added", "decision_reviewed", "entity_annotated"]
};
const DEFAULT_CASE_EVENT_CATEGORIES_FILTER = ["case_review_action"];
object({
  types: protectArray(array(_enum(CASE_EVENT_CATEGORIES))),
  startDate: datetime().optional(),
  endDate: datetime().optional()
});
const Badge = ({ children }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-purple-primary text-grey-white text-small rounded-sm px-xs py-2xs", children });
const CaseEventFilters = ({ filters, setFilters }) => {
  const { t: t2 } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();
  const isDirty = reactExports.useMemo(
    () => diff(filters.types, DEFAULT_CASE_EVENT_CATEGORIES_FILTER).length !== 0 || filters.types.length === 0 || filters.startDate || filters.endDate,
    [filters]
  );
  const checked = M(filters.types.length).with(CASE_EVENT_CATEGORIES.length, () => true).with(0, () => false).otherwise(() => "indeterminate");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
    isDirty ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", onClick: () => setFilters({ types: DEFAULT_CASE_EVENT_CATEGORIES_FILTER }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "size-4" }),
      t2("cases:case_detail.history.filter_reset")
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", appearance: "link", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Type" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Content, { sideOffset: 4, className: "max-h-[400px] max-w-[210px]", align: "end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Combobox, { className: "m-xs mb-0 h-8 p-0", iconClasses: "size-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { className: "p-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            MenuCommand.Item,
            {
              className: "flex min-h-0 cursor-pointer items-center justify-start p-xs",
              onSelect: () => {
                setFilters({ types: checked === true ? [] : [...CASE_EVENT_CATEGORIES] });
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { size: "small", checked }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t2(`common:${checked === true ? "select_none" : "select_all"}`) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Separator, { className: "-mx-xs" }),
          CASE_EVENT_CATEGORIES.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            MenuCommand.Item,
            {
              onSelect: () => setFilters((prev) => ({ ...prev, types: toggle(prev.types, type) })),
              className: "flex min-h-0 cursor-pointer items-center justify-start p-xs",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { size: "small", checked: filters?.types.includes(type) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t2(`cases:case_detail.history.event_type_category.${type}`) })
              ]
            },
            type
          ))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", appearance: "link", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Date" }),
        filters.startDate || filters.endDate ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-disabled mx-xs h-3 w-px" }) : null,
        filters.startDate ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: t2("common:from", {
          input: formatDateTime(filters.startDate, { dateStyle: "short", timeStyle: "short" })
        }) }) : null,
        filters.endDate ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: t2("common:to", {
          input: formatDateTime(filters.endDate, { dateStyle: "short", timeStyle: "short" })
        }) }) : null
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { className: "mt-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { className: "p-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Calendar,
        {
          mode: "range",
          selected: {
            from: filters.startDate ? new Date(filters.startDate) : void 0,
            to: filters.endDate ? new Date(filters.endDate) : void 0
          },
          onSelect: (range) => {
            setFilters((prev) => ({
              ...prev,
              startDate: range?.from ? startOfDay(range.from).toString() : void 0,
              endDate: range?.to ? endOfDay(range.to).toString() : void 0
            }));
          },
          defaultMonth: filters.startDate ? new Date(filters.startDate) : void 0,
          locale: getDateFnsLocale(language)
        }
      ) }) })
    ] })
  ] });
};
const InboxChangedDetail = ({ event }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t: t2 } = useTranslation(casesI18n);
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  const inboxesQuery = useGetInboxesQuery();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "decision", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: M(inboxesQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-4" })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t2("common:generic_fetch_data_error") })).with({ isSuccess: true }, ({ data }) => {
      const inboxes = data?.inboxes ?? [];
      const inboxName = inboxes.find((i) => i.id === event.newInboxId)?.name ?? "Unknown";
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Trans,
        {
          t: t2,
          i18nKey: "cases:case_detail.history.event_detail.inbox_changed",
          components: {
            Style: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" })
          },
          values: {
            actor: user ? getFullName(user) : "Marble",
            inbox: inboxName
          }
        }
      );
    }).exhaustive() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const NameUpdatedDetail = ({ event }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t: t2 } = useTranslation(casesI18n);
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "cases:case_detail.history.event_detail.name_updated",
        components: { Style: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" }) },
        values: { actor: user ? getFullName(user) : "Workflow", name: event.newName }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const OutcomeUpdatedDetail = ({ event }) => {
  const { t: t2 } = useTranslation(casesI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "cases:case_detail.history.event_detail.outcome_updated",
        components: { Style: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" }) },
        values: { outcome: t2(`cases:case.outcome.${event.newOutcome}`) }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const RuleSnoozeCreatedDetail = ({ event }) => {
  const { t: t2 } = useTranslation(casesI18n);
  const { getOrgUserById } = useOrganizationUsers();
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "snooze", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "cases:case_detail.history.event_detail.rule_snooze_created",
        components: {
          Actor: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" })
        },
        values: { actor: user ? getFullName(user) : "Workflow" }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const SarCreatedDetail = ({ event }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t: t2 } = useTranslation(casesI18n);
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "full-flag", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "case_detail.history.event_detail.sar_requested",
        components: {
          Actor: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" })
        },
        values: { actor: user ? getFullName(user) : "Workflow" }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const SarDeletedDetail = ({ event }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t: t2 } = useTranslation(casesI18n);
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "full-flag", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "case_detail.history.event_detail.sar_deleted",
        components: {
          Actor: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" })
        },
        values: { actor: user ? getFullName(user) : "Workflow" }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const SarFileUploadedDetail = ({ event }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t: t2 } = useTranslation(casesI18n);
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "full-flag", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "case_detail.history.event_detail.sar_file_uploaded",
        components: {
          Actor: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" }),
          File: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold" })
        },
        values: {
          actor: user ? getFullName(user) : "Workflow",
          file: event.filename
        }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const SarStatusChangedDetail = ({ event }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t: t2 } = useTranslation(casesI18n);
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "full-flag", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: event.status === "pending" ? "case_detail.history.event_detail.sar_requested" : "case_detail.history.event_detail.sar_reported",
        components: {
          Actor: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" })
        },
        values: { actor: user ? getFullName(user) : "Workflow" }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const StatusUpdatedDetail = ({ event }) => {
  const { t: t2 } = useTranslation(casesI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "manage-search", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "cases:case_detail.history.event_detail.status_updated",
        components: { Style: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" }) },
        values: { status: t2(`cases:case.status.${event.newStatus}`) }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
function CaseTags({ caseTagIds, orgTags }) {
  const { t: t2 } = useTranslation(casesI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Tooltip.Default,
    {
      content: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex max-w-sm flex-wrap gap-xs", children: caseTagIds.map((caseTagId) => /* @__PURE__ */ jsxRuntimeExports.jsx(CaseTag, { tag: orgTags.find((t22) => t22.id === caseTagId) }, caseTagId)) }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-fit flex-wrap items-center gap-xs", children: [
        caseTagIds.slice(0, 3).map((caseTagId) => /* @__PURE__ */ jsxRuntimeExports.jsx(CaseTag, { tag: orgTags.find((t22) => t22.id === caseTagId) }, caseTagId)),
        caseTagIds.length > 3 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-primary bg-grey-background flex h-6 items-center rounded-sm px-xs text-xs font-normal", children: t2("cases:case_detail.other_tags_count", {
          count: caseTagIds.length - 3
        }) }) : null
      ] })
    }
  );
}
function CaseTag({ tag }) {
  const { t: t2 } = useTranslation(casesI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-background flex h-6 items-center rounded-sm px-xs", style: { backgroundColor: tag?.color }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary line-clamp-1 text-xs font-normal", children: tag?.name || t2("cases:case_detail.unknown_tag") }) });
}
const TagsUpdatedDetail = ({ event }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t: t2 } = useTranslation(casesI18n);
  const { orgTags } = useOrganizationTags();
  const user = reactExports.useMemo(() => event.userId ? getOrgUserById(event.userId) : void 0, [event.userId, getOrgUserById]);
  const finalTags = reactExports.useMemo(() => event.tagIds.filter((id) => id !== ""), [event.tagIds]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "decision", className: "text-grey-primary size-3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary inline-flex h-full items-center whitespace-pre text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: finalTags.length === 0 ? "cases:case_detail.history.event_detail.tags_removed" : "cases:case_detail.history.event_detail.tags_updated",
        components: {
          Actor: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize" }),
          Tags: /* @__PURE__ */ jsxRuntimeExports.jsx(CaseTags, { caseTagIds: finalTags, orgTags })
        },
        values: {
          actor: user ? getFullName(user) : "Workflow"
        }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: event.createdAt })
  ] }, event.id);
};
const MAX_EVENTS_BEFORE_DEBOUNCE = 60;
const EVENT_DELAY = 100;
function CaseEvents({ events, root }) {
  const { t: t$1 } = useTranslation(["common", "cases"]);
  const containerRef = reactExports.useRef(null);
  const [showAll, setShowAll] = reactExports.useState(false);
  const [olderEvents, setOlderEventsCount] = reactExports.useState(0);
  const [newerEvents, setNewerEventsCount] = reactExports.useState(0);
  const [filters, setFilters] = reactExports.useState({
    types: DEFAULT_CASE_EVENT_CATEGORIES_FILTER
  });
  const orderedEvents = reactExports.useMemo(
    () => events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [events]
  );
  const filteredEvents = reactExports.useMemo(() => {
    if (!filters) return orderedEvents;
    const { types: type, startDate, endDate } = filters;
    return n(
      orderedEvents,
      (event) => t(event, [
        (e) => {
          if (type.length === 0) return true;
          const typesAllowed = type.flatMap((t2) => CASE_EVENT_CATEGORY_TO_EVENTS_MAPPING[t2]);
          return typesAllowed.includes(e.eventType);
        },
        (e) => !startDate || new Date(e.createdAt).getTime() >= new Date(startDate).getTime(),
        (e) => !endDate || new Date(e.createdAt).getTime() <= new Date(endDate).getTime()
      ])
    );
  }, [orderedEvents, filters]);
  reactExports.useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const items = Array.from(container.children);
    let callback = () => {
      let itemsBeforeVisible = 0;
      let itemsAfterVisible = 0;
      for (const item of items) {
        const itemRect = item.getBoundingClientRect();
        if (itemRect.bottom + (root.current?.scrollTop ?? 0) < containerRect.top) {
          itemsBeforeVisible++;
        } else if (itemRect.top + (root.current?.scrollTop ?? 0) > containerRect.bottom) {
          itemsAfterVisible++;
        }
      }
      setNewerEventsCount(itemsBeforeVisible);
      setOlderEventsCount(itemsAfterVisible);
    };
    if (filteredEvents.length > MAX_EVENTS_BEFORE_DEBOUNCE) {
      callback = debounce({ delay: EVENT_DELAY }, callback);
    }
    callback();
    container.addEventListener("scroll", callback);
    return () => container.removeEventListener("scroll", callback);
  }, [filteredEvents]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-0 flex w-full flex-col gap-md", children: [
    filteredEvents.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 top-0 flex h-full w-6 flex-col items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border -z-10 h-full w-px" }) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card sticky left-0 top-0 z-[-15] flex w-full items-center justify-between ps-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-grey-secondary text-small"), children: t$1("cases:investigation.more_recent", { number: newerEvents }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CaseEventFilters, { filters, setFilters }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", appearance: "link", onClick: () => setShowAll(!showAll), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: showAll ? "eye-slash" : "eye", className: "size-3.5" }),
          showAll ? t$1("cases:investigation.collapse") : t$1("cases:investigation.expand")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: containerRef,
        className: cn("flex flex-col gap-md overflow-x-hidden", {
          "max-h-[400px] overflow-y-scroll": !showAll
        }),
        children: filteredEvents.map((event) => /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Fragment, { children: M(event).with({ eventType: "case_created" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(CaseCreatedDetail, { event: e })).with({ eventType: "status_updated" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(StatusUpdatedDetail, { event: e })).with({ eventType: "outcome_updated" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeUpdatedDetail, { event: e })).with({ eventType: "decision_added" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(DecisionAddedDetail, { event: e })).with({ eventType: "comment_added" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(CommentAddedDetail, { event: e })).with({ eventType: "name_updated" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(NameUpdatedDetail, { event: e })).with({ eventType: "tags_updated" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(TagsUpdatedDetail, { event: e })).with({ eventType: "file_added" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(FileAddedDetail, { event: e })).with({ eventType: "inbox_changed" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(InboxChangedDetail, { event: e })).with({ eventType: "rule_snooze_created" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(RuleSnoozeCreatedDetail, { event: e })).with({ eventType: "decision_reviewed" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(DecisionReviewedDetail, { event: e })).with({ eventType: "case_snoozed" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(CaseSnoozedDetail, { event: e })).with({ eventType: "case_unsnoozed" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(CaseUnsnoozedDetail, { event: e })).with({ eventType: "case_assigned" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(CaseAssignedDetail, { event: e })).with({ eventType: "sar_created" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(SarCreatedDetail, { event: e })).with({ eventType: "sar_deleted" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(SarDeletedDetail, { event: e })).with({ eventType: "sar_status_changed" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(SarStatusChangedDetail, { event: e })).with({ eventType: "sar_file_uploaded" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(SarFileUploadedDetail, { event: e })).with({ eventType: "entity_annotated" }, (e) => /* @__PURE__ */ jsxRuntimeExports.jsx(EntityAnnotated, { event: e })).exhaustive() }, event.id))
      }
    ),
    showAll ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: cn("bg-surface-card text-grey-secondary sticky left-0 top-0 z-[-15] ps-lg text-xs", {
          "text-grey-white": showAll
        }),
        children: filteredEvents.length === 0 || olderEvents === 0 ? t$1("cases:investigation.no_older") : t$1("cases:investigation.older", { number: olderEvents })
      }
    )
  ] });
}
const useEditAssigneeMutation = () => {
  const editAssignee = useServerFn(editAssigneeFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "edit-assignee"],
    mutationFn: async (payload) => editAssignee({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });
};
const EditCaseAssignee = ({
  disabled,
  assigneeId,
  currentUser,
  id
}) => {
  const { t: t2 } = useTranslation(["cases"]);
  const editAssigneeMutation = useEditAssigneeMutation();
  const revalidate = useLoaderRevalidator();
  const [open, setOpen] = reactExports.useState(false);
  const { getOrgUserById, orgUsers } = useOrganizationUsers();
  const form = useForm({
    defaultValues: { assigneeId, caseId: id },
    onSubmit: ({ value }) => {
      editAssigneeMutation.mutateAsync(value).then(() => {
        revalidate();
      });
    },
    validators: {
      onSubmit: editAssigneePayloadSchema
    }
  });
  const selectedUserId = useStore(form.store, (state) => state.values.assigneeId);
  const assignee = reactExports.useMemo(
    () => selectedUserId ? getOrgUserById(selectedUserId) : null,
    [selectedUserId, getOrgUserById]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    form.Field,
    {
      name: "assigneeId",
      validators: {
        onBlur: editAssigneePayloadSchema.shape.assigneeId,
        onChange: editAssigneePayloadSchema.shape.assigneeId
      },
      children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          assignee ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { size: "xs", firstName: assignee?.firstName, lastName: assignee?.lastName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex gap-2xs text-xs font-medium", children: [
              `${capitalize(assignee?.firstName)} ${capitalize(assignee?.lastName)}`,
              currentUser.actorIdentity.userId === assignee?.userId ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: "(you)" }) : null
            ] })
          ] }) : !disabled ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "secondary",
              onClick: () => {
                if (editAssigneeMutation.isPending) return;
                field.handleChange(currentUser.actorIdentity.userId);
                form.handleSubmit();
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "text-grey-secondary size-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-xs", children: t2("cases:case_detail.assign_to_myself_button.label") })
              ]
            }
          ) : null,
          !disabled ? /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", mode: assignee ? "icon" : "normal", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: assignee ? "edit-square" : "plus", className: "text-grey-secondary size-4" }),
              !assignee ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-xs", children: "Add" }) : null
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Content, { sameWidth: true, className: "mt-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Combobox, { placeholder: "Search..." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: orgUsers.map(({ userId, firstName, lastName, email }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                MenuCommand.Item,
                {
                  className: "cursor-pointer",
                  value: `${userId} ${firstName} ${lastName}`,
                  onSelect: () => {
                    field.handleChange(userId === selectedUserId ? null : userId);
                    form.handleSubmit();
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex w-full justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: `${capitalize(firstName)} ${capitalize(lastName)}`.trim() || email }),
                    userId === selectedUserId ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "text-purple-primary size-6" }) : null
                  ] })
                },
                userId
              )) })
            ] })
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
      ] })
    }
  );
};
const useEditInboxMutation = () => {
  const editInbox = useServerFn(editInboxFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "edit-inbox"],
    mutationFn: async (payload) => editInbox({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });
};
const EditCaseInbox = ({ inboxId, id }) => {
  const editInboxMutation = useEditInboxMutation();
  const revalidate = useLoaderRevalidator();
  const inboxesQuery = useGetInboxesQuery();
  const [open, setOpen] = reactExports.useState(false);
  const form = useForm({
    onSubmit: ({ value }) => {
      editInboxMutation.mutateAsync(value).then(() => {
        revalidate();
      });
    },
    defaultValues: { inboxId, caseId: id },
    validators: {
      onSubmit: editInboxPayloadSchema
    }
  });
  const selectedInboxId = useStore(form.store, (state) => state.values.inboxId);
  const selectedInbox = inboxesQuery.data?.inboxes.find(({ id: inboxId2 }) => inboxId2 === selectedInboxId) ?? null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    form.Field,
    {
      name: "inboxId",
      validators: {
        onBlur: editInboxPayloadSchema.shape.inboxId,
        onChange: editInboxPayloadSchema.shape.inboxId
      },
      children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          selectedInbox ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: selectedInbox.name }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !inboxesQuery.isSuccess, variant: "secondary", mode: "icon", size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "text-grey-secondary size-4" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { className: "mt-sm min-w-[250px]", children: M(inboxesQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-4" })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Error..." })).with({ isSuccess: true }, ({ data }) => {
              const inboxes = data?.inboxes ?? [];
              return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: inboxes.map(({ id: id2, name }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                MenuCommand.Item,
                {
                  className: "cursor-pointer",
                  onSelect: () => {
                    field.handleChange(id2);
                    form.handleSubmit();
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex w-full justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: name }),
                    id2 === selectedInboxId ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "text-purple-primary size-6" }) : null
                  ] })
                },
                id2
              )) });
            }).exhaustive() })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
      ] })
    }
  );
};
const useEditTagsMutation = () => {
  const editTags = useServerFn(editTagsFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "edit-tags"],
    mutationFn: async (payload) => editTags({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });
};
const useEscalateCaseMutation = () => {
  const escalateCase = useServerFn(escalateCaseFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "escalate-case"],
    mutationFn: async (payload) => escalateCase({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });
};
export {
  AddComment as A,
  CaseEvents as C,
  EditCaseInbox as E,
  EditCaseAssignee as a,
  useEscalateCaseMutation as b,
  useEditTagsMutation as u
};
