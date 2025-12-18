import "./cases-PZYcTUxr.js";
import { v as addCommentFn } from "./cases-DJ9ABIdo.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { s as srcExports } from "./Time-IafhAG3W.js";
const useAddCommentMutation = () => {
  const addComment = useServerFn(addCommentFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "add-comment"],
    mutationFn: async (payload) => addComment({ data: srcExports.serialize(payload, { indices: true }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });
};
export {
  useAddCommentMutation as u
};
