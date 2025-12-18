import "./data-fdG1PpsD.js";
import { h as createNavigationOptionFn } from "./data-BFm2FCTm.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
const useCreateNavigationOptionMutation = (tableId) => {
  const createNavigationOption = useServerFn(createNavigationOptionFn);
  return useMutation({
    mutationKey: ["data", "create-navigation-option"],
    mutationFn: async (value) => createNavigationOption({ data: { tableId, ...value } })
  });
};
const useCreateNavigationOptionForAstMutation = () => {
  const queryClient = useQueryClient();
  const createNavigationOption = useServerFn(createNavigationOptionFn);
  return useMutation({
    mutationKey: ["data", "create-navigation-option"],
    mutationFn: async ({ tableId, scenarioId: _, ...value }) => createNavigationOption({ data: { tableId, ...value } }),
    onSuccess: (_, { scenarioId }) => {
      queryClient.invalidateQueries({
        queryKey: ["resources", "builder-options", fromUUIDtoSUUID(scenarioId)]
      });
    }
  });
};
export {
  useCreateNavigationOptionMutation as a,
  useCreateNavigationOptionForAstMutation as u
};
