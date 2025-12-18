import { a as getDataModelFn } from "./data-BFm2FCTm.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
const DATA_MODEL_QUERY_KEY = ["data-model"];
const useDataModelQuery = () => {
  const getDataModel = useServerFn(getDataModelFn);
  return useQuery({
    queryKey: DATA_MODEL_QUERY_KEY,
    queryFn: async () => getDataModel({})
  });
};
export {
  useDataModelQuery as u
};
