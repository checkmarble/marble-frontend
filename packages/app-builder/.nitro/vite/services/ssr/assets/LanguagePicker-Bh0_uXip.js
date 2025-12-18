import { R as jsxRuntimeExports } from "../server.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { u as useSetLanguageMutation } from "./set-language-Butr3gYn.js";
import { d as supportedLngs, b4 as languageNames } from "./services-middleware-DR8Hua1Y.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useTranslation, dZ as SelectV2 } from "./format-NPGUXq-g.js";
const languageOptions = supportedLngs.map((lng) => ({
  value: lng,
  label: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { dir: languageNames[lng].dir, children: languageNames[lng].name })
}));
function LanguagePicker() {
  const {
    t,
    i18n: { language, changeLanguage }
  } = useTranslation("common");
  const setLanguageMutation = useSetLanguageMutation();
  const revalidate = useLoaderRevalidator();
  if (supportedLngs.every((lng) => lng.startsWith("en"))) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SelectV2,
    {
      options: languageOptions,
      value: language,
      onChange: (newPreferredLanguage) => {
        setLanguageMutation.mutateAsync({ preferredLanguage: newPreferredLanguage }).then(() => {
          changeLanguage(newPreferredLanguage);
          revalidate();
        }).catch(() => {
          zt.error(t("common:errors.unknown"));
        });
      },
      placeholder: languageNames["en-GB"].name
    }
  );
}
export {
  LanguagePicker as L
};
