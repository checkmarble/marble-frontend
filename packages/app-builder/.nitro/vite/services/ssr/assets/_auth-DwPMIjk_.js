import { a1 as useMatches, r as reactExports, R as jsxRuntimeExports, ae as Outlet } from "../server.js";
import { L as LanguagePicker } from "./LanguagePicker-Bh0_uXip.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { dE as Logo, f as cva } from "./format-NPGUXq-g.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./LoaderRevalidatorContext-C9s56i-l.js";
import "./set-language-Butr3gYn.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./useMutation-C5oG90Zs.js";
import "./router-vb7i5euz.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
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
import "./useServerFn-CrqFKl7V.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
const layoutClassName = cva("flex h-screen bg-[#080525]", {
  variants: {
    alignment: {
      reverse: "flex-row-reverse",
      default: null
    }
  },
  defaultVariants: {
    alignment: "default"
  }
});
function AuthLayout() {
  const matches = useMatches();
  const {
    alignment
  } = matches[matches.length - 1]?.staticData ?? {};
  const queryClient = useQueryClient();
  reactExports.useEffect(() => {
    queryClient.resetQueries();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: layoutClassName({
    alignment
  }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col grow gap-4xl justify-center items-center p-[120px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { logo: "logo-standard", className: "text-grey-white size-full h-16", preserveAspectRatio: "xMinYMid meet", "aria-labelledby": "marble" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[40px] text-[#ADA7FD] font-medium text-center", children: [
        "Iterate. Improve. ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-white", children: "Automate." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-342/198 w-full max-w-[600px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/img/main-illu.svg", alt: "main-illu", className: "size-full" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-surface-card basis-[600px] px-[120px] py-[124px] grid place-items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-6 right-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LanguagePicker, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[500px] w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
    ] })
  ] });
}
export {
  AuthLayout as component
};
