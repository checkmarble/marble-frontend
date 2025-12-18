import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { c as createSimpleContext } from "./create-context-CYc8deix.js";
const OrganizationDetailsContext = createSimpleContext("OrganizationDetails");
function OrganizationDetailsContextProvider({
  org,
  currentUser,
  children
}) {
  const value = reactExports.useMemo(() => ({ org, currentUser }), [org, currentUser]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(OrganizationDetailsContext.Provider, { value, children });
}
const useOrganizationDetails = () => OrganizationDetailsContext.useValue();
export {
  OrganizationDetailsContextProvider as O,
  useOrganizationDetails as u
};
