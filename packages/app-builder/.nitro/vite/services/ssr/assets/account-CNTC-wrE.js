import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { t as useFormatDateTime, u as useTranslation, e4 as Modal, e as Icon, q as useFormatLanguage, e5 as Calendar, B as Button, j as Tag, e6 as Radio } from "./format-NPGUXq-g.js";
import { A as Avatar } from "./Avatar-DpA4jY60.js";
import { i as AppConfigContext, j as useBuilderLayoutData, P as Page, B as BreadCrumbs } from "./router-vb7i5euz.js";
import { L as LanguagePicker } from "./LanguagePicker-Bh0_uXip.js";
import { u as useUnavailabilitySettings } from "./personal-settings-CSIXhRmH.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { aE as getDateFnsLocale, b5 as tKeyForUserRole } from "./services-middleware-DR8Hua1Y.js";
import { e as endOfDay } from "./endOfDay-DlzjvxTr.js";
import { u as useTheme } from "./ThemeContext-B40HQxfH.js";
import { l as logoutFn } from "./auth-DIvtpsPG.js";
import { u as useOrganizationDetails } from "./organization-detail-YGkE0F4y.js";
import { s as segment } from "./index-QKAcT_2P.js";
import { g as getFullName } from "./user-C_y5ayGi.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./short-uuid-MIi3jWzx.js";
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
import "./LoaderRevalidatorContext-C9s56i-l.js";
import "./set-language-Butr3gYn.js";
import "./useMutation-C5oG90Zs.js";
import "./settings-CPv2zx4k.js";
import "./settings-CEpHMlp5.js";
import "./useQuery-B7mL_evE.js";
import "./useBaseQuery-CMboOtTR.js";
import "node:crypto";
import "./config-ut8rAdyo.js";
import "./create-context-CYc8deix.js";
import "./join-BeQTfqAC.js";
function endOfToday(options) {
  return endOfDay(Date.now(), options);
}
function SetMyselfAvailable() {
  const formatDateTime = useFormatDateTime();
  const { t } = useTranslation(["common", "settings"]);
  const { query: unavailabilityQuery, deleteUnavailability } = useUnavailabilitySettings();
  const [open, setOpen] = reactExports.useState(false);
  const setMeUnavailable = () => {
    deleteUnavailability.mutate();
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm cursor-pointer p-sm rounded-sm hover:bg-red-hover text-grey-primary font-semibold bg-red-primary transition-all duration-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "account-circle-off", className: "size-5" }),
      t("settings:current_state_unavailable")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:set_myself_available.title", {
        date: unavailabilityQuery.data?.until ? formatDateTime(unavailabilityQuery.data.until, { dateStyle: "medium" }) : null
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", className: "m-xl", children: t("settings:set_myself_available.description.callout") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            label: t("settings:set_myself_available.validate.button"),
            onClick: () => setMeUnavailable(),
            leadingIcon: "account-circle"
          }
        )
      ] })
    ] })
  ] });
}
function SetMyselfUnavailable() {
  const { t } = useTranslation(["common", "settings"]);
  const language = useFormatLanguage();
  const { setUnavailability } = useUnavailabilitySettings();
  const [open, setOpen] = reactExports.useState(false);
  const [dateSelected, setDateSelected] = reactExports.useState(void 0);
  const setMeUnavailable = () => {
    setOpen(false);
    if (dateSelected) {
      setUnavailability.mutate({ until: dateSelected });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm cursor-pointer p-sm rounded-sm hover:bg-green-34 text-grey-white font-semibold bg-green-primary transition-all duration-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "account-circle", className: "size-5" }),
      t("settings:current_state_available")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { className: "gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:set_myself_unavailable.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", className: "m-md", children: t("settings:offline_mode_description") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row items-center justify-center gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Calendar,
        {
          mode: "single",
          disabled: { before: endOfToday() },
          selected: dateSelected,
          onSelect: setDateSelected,
          locale: getDateFnsLocale(language)
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            label: t("settings:set_myself_unavailable.validate.button"),
            onClick: setMeUnavailable,
            disabled: !dateSelected,
            leadingIcon: "account-circle-off"
          }
        )
      ] })
    ] })
  ] });
}
function UserAvailabilityStatus({ isAutoAssignmentAvailable }) {
  const { query: unavailabilityQuery } = useUnavailabilitySettings();
  if (!isAutoAssignmentAvailable) {
    return null;
  }
  if (unavailabilityQuery.isSuccess && unavailabilityQuery.data.until === null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SetMyselfUnavailable, {});
  }
  if (unavailabilityQuery.isSuccess && unavailabilityQuery.data.until !== null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SetMyselfAvailable, {});
  }
  return null;
}
function AccountPage() {
  const {
    t
  } = useTranslation(["navigation", "account", "common", "settings"]);
  const {
    currentUser,
    org
  } = useOrganizationDetails();
  const logout = useServerFn(logoutFn);
  const {
    theme,
    setTheme
  } = useTheme();
  const {
    versions
  } = AppConfigContext.useValue();
  const layoutData = useBuilderLayoutData();
  const isAutoAssignmentAvailable = layoutData?.featuresAccess.isAutoAssignmentAvailable ?? false;
  const {
    firstName,
    lastName,
    email
  } = currentUser.actorIdentity;
  const fullName = getFullName({
    firstName,
    lastName
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Header, { className: "justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbs, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => {
        void segment.reset();
        void logout({
          data: {}
        });
      }, children: t("common:auth.logout") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Container, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Content, { width: "fluid", centered: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { size: "xl", firstName, lastName }),
        fullName ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold tracking-tight", children: fullName }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "purple", children: t(tKeyForUserRole(currentUser.role)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: org.name })
        ] }),
        email ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `mailto:${email}`, className: "text-s text-purple-primary font-medium underline", children: email }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border-grey-border flex flex-col gap-lg rounded-lg border p-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-[272px] flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-s", children: t("account:language") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(LanguagePicker, {})
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t("account:dark_mode") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Radio.Root, { value: theme, onValueChange: (value) => setTheme(value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Radio.Item, { value: "light" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t("account:theme.light") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Radio.Item, { value: "dark" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t("account:theme.dark") })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserAvailabilityStatus, { isAutoAssignmentAvailable })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-grey-secondary flex items-center gap-md text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "monitor", className: "size-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: versions.appVersion })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "dns", className: "size-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: versions.apiVersion })
        ] })
      ] })
    ] }) }) })
  ] });
}
export {
  AccountPage as component
};
