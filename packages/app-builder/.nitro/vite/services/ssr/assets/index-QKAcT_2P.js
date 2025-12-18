import { U as useHydrated, r as reactExports, a1 as useMatches } from "../server.js";
import { u as useLocation } from "./router-vb7i5euz.js";
import { s as shortUUIDSchema } from "./input-validation-CU_reV2S.js";
import { o as object } from "./short-uuid-MIi3jWzx.js";
function getPageViewNameAndProps(thisPage) {
  switch (thisPage.id) {
    case "routes/_builder/detection/scenarios/index": {
      return { name: "Scenarios", properties: void 0 };
    }
    case "routes/_builder/detection/scenarios/$scenarioId/scheduled-executions": {
      const safeParseProperties = object({
        scenarioId: shortUUIDSchema
      }).safeParse(thisPage.params);
      if (!safeParseProperties.success) return;
      return {
        name: "Scheduled executions",
        properties: {
          scenario_id: safeParseProperties.data.scenarioId
        }
      };
    }
    case "routes/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/trigger": {
      const safeParseProperties = object({
        iterationId: shortUUIDSchema,
        scenarioId: shortUUIDSchema
      }).safeParse(thisPage.params);
      if (!safeParseProperties.success) return;
      return {
        name: "Scenario iteration trigger",
        properties: {
          iteration_id: safeParseProperties.data.iterationId,
          scenario_id: safeParseProperties.data.scenarioId
        }
      };
    }
    case "routes/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/rules": {
      const safeParseProperties = object({
        iterationId: shortUUIDSchema,
        scenarioId: shortUUIDSchema
      }).safeParse(thisPage.params);
      if (!safeParseProperties.success) return;
      return {
        name: "Scenario iteration rules",
        properties: {
          iteration_id: safeParseProperties.data.iterationId,
          scenario_id: safeParseProperties.data.scenarioId
        }
      };
    }
    case "routes/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/decision": {
      const safeParseProperties = object({
        iterationId: shortUUIDSchema,
        scenarioId: shortUUIDSchema
      }).safeParse(thisPage.params);
      if (!safeParseProperties.success) return;
      return {
        name: "Scenario iteration outcome",
        properties: {
          iteration_id: safeParseProperties.data.iterationId,
          scenario_id: safeParseProperties.data.scenarioId
        }
      };
    }
    case "routes/_builder/detection/decisions/index": {
      return { name: "Decisions", properties: void 0 };
    }
    case "routes/_builder/detection/decisions/$decisionId": {
      const safeParseProperties = object({
        decisionId: shortUUIDSchema
      }).safeParse(thisPage.params);
      if (!safeParseProperties.success) return;
      return {
        name: "Decision",
        properties: {
          decision_id: safeParseProperties.data.decisionId
        }
      };
    }
    case "routes/_builder/cases/index": {
      return { name: "Cases", properties: void 0 };
    }
    case "routes/_builder/detection/lists/index": {
      return { name: "Lists", properties: void 0 };
    }
    case "routes/_builder/detection/lists/$listId": {
      const safeParseProperties = object({
        listId: shortUUIDSchema
      }).safeParse(thisPage.params);
      if (!safeParseProperties.success) return;
      return {
        name: "List",
        properties: {
          list_id: safeParseProperties.data.listId
        }
      };
    }
    case "routes/_builder/detection/analytics/_layout": {
      return { name: "Analytics", properties: void 0 };
    }
    case "routes/_builder/data/list": {
      return { name: "Your data", properties: void 0 };
    }
    case "routes/_builder/settings/api-keys": {
      return { name: "Marble API", properties: void 0 };
    }
  }
}
function useSegmentIdentification(user) {
  const isHydrated = useHydrated();
  reactExports.useEffect(() => {
    if (isHydrated) {
      void window.analytics?.identify(user.actorIdentity.userId);
      if (user.actorIdentity.userId) {
        void window.analytics?.track("Logged In");
      }
    }
  }, [user.actorIdentity.userId, user.organizationId, isHydrated]);
}
function useSegmentPageTracking() {
  const location = useLocation();
  const isHydrated = useHydrated();
  const matches = useMatches();
  const thisPage = matches[matches.length - 1];
  reactExports.useEffect(() => {
    if (!isHydrated) return;
    if (!thisPage) return;
    const tracking = getPageViewNameAndProps(thisPage);
    if (!tracking) return;
    const { name, properties } = tracking;
    void window.analytics?.page(name, properties);
  }, [location.href, thisPage?.id, isHydrated]);
  return null;
}
const segment = {
  reset: () => window.analytics?.reset()
};
export {
  useSegmentIdentification as a,
  segment as s,
  useSegmentPageTracking as u
};
