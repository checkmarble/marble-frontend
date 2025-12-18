import { h as getRelatedCasesByObjectFn } from "./cases-DJ9ABIdo.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, j as Tag } from "./format-NPGUXq-g.js";
const useRelatedCasesByObjectQuery = (objectType, objectId) => {
  const getRelatedCasesByObject = useServerFn(getRelatedCasesByObjectFn);
  return useQuery({
    queryKey: ["cases", "related", objectType, objectId],
    queryFn: async () => {
      return getRelatedCasesByObject({ data: { objectType, objectId } });
    }
  });
};
const CONTINUOUS_SCREENING_STATUS_COLOR_MAP = {
  in_review: "orange",
  confirmed_hit: "red",
  no_hit: "green"
};
function ReviewStatusBadge({
  status,
  hitsCount
}) {
  const { t } = useTranslation(["screenings"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: CONTINUOUS_SCREENING_STATUS_COLOR_MAP[status], children: t(`screenings:status.${status}`, { count: hitsCount }) });
}
export {
  ReviewStatusBadge as R,
  useRelatedCasesByObjectQuery as u
};
