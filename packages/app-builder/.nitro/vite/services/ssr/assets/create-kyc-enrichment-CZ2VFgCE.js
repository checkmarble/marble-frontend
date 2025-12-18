import { H as enrichKycFn } from "./cases-DJ9ABIdo.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
const useCreateKycEnrichmentQuery = (caseId) => {
  const enrichKyc = useServerFn(enrichKycFn);
  return useQuery({
    queryKey: ["cases", "create-kyc-enrichment", caseId],
    queryFn: async () => enrichKyc({ data: { caseId } }),
    enabled: false,
    staleTime: Infinity
  });
};
export {
  useCreateKycEnrichmentQuery as u
};
