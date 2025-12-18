import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { c as createSimpleContext } from "./create-context-CYc8deix.js";
const OrganizationTagsContext = createSimpleContext("OrganizationTags");
function OrganizationTagsContextProvider({ orgTags, children }) {
  const value = reactExports.useMemo(() => {
    const orgUserMap = new Map(orgTags.map((tag) => [tag.id, tag]));
    return {
      orgTags,
      getTagById: (tagid) => orgUserMap.get(tagid)
    };
  }, [orgTags]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(OrganizationTagsContext.Provider, { value, children });
}
const useOrganizationTags = () => OrganizationTagsContext.useValue();
export {
  OrganizationTagsContextProvider as O,
  useOrganizationTags as u
};
