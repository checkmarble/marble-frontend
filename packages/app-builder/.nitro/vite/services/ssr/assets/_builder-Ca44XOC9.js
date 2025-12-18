import { R as jsxRuntimeExports, r as reactExports, U as useHydrated, $ as ClientOnly, ae as Outlet } from "../server.js";
import { dE as Logo, u as useTranslation, e as Icon, dF as format, d as cn } from "./format-NPGUXq-g.js";
import { b1 as getClientEnv, b2 as fr, b3 as setUser, a1 as isAnalyst, M, aX as z } from "./services-middleware-DR8Hua1Y.js";
import { n as navigationI18n, S as SidebarLink } from "./Navigation-BesW3Lcl.js";
import { u as useLocation, R as Route } from "./router-vb7i5euz.js";
import { N as Nudge } from "./Nudge-C1ux5IUa.js";
import { u as useUnavailabilitySettings } from "./personal-settings-CSIXhRmH.js";
import { O as OrganizationDetailsContextProvider } from "./organization-detail-YGkE0F4y.js";
import { O as OrganizationObjectTagsContextProvider } from "./organization-object-tags-C9Gf0Ixc.js";
import { O as OrganizationTagsContextProvider } from "./organization-tags-CEJpwTHZ.js";
import { O as OrganizationUsersContextProvider } from "./organization-users-Bxl0ZW8k.js";
import { a as useSegmentIdentification } from "./index-QKAcT_2P.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./auth-middleware-C4ap47rJ.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./CopyToClipboardButton-CJNJJful.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "./index-CtZTigeT.js";
import "./index-BF4TC3go.js";
import "./index-C_WgunUr.js";
import "./index-CR1bHmei.js";
import "./settings-CPv2zx4k.js";
import "./settings-CEpHMlp5.js";
import "./useQuery-B7mL_evE.js";
import "./useBaseQuery-CMboOtTR.js";
import "./useMutation-C5oG90Zs.js";
import "./useServerFn-CrqFKl7V.js";
import "./create-context-CYc8deix.js";
function CustomLogo({
  logo,
  alt = "Logo",
  className,
  hideWhenCustom,
  customLogoClassName,
  ...props
}) {
  const customLogoUrl = getClientEnv("CUSTOM_LOGO_URL");
  if (customLogoUrl) {
    if (hideWhenCustom) {
      return null;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: customLogoUrl, alt, className: customLogoClassName ?? className });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { logo, className, ...props });
}
function HeaderLogo() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group flex w-full flex-row items-center justify-between gap-sm overflow-hidden rounded-md p-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CustomLogo,
      {
        logo: "logo",
        alt: "Logo",
        className: "size-6 shrink-0 transition-all group-hover/sidebar:size-12 delay-400 group-hover/sidebar:delay-200 text-grey-primary",
        customLogoClassName: "size-8 shrink-0 object-contain transition-all group-hover/sidebar:size-14 delay-400 group-hover/sidebar:delay-200"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CustomLogo,
      {
        logo: "marble",
        alt: "Logo",
        className: "h-6 w-full opacity-0 transition-opacity group-hover/sidebar:opacity-100 delay-400 group-hover/sidebar:delay-200 dark:invert",
        hideWhenCustom: true
      }
    )
  ] }) }) });
}
function LeftSidebar({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group/sidebar sticky top-0 left-0 z-20 h-screen max-h-screen w-14 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group/nav flex h-full w-14 flex-col border-e border-e-grey-border bg-surface-sidebar transition-all delay-400 group-hover/sidebar:absolute group-hover/sidebar:top-0 group-hover/sidebar:left-0 group-hover/sidebar:w-58.5 group-hover/sidebar:shadow-sticky-left group-hover/sidebar:delay-200 motion-reduce:delay-0 motion-reduce:duration-0", children }) });
}
function UnavailableBanner() {
  const { t } = useTranslation(["settings"]);
  const { query: unavailabilityQuery } = useUnavailabilitySettings();
  const [isOpen, setIsOpen] = reactExports.useState(true);
  if (!isOpen || unavailabilityQuery?.isPending || unavailabilityQuery?.isSuccess && unavailabilityQuery.data?.until === null) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed z-10 bottom-0 start-0 flex justify-between w-full p-sm border-t bg-red-hover border-grey-border shadow-sticky-top", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center text-md text-grey-white dark:text-grey-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex p-xs me-md text-grey-white rounded-full w-6 h-6 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "account-circle-off", className: "size-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-grey-white", children: t("unavailableBanner.caption", {
        date: format(unavailabilityQuery.data?.until, "dd/MM/yyyy", {
          locale: fr
        })
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setIsOpen(false),
        "data-dismiss-target": "#bottom-banner",
        type: "button",
        className: "shrink-0 inline-flex justify-center w-7 h-7 items-center text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-xs dark:hover:bg-gray-600 dark:hover:text-white",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "size-6 text-grey-white" })
      }
    ) })
  ] });
}
const getSentryReplay = () => typeof window !== "undefined" ? window.__sentryReplay : void 0;
function useSentryIdentification(user) {
  const isHydrated = useHydrated();
  reactExports.useEffect(() => {
    if (isHydrated && user.actorIdentity.userId) {
      setUser({
        id: user.actorIdentity.userId,
        email: user.actorIdentity.email,
        username: [user.actorIdentity.firstName, user.actorIdentity.lastName].filter(Boolean).join(" ") || void 0
      });
    }
  }, [
    user.actorIdentity.userId,
    user.actorIdentity.email,
    user.actorIdentity.firstName,
    user.actorIdentity.lastName,
    isHydrated
  ]);
}
function useSentryReplay(sentryReplayEnabled) {
  const isHydrated = useHydrated();
  const location = useLocation();
  reactExports.useEffect(() => {
    if (isHydrated && sentryReplayEnabled) {
      const replay = getSentryReplay();
      replay?.start();
      replay?.flush({ continueRecording: true });
    }
  }, [isHydrated, sentryReplayEnabled, location.pathname]);
}
const i18n = ["common", ...navigationI18n];
const SIDEBAR_NUDGE_CLASS = cn("absolute top-sm right-sm translate-x-[50%] -translate-y-[50%] rounded-full size-2.5", "group-hover/sidebar:static group-hover/sidebar:translate-x-0 group-hover/sidebar:translate-y-0", "group-hover/sidebar:rounded-sm group-hover/sidebar:size-6", "transition-all delay-400 group-hover/sidebar:delay-200 motion-reduce:delay-0 motion-reduce:duration-0");
const SIDEBAR_NUDGE_ICON_CLASS = "size-2.5 group-hover/sidebar:size-3";
function SidebarNudge(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Nudge, { ...props, className: SIDEBAR_NUDGE_CLASS, iconClass: SIDEBAR_NUDGE_ICON_CLASS });
}
function Builder() {
  const {
    user,
    orgUsers,
    organization,
    orgTags,
    orgObjectTags,
    featuresAccess,
    sentryReplayEnabled
  } = Route.useLoaderData();
  useSegmentIdentification(user);
  useSentryIdentification(user);
  useSentryReplay(sentryReplayEnabled);
  const {
    t
  } = useTranslation(i18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(OrganizationDetailsContextProvider, { org: organization, currentUser: user, children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrganizationUsersContextProvider, { orgUsers, children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrganizationTagsContextProvider, { orgTags, children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrganizationObjectTagsContextProvider, { tags: orgObjectTags, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex min-h-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(LeftSidebar, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24 px-xs pt-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderLogo, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "flex flex-col gap-sm", children: [
          !isAnalyst(user) && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarLink, { labelTKey: "navigation:detection", to: "/detection", Icon: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "scenarios", ...props }) }) }),
          !isAnalyst(user) && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: M(featuresAccess.userScoring).with(z.union("allowed", "test"), () => {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarLink, { labelTKey: "navigation:user_scoring", to: "/user-scoring", Icon: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "123", ...props }) });
          }).otherwise((value) => {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-grey-disabled relative flex gap-sm p-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "123", className: "size-6 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s line-clamp-1 text-start font-medium opacity-0 transition-opacity group-hover/sidebar:opacity-100 delay-400 group-hover/sidebar:delay-200", children: t("navigation:user_scoring") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarNudge, { kind: value, content: t("navigation:user_scoring.nudge") })
            ] });
          }) }),
          !isAnalyst(user) && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: M(featuresAccess.continuousScreening).with(z.union("allowed", "test"), () => {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarLink, { labelTKey: "navigation:continuous_screening", to: "/continuous-screening", Icon: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "scan-eye", ...props }) });
          }).otherwise((value) => {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-grey-disabled relative flex gap-sm p-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "scan-eye", className: "size-6 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s line-clamp-1 text-start font-medium opacity-0 transition-opacity group-hover/sidebar:opacity-100 delay-400 group-hover/sidebar:delay-200", children: t("navigation:continuous_screening") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarNudge, { kind: value, content: t("navigation:continuous_screening.nudge") })
            ] });
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarLink, { labelTKey: "navigation:case_manager", to: "/cases", Icon: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "case-manager", ...props }) }) }),
          featuresAccess.isScreeningSearchAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarLink, { labelTKey: "navigation:screening_search", to: "/screening-search", Icon: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "search", ...props }) }) }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarLink, { labelTKey: "navigation:client_detail", to: "/client-detail", Icon: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "users", ...props }) }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "p-sm pb-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "flex flex-col gap-sm", children: [
          !isAnalyst(user) && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarLink, { labelTKey: "navigation:data", to: "/data", Icon: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "harddrive", ...props }) }) }),
          featuresAccess.settings.isAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarLink, { labelTKey: "navigation:settings", to: featuresAccess.settings.to, Icon: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "settings", ...props }) }) }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarLink, { labelTKey: "navigation:my_account", to: "/account", Icon: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "user", ...props }) }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
      featuresAccess.isAutoAssignmentAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(UnavailableBanner, {}) : null
    ] }) }) }) }) }) })
  ] });
}
export {
  Builder as component
};
