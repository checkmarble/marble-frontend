import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, dD as Tooltip, d as cn, B as Button, e as Icon, q as useFormatLanguage, t as useFormatDateTime, r as formatDateRelative, S as StickyComponent, eg as Checkbox, e8 as MenuCommand, ea as formatDuration, dZ as SelectV2, C as CtaV2ClassName, e1 as Input, ei as SearchInput } from "./format-NPGUXq-g.js";
import { u as t, o as t$1, M, aP as qualificationLevels, aX as z, bv as differenceInDays, D as DEFAULT_CASE_PAGINATION_SIZE } from "./services-middleware-DR8Hua1Y.js";
import { P as Page, L as Link, Q as CaseStatusBadgeV2, N as useAgnosticNavigation, b as useNavigate, am as Route } from "./router-vb7i5euz.js";
import { u as useCallbackRef } from "./use-callback-ref-DXzIzfqy.js";
import { B } from "./sharpstate.es-CeF1Mf5b.js";
import { T as TagPreview } from "./TagPreview-CjmrrQF6.js";
import { M as MY_INBOX_ID } from "./inboxes-D556s0BB.js";
import { u as useOrganizationTags } from "./organization-tags-CEJpwTHZ.js";
import { b as fromUUIDtoSUUID, j as uuid } from "./short-uuid-MIi3jWzx.js";
import { u as useOrganizationUsers } from "./organization-users-Bxl0ZW8k.js";
import { g as getFullName } from "./user-C_y5ayGi.js";
import { A as Avatar } from "./Avatar-DpA4jY60.js";
import { t as t$2 } from "./sumBy-D8av3sKq.js";
import { s as setPreferencesCookie } from "./ThemeContext-B40HQxfH.js";
import { t as t$3 } from "./capitalize-CzwYzf_g.js";
import { D as DateRangeFilter } from "./DateRangeFilter-CSuOawhN.js";
import { S as Separator } from "./Separator-L7vdY7xf.js";
import { P as Panel } from "./Panel-kj8Z2GDk.js";
import { u as useBase64Query } from "./useBase64Query-Cu-e5hVR.js";
import { x as createCasePayloadSchema, y as filtersSchema } from "./cases-PZYcTUxr.js";
import { j as getCasesFn, m as massUpdateCasesFn, k as createCaseFn } from "./cases-DJ9ABIdo.js";
import { B as keepPreviousData, y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useInfiniteQuery } from "./useInfiniteQuery-D2tvMYRf.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { u as useGetInboxesQuery } from "./get-inboxes-6fSfvled.js";
import { g as getFieldErrors, h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { a as CalloutV2 } from "./Callout-DX4NBXlG.js";
import { C as CasesNavigationTabs } from "./Tabs-efS13r24.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./isNullish-B8pc8Ntu.js";
import "node:crypto";
import "./security-headers.server-BdP3HrPp.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./auth-middleware-C4ap47rJ.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "./create-context-CYc8deix.js";
import "./join-BeQTfqAC.js";
import "./config-ut8rAdyo.js";
import "./useBaseQuery-CMboOtTR.js";
import "./index-x7n7VJTa.js";
import "./index-C_WgunUr.js";
import "./useQuery-B7mL_evE.js";
import "./array-BFSjnO9c.js";
const MultiSelectSharpFactory = B({
  name: "MultiSelect",
  initializer: () => ({
    selectedIds: [],
    items: [],
    lastAction: null
  })
}).withActions({
  register(api, index, itemId, item) {
    if (api.value.items.find((item2) => item2.id === itemId)) {
      console.warn(`[MultiSelect] Item ${itemId} already registered`);
      return;
    }
    api.value.items.push({ index, id: itemId, item });
    return () => {
      api.value.items = api.value.items.filter((i) => i.id !== itemId);
    };
  },
  selectAll(api) {
    api.value.selectedIds = [...api.value.items.map((item) => item.id)];
  },
  unselectAll(api) {
    api.value.selectedIds = [];
  }
}).withComputed({
  orderedItems(state) {
    return state.items.sort((a, b) => a.index - b.index);
  }
});
const MultiSelectRoot = ({ children, id }) => {
  const multiSelectSharp = MultiSelectSharpFactory.createSharp();
  reactExports.useEffect(() => {
    multiSelectSharp.actions.unselectAll();
  }, [id, multiSelectSharp]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MultiSelectSharpFactory.Provider, { value: multiSelectSharp, children });
};
const MultiSelectItem = ({ children, index, id, item }) => {
  const sharp = MultiSelectSharpFactory.useSharp();
  const isSelected = MultiSelectSharpFactory.select((state) => state.selectedIds.includes(id));
  const selectedIds = MultiSelectSharpFactory.select((state) => state.$selectedIds);
  const orderedItems = sharp.computed.orderedItems;
  const handleTrigger = useCallbackRef((e) => {
    e.stopPropagation();
    const lastAction = sharp.value.lastAction;
    const isIntendingMultiSelection = e.shiftKey;
    const isMultiSelectionPossible = lastAction !== null && lastAction[1] === "select" && !isSelected;
    if (isIntendingMultiSelection && isMultiSelectionPossible) {
      const lastClickedIdIndex = orderedItems.value.findIndex((item2) => item2.id === lastAction[0]);
      const currentIndex = orderedItems.value.findIndex((item2) => item2.id === id);
      const [start, end] = currentIndex > lastClickedIdIndex ? [lastClickedIdIndex, currentIndex] : [currentIndex, lastClickedIdIndex];
      for (let i = start; i <= end; i++) {
        const item2 = orderedItems.value[i];
        if (item2 && !selectedIds.value.find((selectedId) => selectedId === item2.id)) {
          selectedIds.value.push(item2.id);
        }
      }
      sharp.value.lastAction = [id, "select"];
    } else {
      if (isSelected) {
        const idx = selectedIds.value.indexOf(id) ?? -1;
        if (idx !== -1) {
          selectedIds.value.splice(idx, 1);
        }
      } else {
        selectedIds.value.push(id);
      }
      sharp.value.lastAction = [id, isSelected ? "unselect" : "select"];
    }
  });
  reactExports.useEffect(() => {
    return sharp.actions.register(index, id, item);
  }, [sharp, id, item]);
  return children(isSelected, handleTrigger);
};
const MultiSelectGlobal = ({ children }) => {
  const multiSelectSharp = MultiSelectSharpFactory.useSharp();
  const selectState = MultiSelectSharpFactory.select((state) => {
    const selectedIds = state.selectedIds.filter((id) => state.items.find((item) => item.id === id));
    if (selectedIds.length !== 0 && selectedIds.length !== state.items.length) {
      return "indeterminate";
    }
    return selectedIds.length !== 0;
  });
  const handleTrigger = useCallbackRef((e) => {
    e.stopPropagation();
    if (selectState === false) {
      multiSelectSharp.actions.selectAll();
    } else {
      multiSelectSharp.actions.unselectAll();
    }
  });
  return children(selectState, handleTrigger);
};
function MultiSelectSubscribe({ children }) {
  const selectedItems = MultiSelectSharpFactory.select((state) => {
    return state.selectedIds.map((id) => {
      const item = state.items.find((item2) => item2.id === id);
      return item?.item;
    }).filter(Boolean);
  });
  return children(selectedItems.length, selectedItems);
}
const MultiSelect = {
  Root: MultiSelectRoot,
  Item: MultiSelectItem,
  Global: MultiSelectGlobal,
  Subscribe: MultiSelectSubscribe
};
const AssignedContributors = ({
  assignedTo,
  contributors
}) => {
  const { getOrgUserById } = useOrganizationUsers();
  const assignedUser = assignedTo ? getOrgUserById(assignedTo) : void 0;
  const contributorsUsers = contributors.map((contributor) => getOrgUserById(contributor.userId));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-sm", children: [
    assignedTo ? /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarWithTooltip, { user: assignedUser }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "lg:flex items-center gap-xs group/contributors hidden", children: contributorsUsers.map(
      (user, idx) => user ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-4 group-hover/contributors:w-9 rotate-0 overflow-visible transition-all",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarWithTooltip, { user })
        },
        user.userId
      ) : null
    ) })
  ] });
};
const AvatarWithTooltip = ({ user, className }) => {
  const { t: t2 } = useTranslation(["cases"]);
  const avatar = /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { size: "s", firstName: user?.firstName, lastName: user?.lastName }, user?.userId);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Tooltip.Default,
    {
      content: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-xs", children: [
        avatar,
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-primary text-xs font-normal capitalize", children: getFullName(user) || t2("cases:case_detail.unknown_user") })
      ] }, user?.userId ?? 0),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-fit flex-row items-center gap-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("border-purple-border rounded-full", className), children: avatar }) })
    }
  );
};
const PaginationRow = reactExports.forwardRef(
  ({ casesQuery, currentPage, currentLimit, setCurrentPage, setLimit, className }, ref) => {
    const { t: t$32 } = useTranslation(["cases"]);
    const pagesRanges = reactExports.useMemo(() => {
      if (!casesQuery.data?.pages) return [];
      const pagesStartIndexes = t(
        casesQuery.data.pages,
        t$1(
          (_, index) => t(
            casesQuery.data.pages.slice(0, index),
            t$2((page) => page?.items.length ?? 0)
          )
        )
      );
      return casesQuery.data.pages.map((page, index) => {
        if (!page || page.items.length === 0) {
          return {
            startIndex: 0,
            endIndex: 0
          };
        }
        const startIndex = pagesStartIndexes[index] !== void 0 ? pagesStartIndexes[index] + 1 : 0;
        const pageLength = page?.items.length !== void 0 ? page?.items.length - 1 : 0;
        return {
          startIndex,
          endIndex: startIndex + pageLength
        };
      });
    }, [casesQuery.data?.pages]);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.StickyFooter, { ref, surface: "page", className, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t$32("cases:list.results_per_page") }),
        [25, 50, 100].map((limit) => {
          const isActive = limit === currentLimit;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "secondary",
              appearance: "stroked",
              size: "medium",
              className: cn(isActive && "border-purple-primary text-purple-primary"),
              onClick: () => {
                if (!isActive) {
                  setLimit(limit);
                }
              },
              children: limit
            },
            `pagination-limit-${limit}`
          );
        })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
        casesQuery.isFetchingNextPage ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Loading..." }) : pagesRanges[currentPage] ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "From ",
          pagesRanges[currentPage].startIndex,
          " to ",
          pagesRanges[currentPage].endIndex
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            mode: "icon",
            size: "medium",
            variant: "secondary",
            appearance: "stroked",
            disabled: currentPage === 0,
            onClick: () => {
              setCurrentPage(currentPage - 1);
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-left", className: "size-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            mode: "icon",
            size: "medium",
            variant: "secondary",
            appearance: "stroked",
            disabled: currentPage === casesQuery.data.pages.length - 1 && !casesQuery.hasNextPage || casesQuery.isFetchingNextPage,
            onClick: () => {
              if (currentPage === casesQuery.data.pages.length - 1) {
                casesQuery.fetchNextPage();
              }
              setCurrentPage(currentPage + 1);
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-right", className: "size-5" })
          }
        )
      ] })
    ] });
  }
);
PaginationRow.displayName = "PaginationRow";
const getRowLink = (currentTarget) => {
  if (!(currentTarget instanceof HTMLElement)) return null;
  const rowLink = currentTarget.querySelector("[data-row-link]");
  return rowLink instanceof HTMLAnchorElement ? rowLink : null;
};
const handleRowClick = (e) => {
  const rowLink = getRowLink(e.currentTarget);
  if (rowLink && rowLink !== e.target) {
    rowLink.dispatchEvent(new MouseEvent(e.type, e.nativeEvent));
  }
};
const handleRowKeyDown = (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  getRowLink(e.currentTarget)?.click();
};
function CasesList({
  sorting,
  onSortingChange,
  casesQuery,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  fromInboxId
}) {
  const { t: t2 } = useTranslation(["cases"]);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();
  const lastPageRef = reactExports.useRef(0);
  const cases = casesQuery.data?.pages[currentPage]?.items ?? casesQuery.data?.pages[lastPageRef.current]?.items ?? [];
  const { orgTags } = useOrganizationTags();
  reactExports.useEffect(() => {
    if (casesQuery.data?.pages[currentPage]?.items) {
      lastPageRef.current = currentPage;
    }
  }, [casesQuery.data?.pages[currentPage]?.items]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col text-small bg-surface-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full grid grid-cols-[0px_auto_1fr_repeat(5,_auto)] border border-grey-border rounded-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full items-center group/table-row not-last:border-b border-grey-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(HeaderCell, { className: "ps-xl relative col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MultiSelect.Global, { children: (state, onSelect) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectionCheckbox, { selectionState: state, onSelect }) }),
          t2("cases:inbox.heading.status")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderCell, { children: t2("cases:inbox.heading.name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderCell, { children: t2("cases:inbox.heading.type") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderCell, { children: t2("cases:inbox.heading.review_status") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(HeaderCell, { className: "flex items-center gap-sm justify-between", children: [
          t2("cases:inbox.heading.date"),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Icon,
            {
              icon: "caret-down",
              className: cn("size-5 cursor-pointer", {
                "rotate-180": sorting === "ASC"
              }),
              onClick: () => onSortingChange(sorting === "ASC" ? "DESC" : "ASC")
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderCell, { children: t2("cases:inbox.heading.tags") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(HeaderCell, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden lg:inline", children: t2("cases:inbox.heading.assigned_and_contributors") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "lg:hidden", children: t2("cases:inbox.heading.assignee") })
        ] })
      ] }),
      cases.map((caseItem, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "grid grid-cols-subgrid col-span-full items-center group/table-row hover:bg-purple-background-light cursor-pointer h-18 focus-visible:outline-2 -outline-offset-2 outline-purple-primary",
          role: "link",
          tabIndex: 0,
          onClick: handleRowClick,
          onKeyDown: handleRowKeyDown,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "invisible", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                "data-row-link": true,
                to: "/cases/$caseId",
                params: { caseId: fromUUIDtoSUUID(caseItem.id) },
                search: {
                  fromInbox: fromInboxId === MY_INBOX_ID ? void 0 : fromUUIDtoSUUID(fromInboxId)
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-md ps-xl w-25", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MultiSelect.Item, { index, id: caseItem.id, item: caseItem, children: (isSelected, onSelect) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectionCheckbox, { selectionState: isSelected, onSelect }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CaseStatusBadgeV2, { status: caseItem.status, variant: "icon-only" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md group-hover/table-row:text-purple-primary group-hover/table-row:underline", children: caseItem.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md justify-self-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Default, { content: t2(`cases:inbox.tooltip.${caseItem.type}`), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Icon,
              {
                icon: caseItem.type === "continuous_screening" ? "scan-eye" : "case-manager",
                className: cn("size-5", {
                  "text-blue-58": caseItem.type === "decision",
                  "text-grey-secondary": caseItem.type === "continuous_screening"
                })
              }
            ) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md", children: caseItem.outcome && caseItem.outcome !== "unset" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center size-6 rounded-full border border-grey-placeholder", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "user", className: "size-4 text-grey-placeholder" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: cn("flex items-center h-6 rounded-full border px-sm text-small text-nowrap", {
                    "border-red-primary text-red-primary": caseItem.outcome === "confirmed_risk",
                    "border-yellow-primary text-yellow-primary": caseItem.outcome === "valuable_alert",
                    "border-green-primary text-green-primary": caseItem.outcome === "false_positive"
                  }),
                  children: t2(`cases:case.outcome.${caseItem.outcome}`)
                }
              )
            ] }) : caseItem.reviewLevel ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center size-6 rounded-full border border-grey-placeholder", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "wand", className: "size-4 text-grey-placeholder" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: cn("flex items-center h-6 rounded-full border px-sm text-small text-nowrap", {
                    "border-red-primary text-red-primary": caseItem.reviewLevel === "escalate",
                    "border-yellow-primary text-yellow-primary": caseItem.reviewLevel === "investigate",
                    "border-green-primary text-green-primary": caseItem.reviewLevel === "probable_false_positive"
                  }),
                  children: t2(`cases:case.review_level.${caseItem.reviewLevel}`)
                }
              )
            ] }) : "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tooltip.Default,
              {
                content: formatDateTime(caseItem.createdAt, {
                  dateStyle: "long",
                  timeStyle: "short"
                }),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("time", { dateTime: caseItem.createdAt, children: formatDateRelative(caseItem.createdAt, { language }) })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md flex gap-sm", children: caseItem.tags.map((tagItem) => {
              const tag = orgTags.find((tag2) => tag2.id === tagItem.tagId);
              if (!tag) return null;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(TagPreview, { name: tag.name }, tag.id);
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AssignedContributors, { assignedTo: caseItem.assignedTo, contributors: caseItem.contributors }) })
          ]
        },
        caseItem.id
      ))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StickyComponent, { sentinelClassName: "bottom-0 h-px", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      PaginationRow,
      {
        casesQuery,
        currentPage,
        currentLimit: limit,
        setCurrentPage,
        setLimit,
        className: "sentinel-intersect:shadow-sticky-bottom sentinel-intersect:border-grey-border"
      }
    ) })
  ] });
}
const HeaderCell = ({ children, className }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("p-md font-normal text-left not-first:border-l border-grey-border", className), children });
};
const SelectionCheckbox = ({ selectionState, onSelect }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "group/checkbox-parent absolute left-0 top-[50%] translate-[-50%] p-md opacity-0 group-hover/table-row:opacity-100 has-data-[state=checked]:opacity-100",
      onClick: onSelect,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: selectionState })
    }
  );
};
const FavoriteInboxButton = ({ inboxId, isFavorite, onToggle }) => {
  const { t: t2 } = useTranslation(["cases"]);
  const handleClick = () => {
    if (isFavorite) {
      setPreferencesCookie("favInbox", void 0);
      onToggle(void 0);
    } else {
      const inboxIdToStore = inboxId === MY_INBOX_ID ? inboxId : fromUUIDtoSUUID(inboxId);
      setPreferencesCookie("favInbox", inboxIdToStore);
      onToggle(inboxIdToStore);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      variant: isFavorite ? "primary" : "secondary",
      appearance: "stroked",
      size: "medium",
      onClick: handleClick,
      title: isFavorite ? t2("cases:inbox.remove_favorite") : t2("cases:inbox.set_as_favorite"),
      className: "group",
      children: [
        t2("cases:inbox.favorite"),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Icon,
          {
            icon: "star",
            className: isFavorite ? "size-5 fill-purple-primary text-purple-primary group-hover:fill-white group-hover:text-white dark:fill-purple-hover dark:text-purple-hover dark:group-hover:fill-grey-white dark:group-hover:text-grey-white" : "size-5 fill-none text-grey-secondary group-hover:text-grey-primary"
          }
        )
      ]
    }
  );
};
const AssigneeFilterMenuItem = ({ onSelect }) => {
  const { orgUsers } = useOrganizationUsers();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Combobox, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: orgUsers.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuCommand.Item,
      {
        value: `${user.userId} ${user.firstName} ${user.lastName}`,
        onSelect: () => onSelect(user.userId),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { size: "xs", firstName: user.firstName, lastName: user.lastName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: `${t$3(user.firstName)} ${t$3(user.lastName)}` })
        ] })
      },
      user.userId
    )) })
  ] });
};
const DateRangeFilterMenu = ({ onSelect }) => {
  const { t: t2 } = useTranslation(["common", "cases"]);
  const [value, setValue] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DateRangeFilter.Root, { dateRangeFilter: value, setDateRangeFilter: setValue, className: "grid", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter.FromNowPicker, { title: t2("cases:filters.date_range.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "bg-grey-border", decorative: true, orientation: "vertical" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter.Calendar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "bg-grey-border col-span-3", decorative: true, orientation: "horizontal" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter.Summary, { className: "col-span-3 row-span-1" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border flex gap-sm overflow-x-auto border-t p-sm justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuCommand.HeadlessItem,
      {
        onSelect: () => {
          if (value) {
            onSelect(value);
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !value, size: "medium", children: t2("common:save") })
      }
    ) })
  ] });
};
const InboxFilterLabel = ({ name }) => {
  const { t: t2 } = useTranslation(["cases"]);
  return M(name).with("name", () => t2("cases:case.name")).with("statuses", () => t2("cases:filter.closed_only.label")).with("includeSnoozed", () => t2("cases:filter.include_snoozed.label")).with("excludeAssigned", () => t2("cases:filter.exclude_assigned.label")).with("assignee", () => t2("cases:filter.assignee.label")).with("dateRange", () => t2("cases:case.date")).with("tagId", () => t2("cases:filter.tags.label")).with("qualification", () => t2("cases:filter.qualification.label")).exhaustive();
};
const QualificationLevelFilterMenuItem = ({ onSelect }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: qualificationLevels.map((level) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { value: level, onSelect: () => onSelect(level), children: /* @__PURE__ */ jsxRuntimeExports.jsx(QualificationLevelLabel, { level }) }, level)) });
};
const QualificationLevelLabel = ({ level }) => {
  const { t: t2 } = useTranslation(["cases"]);
  const label = t2(`cases:filter.qualification.${level}`);
  const colorClass = level === "green" ? "text-green-primary" : level === "yellow" ? "text-yellow-primary" : "text-red-primary";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: colorClass, children: label });
};
const TagsFilterMenuItem = ({ onSelect }) => {
  const { t: t2 } = useTranslation(["cases"]);
  const { orgTags } = useOrganizationTags();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Combobox, { placeholder: t2("cases:filter.tags.search_placeholder") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: orgTags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { value: tag.name, onSelect: () => onSelect(tag.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(TagPreview, { name: tag.name }) }, tag.id)) })
  ] });
};
const EDITABLE_FILTERS = [
  "dateRange",
  "assignee",
  "tagId",
  "qualification"
];
const ActivatedFilterItem = ({ filter, onUpdate, onClear }) => {
  const [open, setOpen] = reactExports.useState(false);
  const isEditable = EDITABLE_FILTERS.includes(filter[0]);
  const handleClearClick = useCallbackRef((e) => {
    e.stopPropagation();
    onClear();
  });
  const button = /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "h-8 bg-purple-background-light border border-purple-border rounded-md p-sm text-default flex items-center gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DisplayFilterValue, { filter }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleClearClick, className: "cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "size-4" }) })
  ] });
  if (isEditable) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: button }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { sameWidth: true, align: "start", sideOffset: 4, className: "max-h-[600px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditFilterContent, { filter, onUpdate }) }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "h-8 bg-purple-background-light border border-purple-border rounded-md p-sm text-default flex items-center gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DisplayFilterValue, { filter }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClear, className: "cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "x", className: "size-4" }) })
  ] });
};
const DisplayFilterValue = ({ filter }) => {
  const { t: t2, i18n } = useTranslation(["filters", "cases"]);
  const formatDateTime = useFormatDateTime();
  return M(filter).with(["name", z.string], ([name, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name }),
    ": ",
    value
  ] })).with(["statuses", z.array(z.string)], ([name, value]) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name }) })).with(["includeSnoozed", z.boolean], ([name]) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name }) })).with(["excludeAssigned", z.boolean], ([name]) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name }) })).with(["assignee", z.string], ([name, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name }),
    ": ",
    /* @__PURE__ */ jsxRuntimeExports.jsx(AssigneeFilterValue, { value })
  ] })).with(["dateRange", z.shape({ type: "static" })], ([name, value]) => {
    const startDate = formatDateTime(value.startDate);
    const endDate = formatDateTime(value.endDate);
    const diff = differenceInDays(new Date(value.endDate), new Date(value.startDate));
    const dateDisplay = diff <= 1 ? startDate : t2("filters:date_range.range_value", { startDate, endDate });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name }),
      ": ",
      dateDisplay
    ] });
  }).with(["dateRange", z.shape({ type: "dynamic" })], ([name, value]) => {
    const duration = formatDuration(value.fromNow, i18n.language);
    const dateDisplay = t2("filters:date_range.duration", { duration });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name }),
      ": ",
      dateDisplay
    ] });
  }).with(["tagId", z.string], ([name, tagId]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name }),
    ": ",
    /* @__PURE__ */ jsxRuntimeExports.jsx(TagFilterValue, { tagId })
  ] })).with(["qualification", z.string], ([name, level]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name }),
    ": ",
    /* @__PURE__ */ jsxRuntimeExports.jsx(QualificationLevelLabel, { level })
  ] })).exhaustive();
};
const AssigneeFilterValue = ({ value }) => {
  const { t: t2 } = useTranslation(["cases"]);
  const { orgUsers } = useOrganizationUsers();
  const user = orgUsers.find((user2) => user2.userId === value);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { size: "xs", firstName: user?.firstName, lastName: user?.lastName }),
    user ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: `${t$3(user.firstName)} ${t$3(user.lastName)}` }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("cases:case_detail.unknown_user") })
  ] });
};
const TagFilterValue = ({ tagId }) => {
  const { orgTags } = useOrganizationTags();
  const tag = orgTags.find((t2) => t2.id === tagId);
  return tag ? /* @__PURE__ */ jsxRuntimeExports.jsx(TagPreview, { name: tag.name }) : null;
};
const EditFilterContent = ({ filter, onUpdate }) => {
  return M(filter).with(["assignee", z.string], ([name]) => /* @__PURE__ */ jsxRuntimeExports.jsx(AssigneeFilterMenuItem, { onSelect: (userId) => onUpdate({ [name]: userId }) })).with(["dateRange", z.any], ([name]) => /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilterMenu, { onSelect: (value) => onUpdate({ [name]: value }) })).with(["tagId", z.string], ([name]) => /* @__PURE__ */ jsxRuntimeExports.jsx(TagsFilterMenuItem, { onSelect: (newTagId) => onUpdate({ [name]: newTagId }) })).with(["qualification", z.string], ([name]) => /* @__PURE__ */ jsxRuntimeExports.jsx(QualificationLevelFilterMenuItem, { onSelect: (level) => onUpdate({ [name]: level }) })).with(["name", z.string], ([name, value]) => null).with(["statuses", z.array(z.string)], ([name, value]) => null).with(["includeSnoozed", z.boolean], ([name]) => null).with(["excludeAssigned", z.boolean], ([name]) => null).exhaustive();
};
const DisplayFilterMenuItem = ({ filterName, onSelect }) => {
  return M(filterName).with("name", () => null).with("statuses", () => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { value: filterName, onSelect: () => onSelect({ [filterName]: ["closed"] }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name: filterName }) })).with("includeSnoozed", () => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { value: filterName, onSelect: () => onSelect({ [filterName]: true }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name: filterName }) })).with("excludeAssigned", () => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { value: filterName, onSelect: () => onSelect({ [filterName]: true }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name: filterName }) })).with("assignee", () => /* @__PURE__ */ jsxRuntimeExports.jsx(
    MenuCommand.SubMenu,
    {
      arrow: false,
      hover: false,
      trigger: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name: filterName }) }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(AssigneeFilterMenuItem, { onSelect: (userId) => onSelect({ [filterName]: userId }) })
    }
  )).with("dateRange", () => /* @__PURE__ */ jsxRuntimeExports.jsx(
    MenuCommand.SubMenu,
    {
      arrow: false,
      hover: false,
      trigger: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name: filterName }) }),
      className: "max-h-[600px]",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilterMenu, { onSelect: (value) => onSelect({ [filterName]: value }) })
    }
  )).with("tagId", () => /* @__PURE__ */ jsxRuntimeExports.jsx(
    MenuCommand.SubMenu,
    {
      arrow: false,
      hover: false,
      trigger: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name: filterName }) }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TagsFilterMenuItem, { onSelect: (tagId) => onSelect({ [filterName]: tagId }) })
    }
  )).with("qualification", () => /* @__PURE__ */ jsxRuntimeExports.jsx(
    MenuCommand.SubMenu,
    {
      arrow: false,
      hover: false,
      trigger: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilterLabel, { name: filterName }) }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(QualificationLevelFilterMenuItem, { onSelect: (level) => onSelect({ [filterName]: level }) })
    }
  )).exhaustive();
};
const FilterInboxSelector = ({ inboxes, selectedInbox, onSelectInbox }) => {
  const { t: t2 } = useTranslation(["cases"]);
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", size: "medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        t2("cases:case.inbox"),
        ": ",
        selectedInbox.name
      ] }),
      selectedInbox.casesCount !== void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-xs py-2xs rounded-full bg-surface-card border border-grey-border text-purple-primary dark:text-grey-primary text-small", children: [
        selectedInbox.casesCount,
        " cases"
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "caret-down", className: "size-4" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { align: "start", sideOffset: 4, sameWidth: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: inboxes.map((inbox) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Item, { value: `${inbox.id} ${inbox.name}`, onSelect: () => onSelectInbox(inbox), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[20px_1fr] items-center gap-xs", children: [
        inbox.id === selectedInbox.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "size-4 text-purple-primary" }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "col-start-2", children: inbox.name })
      ] }),
      inbox.casesCount !== void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-small text-grey-secondary", children: t2("cases:inbox.cases_count", { count: inbox.casesCount }) }) : null
    ] }, inbox.id)) }) })
  ] });
};
const InboxFilterBar = ({
  inboxId,
  inboxes,
  filters,
  allowedFilters,
  updateFilters,
  onInboxSelect
}) => {
  const { t: t2 } = useTranslation(["cases"]);
  const allInboxes = [{ id: MY_INBOX_ID, name: t2("cases:inbox.my-inbox.link") }, ...inboxes];
  const selectedInbox = allInboxes.find((inbox) => inbox.id === inboxId) ?? allInboxes[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FilterInboxSelector,
      {
        inboxes: allInboxes,
        selectedInbox,
        onSelectInbox: (inbox) => {
          onInboxSelect(inbox.id);
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(InboxFilters, { allowedFilters, filters, updateFilters })
  ] });
};
const InboxFilters = ({ allowedFilters, filters, updateFilters }) => {
  const { t: t2 } = useTranslation(["filters"]);
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    filters.map((filter) => {
      const [filterName] = filter;
      const handleClear = () => updateFilters({ [filterName]: void 0 });
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ActivatedFilterItem, { onUpdate: updateFilters, onClear: handleClear, filter }, filterName);
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("filters:ds.addNewFilter.label") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { sameWidth: true, align: "start", sideOffset: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: allowedFilters.map((filter) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        DisplayFilterMenuItem,
        {
          filterName: filter,
          onSelect: (filters2) => {
            updateFilters(filters2);
            setOpen(false);
          }
        },
        filter
      )) }) })
    ] })
  ] });
};
const useGetCasesQuery = (inboxId, filters, limit, order) => {
  const getCases = useServerFn(getCasesFn);
  return useInfiniteQuery({
    queryKey: ["cases", "get-cases", inboxId, filters, limit, order],
    queryFn: async ({ pageParam }) => {
      const result = await getCases({
        data: {
          inboxId,
          ...filters ?? {},
          offsetId: pageParam ?? void 0,
          limit,
          order
        }
      });
      return result;
    },
    initialPageParam: null,
    getNextPageParam: (page, _pages) => {
      return page?.hasNextPage ? page.items[page.items.length - 1]?.id : null;
    },
    placeholderData: keepPreviousData
  });
};
const useMassUpdateCasesMutation = () => {
  const massUpdateCases = useServerFn(massUpdateCasesFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "mass-update"],
    mutationFn: async (payload) => massUpdateCases({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });
};
const useCreateCaseMutation = () => {
  const createCase = useServerFn(createCaseFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "create-case"],
    mutationFn: async (payload) => createCase({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });
};
function CreateCase({ inboxId }) {
  const { t: t2 } = useTranslation(["cases", "common"]);
  const inboxesQuery = useGetInboxesQuery();
  const createCaseMutation = useCreateCaseMutation();
  const revalidate = useLoaderRevalidator();
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      name: "",
      inboxId: inboxId ?? ""
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createCaseMutation.mutateAsync(value).then(() => {
          queryClient.invalidateQueries({ queryKey: ["cases", "get-cases", value.inboxId] });
          revalidate();
        }).catch(() => {
          zt.error(t2("common:errors.unknown"));
        });
      }
    },
    validators: {
      onSubmit: createCasePayloadSchema
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(form), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: t2("cases:case.new_case") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        form.Field,
        {
          name: "name",
          validators: {
            onBlur: createCasePayloadSchema.shape.name,
            onChange: createCasePayloadSchema.shape.name
          },
          children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, className: "text-xs first-letter:capitalize", children: t2("cases:case.name") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormInput,
              {
                type: "text",
                name: field.name,
                defaultValue: field.state.value,
                onChange: (e) => field.handleChange(e.currentTarget.value),
                valid: field.state.meta.errors.length === 0,
                placeholder: t2("cases:case.new_case.placeholder")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        form.Field,
        {
          name: "inboxId",
          validators: {
            onBlur: createCasePayloadSchema.shape.inboxId,
            onChange: createCasePayloadSchema.shape.inboxId
          },
          children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, className: "text-xs first-letter:capitalize", children: t2("cases:case.new_case.select_inbox") }),
            inboxesQuery.isSuccess ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              SelectV2,
              {
                className: "w-full overflow-hidden",
                placeholder: "",
                value: field.state.value,
                options: inboxesQuery.data.inboxes.map(({ name, id }) => ({ label: name, value: id })),
                onChange: (inboxId2) => {
                  field.handleChange(inboxId2);
                }
              }
            ) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Footer, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.FooterButton, { type: "submit", label: t2("cases:case.new_case.create"), leadingIcon: "plus" }) })
  ] }) }) });
}
const BatchActions = ({ onMassUpdateCases, assignableUsers, inboxes, selectedCases }) => {
  const [open, setOpen] = reactExports.useState(false);
  const { t: t2 } = useTranslation(["common", "cases"]);
  const canReopen = selectedCases.some(({ status }) => status === "closed");
  const canClose = selectedCases.some(({ status }) => status !== "closed");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "medium", variant: "secondary", appearance: "stroked", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "checked", className: "size-4" }),
      t2("common:actions"),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-right", className: "size-4" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { side: "right", align: "start", sideOffset: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
      canReopen ? /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { onSelect: () => onMassUpdateCases(selectedCases, { action: "reopen" }), children: t2("cases:case.batch_actions.reopen") }) : null,
      canClose ? /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { onSelect: () => onMassUpdateCases(selectedCases, { action: "close" }), children: t2("cases:case.batch_actions.lose") }) : null,
      assignableUsers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SubMenu, { trigger: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("cases:case.batch_actions.assign") }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: assignableUsers.map(({ userId, firstName, lastName }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        MenuCommand.Item,
        {
          onSelect: () => onMassUpdateCases(selectedCases, { action: "assign", assigneeId: userId }),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { size: "xs", firstName, lastName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: `${t$3(firstName)} ${t$3(lastName)}` })
          ] })
        },
        userId
      )) }) }) : null,
      inboxes.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SubMenu, { trigger: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("cases:case.batch_actions.move_to_inbox") }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: inboxes.map(({ id, name }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        MenuCommand.Item,
        {
          onSelect: () => onMassUpdateCases(selectedCases, { action: "move_to_inbox", inboxId: id }),
          children: name
        },
        id
      )) }) }) : null
    ] }) })
  ] });
};
function InboxEmptyState({ canManageInboxes }) {
  const { t: t2 } = useTranslation(["cases"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border bg-surface-card flex flex-col items-center gap-md rounded-lg border p-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-purple-background-light flex size-12 items-center justify-center rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "inbox", className: "text-purple-primary size-6" }) }),
    canManageInboxes ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-grey-secondary text-center text-s font-medium", children: t2("cases:inbox.need_first_inbox") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/settings/inboxes", className: CtaV2ClassName({ variant: "primary", size: "medium" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "settings", className: "size-4" }),
        t2("cases:inbox.go_to_inbox_settings")
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CalloutV2, { children: t2("cases:inbox.need_inbox_contact_admin") })
  ] });
}
const SelectCaseById = ({ onNavigate }) => {
  const [open, setOpen] = reactExports.useState(false);
  const [value, setValue] = reactExports.useState("");
  const { t: t2 } = useTranslation(["cases"]);
  const buttonText = t2("cases:search.select_by_id");
  const handleSubmitValue = () => {
    const valueTrimmed = value.trim();
    if (uuid().safeParse(valueTrimmed).success) {
      onNavigate(valueTrimmed);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") {
      return;
    }
    handleSubmitValue();
  };
  return open ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    Input,
    {
      size: "medium",
      type: "text",
      placeholder: buttonText,
      value,
      onChange: (e) => setValue(e.target.value),
      onKeyDown: handleKeyDown,
      autoFocus: true,
      className: "w-85",
      endAdornment: "arrow-right",
      onEnterKeyDown: handleSubmitValue
    }
  ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "medium", onClick: () => setOpen(true), children: [
    buttonText,
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-right", className: "size-4" })
  ] });
};
const ALLOWED_FILTERS = [
  "dateRange",
  "statuses",
  "qualification",
  "includeSnoozed",
  "excludeAssigned",
  "assignee",
  "tagId"
];
const EXCLUDED_FILTERS = ["excludeAssigned", "assignee"];
const InboxPage = ({
  inboxId,
  inboxes,
  inboxUsersIds,
  canViewNavigationTabs,
  query,
  limit,
  order,
  updatePage,
  onInboxSelect,
  favoriteInboxId: initialFavoriteInboxId
}) => {
  const { t: t2 } = useTranslation(["common", "cases"]);
  const [searchValue, setSearchValue] = reactExports.useState("");
  const [favoriteInboxId, setFavoriteInboxId] = reactExports.useState(initialFavoriteInboxId);
  const [isAddingCase, setIsAddingCase] = reactExports.useState(false);
  const { orgUsers } = useOrganizationUsers();
  const navigate = useAgnosticNavigation();
  const assignableUsers = reactExports.useMemo(() => {
    return orgUsers.filter(({ userId, role }) => inboxUsersIds.includes(userId) || role === "ADMIN");
  }, [orgUsers, inboxUsersIds]);
  const allowedFilters = reactExports.useMemo(() => {
    if (inboxId === MY_INBOX_ID) {
      return ALLOWED_FILTERS.filter((filter) => !EXCLUDED_FILTERS.includes(filter));
    }
    return ALLOWED_FILTERS;
  }, [inboxId]);
  const parsedQuery = useBase64Query(filtersSchema, query, {
    onUpdate(newQuery) {
      updatePage(newQuery, limit, order);
    }
  });
  const casesQuery = useGetCasesQuery(inboxId, parsedQuery.data, limit, order);
  const massUpdateCasesMutation = useMassUpdateCasesMutation();
  const queryClient = useQueryClient();
  const isSubsequentlyFetching = casesQuery.isFetchingNextPage || casesQuery.isFetching && !casesQuery.isPending;
  const [currentPage, setCurrentPage] = reactExports.useState(0);
  const lastFirstPageResultRef = reactExports.useRef();
  const hasChangedFiltersOrInboxRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    hasChangedFiltersOrInboxRef.current = true;
  }, [inboxId, query]);
  reactExports.useEffect(() => {
    if (lastFirstPageResultRef.current !== casesQuery.data?.pages[0]) {
      lastFirstPageResultRef.current = casesQuery.data?.pages[0];
      if (hasChangedFiltersOrInboxRef.current) {
        hasChangedFiltersOrInboxRef.current = false;
        setCurrentPage(0);
      }
    }
  }, [casesQuery.data?.pages[0]]);
  const onMassUpdateCases = (items, params) => {
    const caseIds = items.map((item) => item.id);
    massUpdateCasesMutation.mutateAsync({ caseIds, ...params }).then((res) => {
      queryClient.invalidateQueries();
    });
  };
  const handleNavigate = (caseId) => {
    navigate({
      pathname: `/cases/${fromUUIDtoSUUID(caseId)}`,
      search: inboxId === MY_INBOX_ID ? void 0 : `?fromInbox=${fromUUIDtoSUUID(inboxId)}`
    });
  };
  if (inboxes.length === 0 && inboxId === MY_INBOX_ID) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Main, { className: "flex flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { children: [
      canViewNavigationTabs ? /* @__PURE__ */ jsxRuntimeExports.jsx(CasesNavigationTabs, {}) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(InboxEmptyState, { canManageInboxes: canViewNavigationTabs })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "h-1 animate-gradient bg-linear-to-r from-transparent from-25% via-purple-primary to-transparent to-75% invisible",
          {
            visible: isSubsequentlyFetching
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "table", children: [
      canViewNavigationTabs ? /* @__PURE__ */ jsxRuntimeExports.jsx(CasesNavigationTabs, {}) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MultiSelect.Root, { id: inboxId, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MultiSelect.Subscribe, { children: (count, items) => {
              if (count === 0 || !casesQuery.isSuccess) return null;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                BatchActions,
                {
                  selectedCases: items,
                  inboxes,
                  assignableUsers,
                  onMassUpdateCases
                }
              );
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              InboxFilterBar,
              {
                inboxId,
                inboxes,
                allowedFilters,
                filters: parsedQuery.asArray,
                updateFilters: parsedQuery.update,
                onInboxSelect
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FavoriteInboxButton,
              {
                inboxId,
                isFavorite: favoriteInboxId === (inboxId === MY_INBOX_ID ? inboxId : fromUUIDtoSUUID(inboxId)),
                onToggle: setFavoriteInboxId
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectCaseById, { onNavigate: handleNavigate }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SearchInput,
              {
                size: "medium",
                className: "w-60",
                placeholder: t2("cases:search.placeholder"),
                value: searchValue,
                onChange: setSearchValue,
                onEnterKeyDown: (value) => {
                  parsedQuery.update({ name: value });
                  setSearchValue("");
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "medium",
                variant: "primary",
                appearance: "stroked",
                mode: "icon",
                "data-test": "create-case-trigger",
                onClick: () => {
                  setIsAddingCase(true);
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: isAddingCase, onOpenChange: setIsAddingCase, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreateCase, { inboxId: inboxId === MY_INBOX_ID ? null : inboxId }) })
          ] })
        ] }),
        M(casesQuery).with({ isPending: true }, () => {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: " border border-grey-border rounded-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-13 border-b border-grey-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-30 bg-grey-background animate-pulse flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-12" }) })
          ] });
        }).with({ isError: true }, () => {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-red-disabled bg-red-background text-red-primary mt-md rounded-sm border p-lg flex flex-col gap-sm items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("cases:errors.fetching_cases") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => casesQuery.refetch(), children: t2("common:retry") })
          ] });
        }).with({ isSuccess: true }, (successCasesQuery) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            CasesList,
            {
              casesQuery: successCasesQuery,
              sorting: order,
              limit,
              setLimit: (newLimit) => updatePage(query, newLimit, order),
              onSortingChange: (newOrder) => updatePage(query, limit, newOrder),
              currentPage,
              setCurrentPage,
              fromInboxId: inboxId
            },
            inboxId
          );
        }).exhaustive()
      ] }) })
    ] })
  ] });
};
function CasesInboxesPage() {
  const navigate = useNavigate();
  const {
    inboxId,
    inboxes,
    inboxUsersIds,
    canViewNavigationTabs,
    query,
    limit,
    order,
    favoriteInboxId
  } = Route.useLoaderData();
  const updatePage = (newQuery, newLimit, newOrder) => {
    navigate({
      to: ".",
      from: "/cases/inboxes/$inboxId",
      search: {
        q: newQuery !== "" ? newQuery : void 0,
        limit: newLimit !== DEFAULT_CASE_PAGINATION_SIZE ? newLimit : void 0,
        order: newOrder !== "DESC" ? newOrder : void 0
      },
      replace: true
    });
  };
  const onInboxSelect = (inboxId2) => {
    const inboxIdSUUID = inboxId2 === MY_INBOX_ID ? inboxId2 : fromUUIDtoSUUID(inboxId2);
    navigate({
      to: `/cases/inboxes/$inboxId`,
      params: {
        inboxId: inboxIdSUUID
      }
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(InboxPage, { inboxId, inboxes, inboxUsersIds, canViewNavigationTabs, query, limit, order, updatePage, onInboxSelect, favoriteInboxId });
}
export {
  CasesInboxesPage as component
};
