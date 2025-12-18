import { r as reactExports, R as jsxRuntimeExports, O as useRouter } from "../server.js";
import { P as Panel } from "./Panel-kj8Z2GDk.js";
import { i as getCaseNameFn } from "./cases-DJ9ABIdo.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { u as useGetAnnotationsQuery } from "./get-annotations-CiR2trFM.js";
import { u as useDownloadFile } from "./DownloadFilesService-BW-xJtj3.js";
import { aa as toDate, ab as normalizeDates, ad as compareAsc, ak as enUS, al as getTimezoneOffsetInMilliseconds, am as minutesInDay, an as minutesInMonth, ae as getDefaultOptions, M, aE as getDateFnsLocale } from "./services-middleware-DR8Hua1Y.js";
import { u as useOrganizationUsers } from "./organization-users-Bxl0ZW8k.js";
import { g as getFullName } from "./user-C_y5ayGi.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { L as Link } from "./router-vb7i5euz.js";
import { fi as endOfMonth, fj as differenceInCalendarMonths, fk as getRoundingMethod, u as useTranslation, B as Button, fl as useFormatLanguage, e as Icon, C as CtaV2ClassName } from "./format-NPGUXq-g.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { c as constructNow } from "./constructNow-sBxu05z3.js";
import { e as endOfDay } from "./endOfDay-DlzjvxTr.js";
function differenceInMilliseconds(laterDate, earlierDate) {
  return +toDate(laterDate) - +toDate(earlierDate);
}
function isLastDayOfMonth(date, options) {
  const _date = toDate(date, options?.in);
  return +endOfDay(_date, options) === +endOfMonth(_date, options);
}
function differenceInMonths(laterDate, earlierDate, options) {
  const [laterDate_, workingLaterDate, earlierDate_] = normalizeDates(
    options?.in,
    laterDate,
    laterDate,
    earlierDate
  );
  const sign = compareAsc(workingLaterDate, earlierDate_);
  const difference = Math.abs(
    differenceInCalendarMonths(workingLaterDate, earlierDate_)
  );
  if (difference < 1) return 0;
  if (workingLaterDate.getMonth() === 1 && workingLaterDate.getDate() > 27)
    workingLaterDate.setDate(30);
  workingLaterDate.setMonth(workingLaterDate.getMonth() - sign * difference);
  let isLastMonthNotFull = compareAsc(workingLaterDate, earlierDate_) === -sign;
  if (isLastDayOfMonth(laterDate_) && difference === 1 && compareAsc(laterDate_, earlierDate_) === 1) {
    isLastMonthNotFull = false;
  }
  const result = sign * (difference - +isLastMonthNotFull);
  return result === 0 ? 0 : result;
}
function differenceInSeconds(laterDate, earlierDate, options) {
  const diff = differenceInMilliseconds(laterDate, earlierDate) / 1e3;
  return getRoundingMethod(options?.roundingMethod)(diff);
}
function formatDistance(laterDate, earlierDate, options) {
  const defaultOptions = getDefaultOptions();
  const locale = options?.locale ?? defaultOptions.locale ?? enUS;
  const minutesInAlmostTwoDays = 2520;
  const comparison = compareAsc(laterDate, earlierDate);
  if (isNaN(comparison)) throw new RangeError("Invalid time value");
  const localizeOptions = Object.assign({}, options, {
    addSuffix: options?.addSuffix,
    comparison
  });
  const [laterDate_, earlierDate_] = normalizeDates(
    options?.in,
    ...comparison > 0 ? [earlierDate, laterDate] : [laterDate, earlierDate]
  );
  const seconds = differenceInSeconds(earlierDate_, laterDate_);
  const offsetInSeconds = (getTimezoneOffsetInMilliseconds(earlierDate_) - getTimezoneOffsetInMilliseconds(laterDate_)) / 1e3;
  const minutes = Math.round((seconds - offsetInSeconds) / 60);
  let months;
  if (minutes < 2) {
    if (options?.includeSeconds) {
      if (seconds < 5) {
        return locale.formatDistance("lessThanXSeconds", 5, localizeOptions);
      } else if (seconds < 10) {
        return locale.formatDistance("lessThanXSeconds", 10, localizeOptions);
      } else if (seconds < 20) {
        return locale.formatDistance("lessThanXSeconds", 20, localizeOptions);
      } else if (seconds < 40) {
        return locale.formatDistance("halfAMinute", 0, localizeOptions);
      } else if (seconds < 60) {
        return locale.formatDistance("lessThanXMinutes", 1, localizeOptions);
      } else {
        return locale.formatDistance("xMinutes", 1, localizeOptions);
      }
    } else {
      if (minutes === 0) {
        return locale.formatDistance("lessThanXMinutes", 1, localizeOptions);
      } else {
        return locale.formatDistance("xMinutes", minutes, localizeOptions);
      }
    }
  } else if (minutes < 45) {
    return locale.formatDistance("xMinutes", minutes, localizeOptions);
  } else if (minutes < 90) {
    return locale.formatDistance("aboutXHours", 1, localizeOptions);
  } else if (minutes < minutesInDay) {
    const hours = Math.round(minutes / 60);
    return locale.formatDistance("aboutXHours", hours, localizeOptions);
  } else if (minutes < minutesInAlmostTwoDays) {
    return locale.formatDistance("xDays", 1, localizeOptions);
  } else if (minutes < minutesInMonth) {
    const days = Math.round(minutes / minutesInDay);
    return locale.formatDistance("xDays", days, localizeOptions);
  } else if (minutes < minutesInMonth * 2) {
    months = Math.round(minutes / minutesInMonth);
    return locale.formatDistance("aboutXMonths", months, localizeOptions);
  }
  months = differenceInMonths(earlierDate_, laterDate_);
  if (months < 12) {
    const nearestMonth = Math.round(minutes / minutesInMonth);
    return locale.formatDistance("xMonths", nearestMonth, localizeOptions);
  } else {
    const monthsSinceStartOfYear = months % 12;
    const years = Math.trunc(months / 12);
    if (monthsSinceStartOfYear < 3) {
      return locale.formatDistance("aboutXYears", years, localizeOptions);
    } else if (monthsSinceStartOfYear < 9) {
      return locale.formatDistance("overXYears", years, localizeOptions);
    } else {
      return locale.formatDistance("almostXYears", years + 1, localizeOptions);
    }
  }
}
function formatDistanceToNow(date, options) {
  return formatDistance(date, constructNow(date), options);
}
const useGetCaseNameQuery = (caseId) => {
  const getCaseName = useServerFn(getCaseNameFn);
  return useQuery({
    queryKey: ["cases", caseId, "get-name"],
    queryFn: async () => {
      const result = await getCaseName({ data: { caseId } });
      return result;
    }
  });
};
const DocumentsList = ({ objectType, objectId }) => {
  const { t } = useTranslation(["common", "client360"]);
  const annotationsQuery = useGetAnnotationsQuery(objectType, objectId, true);
  const users = useOrganizationUsers();
  const [currentFileView, setCurrentFileView] = reactExports.useState(null);
  return M(annotationsQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: t("common:generic_fetch_data_error") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => annotationsQuery.refetch(), children: t("common:retry") })
  ] })).with({ isSuccess: true }, ({ data: { annotations } }) => {
    const documents = annotations.files;
    if (documents.length === 0) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("common:no_data_to_display") }) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 @[250px]:grid-cols-2 @[500px]:grid-cols-3 @[750px]:grid-cols-4 gap-md", children: [
      documents.map((document) => {
        const annotatedBy = users.getOrgUserById(document.annotated_by);
        return document.payload.files.map((file) => /* @__PURE__ */ jsxRuntimeExports.jsx(FileItem, { document, file, annotatedBy }, file.id));
      }),
      currentFileView ? /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: true, onOpenChange: () => setCurrentFileView(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: currentFileView.fileUrl }) }) }) }) : null
    ] });
  }).exhaustive();
};
const FileItem = ({
  document,
  file,
  annotatedBy
}) => {
  const { t } = useTranslation(["client360"]);
  const language = useFormatLanguage();
  const [previewUrl, setPreviewUrl] = reactExports.useState(null);
  const router = useRouter();
  const fileEndpoint = router.buildLocation({
    to: "/ressources/annotations/download-file/$annotationId/$fileId",
    params: {
      annotationId: document.id,
      fileId: file.id
    }
  });
  const { downloadCaseFile, downloadingCaseFile } = useDownloadFile(fileEndpoint.href, {});
  const fetchFile = async (endpoint) => {
    const response = await fetch(endpoint);
    if (response.ok) {
      return (await response.json()).url;
    }
    return null;
  };
  const onClickFile = async (annotation, file2) => {
    const fileEndpoint2 = router.buildLocation({
      to: "/ressources/annotations/download-file/$annotationId/$fileId",
      params: {
        annotationId: annotation.id,
        fileId: file2.id
      }
    });
    const contentType = file2.content_type;
    if (contentType?.startsWith("image/")) {
      const url = await fetchFile(fileEndpoint2.href);
      if (!url) {
        return;
      }
      setPreviewUrl(url);
    } else {
      downloadCaseFile();
      return;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "flex gap-sm items-center text-left cursor-pointer",
        onClick: () => onClickFile(document, file),
        disabled: downloadingCaseFile,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "size-20 border border-grey-border rounded-sm bg-cover shrink-0 relative bg-grey-background-light grid place-items-center",
              style: { backgroundImage: file.thumbnail_url ? `url(${file.thumbnail_url})` : "none" },
              children: [
                file.thumbnail_url && file.content_type !== "text/plain" ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "image-placeholder", className: "size-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: CtaV2ClassName({
                      variant: "secondary",
                      mode: "icon",
                      className: "absolute top-xs right-xs"
                    }),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: file.content_type?.startsWith("image/") ? "eye" : "download", className: "size-3.5" })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs text-tiny text-grey-secondary truncate", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-default text-grey-primary truncate", children: file.filename }),
            document.case_id ? /* @__PURE__ */ jsxRuntimeExports.jsx(CaseLink, { caseId: document.case_id }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("client360:client_detail.documents.annotated_by", {
              name: annotatedBy ? getFullName(annotatedBy) : t("client360:client_detail.documents.unknown_user")
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDistanceToNow(new Date(document.created_at), {
              locale: getDateFnsLocale(language),
              addSuffix: true
            }) })
          ] })
        ]
      },
      file.id
    ),
    previewUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: true, onOpenChange: () => setPreviewUrl(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: file.filename }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-default text-grey-secondary font-normal flex gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDistanceToNow(new Date(document.created_at), {
            locale: getDateFnsLocale(language),
            addSuffix: true
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("client360:client_detail.documents.annotated_by", {
            name: annotatedBy ? getFullName(annotatedBy) : t("client360:client_detail.documents.unknown_user")
          }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: previewUrl })
    ] }) }) }) : null
  ] });
};
const CaseLink = ({ caseId }) => {
  const { t } = useTranslation(["common", "client360"]);
  const caseQuery = useGetCaseNameQuery(caseId);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Link,
    {
      to: "/cases/$caseId",
      params: { caseId: fromUUIDtoSUUID(caseId) },
      className: "text-purple-primary hover:text-purple-hover truncate",
      children: M(caseQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-4" })).with({ isError: true }, () => t("common:unknown")).with({ isSuccess: true }, ({ data }) => data.name).exhaustive()
    }
  );
};
export {
  DocumentsList as D
};
