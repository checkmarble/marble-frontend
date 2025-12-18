import { b as getAnnotationsFn } from "./data-BFm2FCTm.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
const EMPTY_GROUPED_ANNOTATIONS = {
  comments: [],
  tags: [],
  files: [],
  risk_tags: []
};
const useGetAnnotationsQuery = (objectType, objectId, loadThumbnails = false) => {
  const getAnnotations = useServerFn(getAnnotationsFn);
  return useQuery({
    queryKey: ["annotations", objectType, objectId, loadThumbnails],
    queryFn: async () => {
      const result = await getAnnotations({ data: { objectType, objectId, loadThumbnails } });
      return result ?? { annotations: EMPTY_GROUPED_ANNOTATIONS };
    }
  });
};
export {
  useGetAnnotationsQuery as u
};
