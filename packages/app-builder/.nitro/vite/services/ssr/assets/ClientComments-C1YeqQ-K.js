import { c as createSimpleContext, u as useTranslation, e as Icon } from "./format-NPGUXq-g.js";
import { R as jsxRuntimeExports } from "../server.js";
import { u as useOrganizationUsers } from "./organization-users-Bxl0ZW8k.js";
import { R as Root, T as Trigger, C as Content } from "./index-DhVP5FgH.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { M } from "./services-middleware-DR8Hua1Y.js";
import { M as Markdown } from "./Markdown-sjqeOXzy.js";
import { A as Avatar } from "./Avatar-DpA4jY60.js";
import { C as Card } from "./Card-9LKESqlf.js";
import { C as ClientCommentForm$1 } from "./ClientCommentForm-D-0vcWN7.js";
import { E as EventTime } from "./Time-IafhAG3W.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
const CommentContext = createSimpleContext("CommentContext");
function ClientCommentsList({ annotationsQuery }) {
  const { t } = useTranslation(["common", "cases"]);
  const { getOrgUserById } = useOrganizationUsers();
  return M(annotationsQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" }) })).with({ isError: true }, () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("common:global_error") }) });
  }).with({ isSuccess: true }, ({ data }) => {
    const comments = data.annotations.comments;
    if (comments.length === 0) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t("cases:manager.comments.empty") });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-[1.5rem_1fr_minmax(auto,max-content)] gap-sm max-h-100 overflow-y-auto", children: comments.map((comment) => {
      const user = getOrgUserById(comment.annotated_by);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { firstName: user?.firstName, lastName: user?.lastName, size: "xxs", color: "grey" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary whitespace-pre-wrap text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: comment.payload.text }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: comment.created_at })
      ] }, comment.id);
    }) });
  }).exhaustive();
}
function ClientCommentsListCard({ annotationsQuery }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClientCommentsList, { annotationsQuery }) });
}
function ClientCommentForm({ annotationsQuery, objectId, objectType }) {
  const { t } = useTranslation(["cases"]);
  const queryClient = useQueryClient();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border border-grey-border rounded-md w-120 shadow-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Root, { className: "group/collapsible", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "flex items-center gap-sm group-radix-state-open/collapsible:pb-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Icon,
          {
            icon: "arrow-up-right",
            className: "size-4 transition-transform duration-200 rotate-270 group-radix-state-open/collapsible:rotate-90"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t("cases:manager.comments.investigations_header") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Content, { className: "overflow-hidden radix-state-open:animate-slide-down radix-state-closed:animate-slide-up", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClientCommentsList, { annotationsQuery }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-grey-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      ClientCommentForm$1,
      {
        tableName: objectType,
        objectId,
        onAnnotateSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["annotations", objectType, objectId] });
        },
        className: "rounded-t-none"
      }
    ) })
  ] });
}
export {
  CommentContext as C,
  ClientCommentForm as a,
  ClientCommentsListCard as b
};
