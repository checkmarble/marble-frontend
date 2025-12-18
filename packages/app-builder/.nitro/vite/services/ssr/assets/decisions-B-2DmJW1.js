import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { aF as defaultPaginationSize, n as number, aG as boolean, T as Temporal, J as protectArray, aH as reviewStatuses, aI as knownOutcomes } from "./services-middleware-DR8Hua1Y.js";
import { u as useTranslation, B as Button, e as Icon, s as Trans, t as useFormatDateTime } from "./format-NPGUXq-g.js";
import { o as object, _ as _enum, s as string, l as discriminatedUnion, m as literal, k as array, gk as union, g9 as stringbool, p as boolean$1 } from "./short-uuid-MIi3jWzx.js";
const paginationSchema = object({
  offsetId: string().optional(),
  next: boolean().optional(),
  previous: boolean().optional(),
  limit: number().optional(),
  order: _enum(["ASC", "DESC"]).optional(),
  sorting: _enum(["created_at"]).optional()
});
function getPageBoundaries(items) {
  const firstId = items[0]?.id;
  const lastId = items[items.length - 1]?.id;
  if (!firstId && !lastId) {
    return void 0;
  }
  return {
    firstId,
    lastId
  };
}
function usePaginationsButton({
  filterValues,
  items,
  initialOffsetId
}) {
  const [pageNb, setPageNb] = reactExports.useState(() => initialOffsetId ? 2 : 1);
  const [pageBoundaries, setPageBoundaries] = reactExports.useState(() => {
    const currentPageBoundaries = getPageBoundaries(items);
    if (!currentPageBoundaries) return [];
    if (!initialOffsetId) return [currentPageBoundaries];
    return [
      {
        firstId: initialOffsetId
      },
      currentPageBoundaries
    ];
  });
  const filterValuesKey = JSON.stringify(filterValues);
  const itemsKey = items.map((item) => item.id).join("|");
  const previousFilterValuesKey = reactExports.useRef(filterValuesKey);
  const previousItemsKey = reactExports.useRef(itemsKey);
  const isFirstRender = reactExports.useRef(true);
  reactExports.useEffect(() => {
    const currentPageBoundaries = getPageBoundaries(items);
    const hasInitialOffsetId = Boolean(initialOffsetId);
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousFilterValuesKey.current = filterValuesKey;
      previousItemsKey.current = itemsKey;
      if (hasInitialOffsetId && currentPageBoundaries) {
        setPageNb((currentPageNb) => currentPageNb > 1 ? currentPageNb : 2);
        setPageBoundaries((previousPageBoundaries) => {
          if (previousPageBoundaries.length > 1) {
            return previousPageBoundaries;
          }
          return [
            {
              firstId: initialOffsetId
            },
            currentPageBoundaries
          ];
        });
      }
      return;
    }
    if (previousFilterValuesKey.current !== filterValuesKey) {
      previousFilterValuesKey.current = filterValuesKey;
      previousItemsKey.current = itemsKey;
      setPageNb(1);
      setPageBoundaries(currentPageBoundaries ? [currentPageBoundaries] : []);
      return;
    }
    if (previousItemsKey.current === itemsKey) {
      return;
    }
    previousItemsKey.current = itemsKey;
    if (!currentPageBoundaries) {
      return;
    }
    setPageBoundaries((previousPageBoundaries) => {
      const nextPageBoundaries = [...previousPageBoundaries];
      nextPageBoundaries[pageNb - 1] = currentPageBoundaries;
      return nextPageBoundaries;
    });
  }, [filterValuesKey, initialOffsetId, items, itemsKey, pageNb]);
  const goToNext = () => {
    const currentPageBoundaries = pageBoundaries[pageNb - 1] ?? getPageBoundaries(items);
    if (!currentPageBoundaries?.lastId) {
      return void 0;
    }
    setPageBoundaries((previousPageBoundaries) => {
      const nextPageBoundaries = [...previousPageBoundaries];
      nextPageBoundaries[pageNb - 1] = currentPageBoundaries;
      return nextPageBoundaries;
    });
    setPageNb((currentPageNb) => currentPageNb + 1);
    return {
      next: true,
      offsetId: currentPageBoundaries.lastId
    };
  };
  const goToPrevious = () => {
    const previousPageBoundaries = pageBoundaries[pageNb - 2];
    if (!previousPageBoundaries?.firstId) {
      return void 0;
    }
    setPageNb((currentPageNb) => Math.max(1, currentPageNb - 1));
    return {
      previous: true,
      offsetId: previousPageBoundaries.firstId
    };
  };
  return {
    pageNb,
    hasPreviousPage: !!pageBoundaries[pageNb - 2]?.firstId,
    goToNext,
    goToPrevious
  };
}
function FormattedDatesRange({ startTs, endTs }) {
  const { t } = useTranslation(["common"]);
  const formatDateTime = useFormatDateTime();
  if (!startTs || !endTs) {
    return null;
  }
  const start = new Date(startTs);
  const end = new Date(endTs);
  const isSameLocalDay = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth() && start.getDate() === end.getDate();
  const isSameMinute = isSameLocalDay && start.getHours() === end.getHours() && start.getMinutes() === end.getMinutes();
  const isSameSecond = isSameMinute && start.getSeconds() === end.getSeconds();
  if (isSameSecond)
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t,
        i18nKey: "common:items_displayed_same_datetime",
        components: { emph: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold" }) },
        values: {
          date: formatDateTime(start, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          }),
          time: formatDateTime(start, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          })
        }
      }
    );
  if (isSameLocalDay) {
    const dateFormatOpts = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    };
    const timeFormatOpts = {
      hour: "2-digit",
      minute: "2-digit"
    };
    if (isSameMinute) {
      timeFormatOpts.second = "2-digit";
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t,
        i18nKey: "common:items_displayed_same_date",
        components: { emph: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold" }) },
        values: {
          date: formatDateTime(start, dateFormatOpts),
          start: formatDateTime(start, timeFormatOpts),
          end: formatDateTime(end, timeFormatOpts)
        }
      }
    );
  }
  const dtFormatOpts = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Trans,
    {
      t,
      i18nKey: "common:items_displayed_dates",
      components: { emph: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold" }) },
      values: {
        start: formatDateTime(start, dtFormatOpts),
        end: formatDateTime(end, dtFormatOpts)
      }
    }
  );
}
function RankNumberRange({
  pageNumber,
  currentPageItemCount,
  itemsPerPage
}) {
  const { t } = useTranslation(["common"]);
  const start = (pageNumber - 1) * itemsPerPage + 1;
  const end = currentPageItemCount > 0 ? (pageNumber - 1) * itemsPerPage + currentPageItemCount : 0;
  if (pageNumber === 1 && currentPageItemCount === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Trans,
    {
      t,
      i18nKey: "common:items_displayed_ranks",
      components: { emph: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold" }) },
      values: { start, end }
    }
  );
}
function CursorPaginationButtons({
  items,
  hasNextPage,
  paginationState,
  onPaginationChange,
  boundariesDisplay,
  itemsPerPage = defaultPaginationSize
}) {
  const { t } = useTranslation(["common"]);
  const startTs = items[0]?.createdAt;
  const endTs = items[items.length - 1]?.createdAt;
  const fetchPrevious = () => {
    const pagination = paginationState.goToPrevious();
    if (pagination) {
      onPaginationChange(pagination);
    }
  };
  const fetchNext = () => {
    const pagination = paginationState.goToNext();
    if (pagination) {
      onPaginationChange(pagination);
    }
  };
  const previousDisabled = !paginationState.hasPreviousPage;
  const nextDisabled = !hasNextPage;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-sm", children: [
    boundariesDisplay === "ranks" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      RankNumberRange,
      {
        pageNumber: paginationState.pageNb,
        currentPageItemCount: items.length,
        itemsPerPage
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(FormattedDatesRange, { startTs, endTs }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        onClick: fetchPrevious,
        variant: "secondary",
        mode: "icon",
        disabled: previousDisabled,
        "aria-label": t("common:previous"),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-left", className: "size-4" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: fetchNext, variant: "secondary", mode: "icon", disabled: nextDisabled, "aria-label": t("common:next"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-right", className: "size-4" }) })
  ] });
}
const dateRangeSchema = discriminatedUnion("type", [
  object({
    type: literal("static"),
    startDate: string().datetime().optional(),
    endDate: string().datetime().optional()
  }),
  object({
    type: literal("dynamic"),
    fromNow: string().refine((value) => {
      try {
        Temporal.Duration.from(value);
        return true;
      } catch {
        return false;
      }
    })
  })
]);
const decisionFiltersSchema = object({
  dateRange: dateRangeSchema.optional(),
  hasCase: union([stringbool().optional(), boolean$1()]),
  outcomeAndReviewStatus: object({
    outcome: _enum(knownOutcomes),
    reviewStatus: _enum(reviewStatuses).optional()
  }).optional(),
  pivotValue: string().optional(),
  scenarioId: protectArray(array(string())).optional(),
  scheduledExecutionId: protectArray(array(string().uuid())).optional(),
  caseInboxId: protectArray(array(string())).optional(),
  triggerObject: protectArray(array(string())).optional(),
  triggerObjectId: string().optional()
});
export {
  CursorPaginationButtons as C,
  decisionFiltersSchema as d,
  paginationSchema as p,
  usePaginationsButton as u
};
