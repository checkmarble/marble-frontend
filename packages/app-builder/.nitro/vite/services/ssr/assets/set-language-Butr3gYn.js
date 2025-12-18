import { c as createSsrRpc } from "./createSsrRpc-ZXUHv2Er.js";
import { s as servicesMiddleware, d as supportedLngs } from "./services-middleware-DR8Hua1Y.js";
import { _ as createServerFn } from "../server.js";
import { o as object, _ as _enum } from "./short-uuid-MIi3jWzx.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
const setLanguagePayloadSchema = object({
  preferredLanguage: _enum(supportedLngs)
});
const setLanguageFn = createServerFn({
  method: "POST"
}).middleware([servicesMiddleware]).validator(setLanguagePayloadSchema).handler(createSsrRpc("56f0cc55efe9f42480c18332b978130eb1b8c834d27c7b8d818d11fbe9a9fefe"));
const useSetLanguageMutation = () => {
  const setLanguage = useServerFn(setLanguageFn);
  return useMutation({
    mutationKey: ["settings", "set-language"],
    mutationFn: async (payload) => setLanguage({ data: payload })
  });
};
export {
  useSetLanguageMutation as u
};
