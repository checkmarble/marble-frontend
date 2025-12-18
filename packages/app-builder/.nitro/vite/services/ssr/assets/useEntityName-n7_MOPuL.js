import "../server.js";
import { u as useTranslation } from "./format-NPGUXq-g.js";
import { M } from "./services-middleware-DR8Hua1Y.js";
import { ab as scenarioI18n } from "./router-vb7i5euz.js";
function useEntityName() {
  const { t } = useTranslation(scenarioI18n);
  function getEntityName(entityType) {
    return M(entityType).with("Thing", () => t("scenarios:edit_sanction.entity_type.thing")).with("Person", () => t("scenarios:edit_sanction.entity_type.person")).with("Organization", () => t("scenarios:edit_sanction.entity_type.organization")).with("Vehicle", () => t("scenarios:edit_sanction.entity_type.vehicle")).otherwise(() => entityType ?? "Thing");
  }
  return { getEntityName, t };
}
export {
  useEntityName as u
};
