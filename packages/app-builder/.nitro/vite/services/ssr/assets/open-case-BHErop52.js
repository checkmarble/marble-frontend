import "./cases-PZYcTUxr.js";
import { s as closeCaseFn, t as openCaseFn } from "./cases-DJ9ABIdo.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
const useCloseCaseMutation = () => {
  const closeCase = useServerFn(closeCaseFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "close-case"],
    mutationFn: async (payload) => closeCase({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });
};
const useOpenCaseMutation = () => {
  const openCase = useServerFn(openCaseFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "open-case"],
    mutationFn: async (payload) => openCase({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });
};
export {
  useOpenCaseMutation as a,
  useCloseCaseMutation as u
};
