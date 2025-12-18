import { t as t$1, M } from "./services-middleware-DR8Hua1Y.js";
import { R as jsxRuntimeExports } from "../server.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { u as useTranslation, j as Tag, t as useFormatDateTime, s as Trans, b as clsx, e as Icon } from "./format-NPGUXq-g.js";
function t(...t2) {
  return t$1(n, t2);
}
function n(e, t2) {
  let n2 = {};
  for (let r of t2) r in e && (n2[r] = e[r]);
  return n2;
}
const TestRunStatus = ({ status }) => {
  const { t: t2 } = useTranslation(["scenarios"]);
  return M(status).with("up", () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { size: "big", color: "purple", className: "bg-purple-primary gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "text-grey-white size-3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-white font-semibold", children: t2("scenarios:testrun.status.up") })
  ] })).with("down", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: "big", color: "red", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-semibold", children: t2("scenarios:testrun.status.down") }) })).with("unknown", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: "big", color: "orange", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-semibold", children: t2("scenarios:testrun.status.unknown") }) })).with("pending", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: "big", color: "yellow", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-semibold", children: t2("scenarios:testrun.status.pending") }) })).exhaustive();
};
const TestRunPeriod = ({
  startDate,
  endDate,
  className,
  ...props
}) => {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const formatDateTime = useFormatDateTime();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: clsx("text-s inline-flex h-10 flex-row items-center gap-xs", className), ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Trans,
    {
      t: t2,
      i18nKey: "common:from_to",
      components: {
        // Hack because remix cannot handle properly hydratation of Date
        Date: /* @__PURE__ */ jsxRuntimeExports.jsx("time", { suppressHydrationWarning: true, className: "font-semibold" })
      },
      values: {
        start_date: formatDateTime(startDate, { dateStyle: "short" }),
        end_date: formatDateTime(endDate, { dateStyle: "short" })
      }
    }
  ) });
};
const TestRunVersions = ({
  iterations,
  refIterationId,
  testIterationId
}) => {
  const { t: t2 } = useTranslation(["common"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { size: "big", color: "grey", className: "border-grey-border gap-xs border px-sm py-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary font-semibold", children: `V${iterations[refIterationId]?.version}` }),
      iterations[refIterationId]?.type === "live version" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-primary font-semibold", children: t2("common:live") }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-range", className: "text-grey-primary size-5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: "big", color: "grey", className: "border-grey-border border px-sm py-xs", children: `V${iterations[testIterationId]?.version}` })
  ] });
};
export {
  TestRunStatus as T,
  TestRunVersions as a,
  TestRunPeriod as b,
  t
};
