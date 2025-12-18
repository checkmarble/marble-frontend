import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { c as createSimpleContext } from "./create-context-CYc8deix.js";
const OrganizationObjectTagsContext = createSimpleContext("OrganizationTags");
function OrganizationObjectTagsContextProvider({ tags, children }) {
  const value = reactExports.useMemo(() => {
    const orgUserMap = new Map(tags.map((tag) => [tag.id, tag]));
    return {
      orgObjectTags: tags,
      getTagById: (tagid) => orgUserMap.get(tagid)
    };
  }, [tags]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(OrganizationObjectTagsContext.Provider, { value, children });
}
const useOrganizationObjectTags = () => OrganizationObjectTagsContext.useValue();
export {
  OrganizationObjectTagsContextProvider as O,
  useOrganizationObjectTags as u
};
