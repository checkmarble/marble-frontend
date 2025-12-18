import { h as refineScreeningFn, i as searchScreeningMatchesFn } from "./screenings-CS8peAlI.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
const useRefineScreeningMutation = () => {
  const refineScreening = useServerFn(refineScreeningFn);
  return useMutation({
    mutationFn: async (formValues) => {
      return refineScreening({ data: formValues });
    }
  });
};
const useSearchScreeningMatchesMutation = () => {
  const searchScreeningMatches = useServerFn(searchScreeningMatchesFn);
  return useMutation({
    mutationFn: async (formValues) => {
      return searchScreeningMatches({ data: formValues });
    }
  });
};
export {
  useRefineScreeningMutation as a,
  useSearchScreeningMatchesMutation as u
};
