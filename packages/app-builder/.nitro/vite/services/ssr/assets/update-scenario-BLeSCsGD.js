import "./scenarios-8U74nJp4.js";
import { $ as updateScenarioFn } from "./router-vb7i5euz.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
const useUpdateScenarioMutation = () => {
  const updateScenario = useServerFn(updateScenarioFn);
  return useMutation({
    mutationKey: ["scenarios", "update"],
    mutationFn: async (data) => updateScenario({ data })
  });
};
export {
  useUpdateScenarioMutation as u
};
