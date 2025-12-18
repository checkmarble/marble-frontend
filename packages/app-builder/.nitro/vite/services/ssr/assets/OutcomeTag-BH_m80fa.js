import { R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, b as clsx, e as Icon, d as cn, f as cva } from "./format-NPGUXq-g.js";
import { M } from "./services-middleware-DR8Hua1Y.js";
import { a1 as decisionsI18n } from "./router-vb7i5euz.js";
const outcomeMapping = {
  approve: { color: "green", tKey: "decisions:outcome.approve" },
  review: { color: "yellow", tKey: "decisions:outcome.review" },
  block_and_review: {
    color: "orange",
    tKey: "decisions:outcome.block_and_review"
  },
  decline: { color: "red", tKey: "decisions:outcome.decline" },
  unknown: { color: "grey", tKey: "decisions:outcome.unknown" }
};
function OutcomePanel({ outcome }) {
  const { t } = useTranslation(decisionsI18n);
  const { color, tKey } = outcomeMapping[outcome] ?? outcomeMapping.unknown;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: clsx(
        "flex flex-1 flex-col items-center justify-center gap-sm rounded-lg border border-transparent p-sm",
        {
          "bg-green-background-light dark:bg-transparent dark:border-green-primary": color === "green",
          "bg-yellow-background dark:bg-transparent dark:border-yellow-primary": color === "yellow",
          "bg-orange-background-light dark:bg-transparent dark:border-orange-primary": color === "orange",
          "bg-red-background dark:bg-transparent dark:border-red-primary": color === "red"
        }
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: clsx("text-s", {
              "text-green-secondary": color === "green",
              "text-yellow-secondary": color === "yellow",
              "text-orange-secondary": color === "orange",
              "text-red-secondary": color === "red"
            }),
            children: t("decisions:outcome")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: clsx("text-l text-center font-semibold first-letter:capitalize", {
              "text-green-primary": color === "green",
              "text-yellow-primary": color === "yellow",
              "text-orange-primary": color === "orange",
              "text-red-primary": color === "red"
            }),
            children: t(tKey)
          }
        )
      ]
    }
  );
}
const outcomeBadgeVariants = cva("inline-flex items-center w-fit shrink-0 grow-0 border border-transparent", {
  variants: {
    size: {
      sm: "gap-xs rounded-full px-xs py-2xs text-xs font-normal",
      md: "gap-xs rounded-sm px-xs py-2xs text-r font-medium",
      lg: "gap-sm rounded-sm px-xs py-xs text-r font-medium"
    }
  },
  defaultVariants: {
    size: "sm"
  }
});
const OutcomeBadge = ({
  outcome,
  reviewStatus,
  showText = true,
  showBackground = true,
  size,
  className,
  ...rest
}) => {
  const { t } = useTranslation(decisionsI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      ...rest,
      className: outcomeBadgeVariants({
        size,
        className: cn(
          className,
          showBackground && M(outcome).with("approve", () => "bg-green-background-light dark:bg-transparent dark:border-green-primary").with("decline", () => "bg-red-background dark:bg-transparent dark:border-red-primary").with("review", () => "bg-yellow-background dark:bg-transparent dark:border-yellow-primary").with("unknown", () => "bg-grey-background dark:bg-transparent dark:border-grey-placeholder").with(
            "block_and_review",
            () => M(reviewStatus).with("approve", () => "bg-green-background-light dark:bg-transparent dark:border-green-primary").with("decline", () => "bg-red-95 dark:bg-transparent dark:border-red-primary").otherwise(() => "bg-orange-background-light dark:bg-transparent dark:border-orange-border")
          ).exhaustive()
        )
      }),
      children: [
        M(outcome).with("approve", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "accepted", className: "text-green-primary size-4" })).with("decline", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "denied", className: "text-red-primary size-4" })).with("review", () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("size-3.5 rounded-full border-2 border-yellow-primary") })).with("unknown", () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-placeholder size-4 rounded-full border-2" })).with(
          "block_and_review",
          () => M(reviewStatus).with("approve", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "manually_accepted", className: "text-green-primary size-4" })).with("decline", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "manually_denied", className: "text-red-primary size-4" })).otherwise(() => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "block_and_review", className: "size-4 text-orange-primary" }))
        ).exhaustive(),
        showText ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: cn(
              "text-xs font-medium",
              showBackground && M(outcome).with("approve", () => "text-green-primary").with("decline", () => "text-red-primary").with("review", () => "text-yellow-primary").with("unknown", () => "text-grey-secondary").with(
                "block_and_review",
                () => M(reviewStatus).with("approve", () => "text-green-primary").with("decline", () => "text-red-primary").otherwise(() => "text-orange-primary")
              ).exhaustive()
            ),
            children: M(outcome).with("approve", () => t("decisions:outcome.tag.approved.label")).with("decline", () => t("decisions:outcome.tag.declined.label")).with(
              "block_and_review",
              () => M(reviewStatus).with("approve", () => t("decisions:outcome.tag.manually_approved.label")).with("decline", () => t("decisions:outcome.tag.manually_declined.label")).otherwise(() => t("decisions:outcome.block_and_review"))
            ).with("review", () => t("decisions:outcome.tag.review.label")).with("unknown", () => t("decisions:outcome.tag.unknown.label")).exhaustive()
          }
        ) : null
      ]
    }
  );
};
export {
  OutcomeBadge as O,
  OutcomePanel as a
};
