import { g as getInboxesFn } from "./cases-DJ9ABIdo.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
const useGetInboxesQuery = () => {
  const getInboxes = useServerFn(getInboxesFn);
  return useQuery({
    queryKey: ["cases", "inboxes"],
    queryFn: async () => {
      return getInboxes();
    }
  });
};
export {
  useGetInboxesQuery as u
};
