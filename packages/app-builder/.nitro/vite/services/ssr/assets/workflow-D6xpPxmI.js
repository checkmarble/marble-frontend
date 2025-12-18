import { r as reactExports, R as jsxRuntimeExports, $ as ClientOnly } from "../server.js";
import { an as Route, E as ErrorComponent } from "./router-vb7i5euz.js";
import { c as createWorkflowRuleFn, d as deleteWorkflowRuleFn, r as reorderWorkflowsFn, u as useListRulesQuery } from "./list-rules-B6T9EKOJ.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useTranslation, e as Icon } from "./format-NPGUXq-g.js";
import { M } from "./services-middleware-DR8Hua1Y.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./short-uuid-MIi3jWzx.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./auth-middleware-C4ap47rJ.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "./update-workflow-rule-D4tbolCA.js";
import "./isDeepEqual-C0XXZLYo.js";
import "./useQuery-B7mL_evE.js";
import "./useBaseQuery-CMboOtTR.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "node:crypto";
function useCreateRuleMutation() {
  const createWorkflowRule = useServerFn(createWorkflowRuleFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input) => {
      await createWorkflowRule({ data: input });
      return input;
    },
    onSuccess: ({ scenarioId }) => {
      queryClient.invalidateQueries({ queryKey: ["workflow-rules", scenarioId] });
    }
  });
}
function useDeleteRuleMutation() {
  const deleteWorkflowRule = useServerFn(deleteWorkflowRuleFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ruleId, scenarioId }) => {
      await deleteWorkflowRule({ data: { ruleId } });
      return { ruleId, scenarioId };
    },
    onSuccess: ({ scenarioId }) => {
      queryClient.invalidateQueries({
        queryKey: ["workflow-rules", scenarioId]
      });
    }
  });
}
function useReorderRulesMutation() {
  const reorderWorkflows = useServerFn(reorderWorkflowsFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ scenarioId, ruleIds }) => {
      queryClient.setQueryData(["workflow-rules", scenarioId], (oldData) => {
        if (!oldData?.workflow) return oldData;
        const ruleMap = new Map(oldData.workflow.map((rule) => [rule.id, rule]));
        const reorderedRules = ruleIds.map((id) => ruleMap.get(id)).filter(Boolean);
        return { ...oldData, workflow: reorderedRules };
      });
      try {
        await reorderWorkflows({ data: { scenarioId, ruleIds } });
      } catch {
        queryClient.invalidateQueries({ queryKey: ["workflow-rules", scenarioId] });
        throw new Error("Failed to reorder rules");
      }
      return { scenarioId, ruleIds };
    },
    onSuccess: ({ scenarioId }) => {
      queryClient.invalidateQueries({ queryKey: ["workflow-rules", scenarioId] });
    }
  });
}
const WorkflowContext = reactExports.createContext(null);
function WorkflowProvider({
  children,
  scenarioId,
  dataModel,
  workflowDataFeatureAccess
}) {
  const { t } = useTranslation(["workflows"]);
  const rulesQuery = useListRulesQuery(scenarioId);
  const createRuleMutation = useCreateRuleMutation();
  const deleteRuleMutation = useDeleteRuleMutation();
  const reorderRulesMutation = useReorderRulesMutation();
  const [ruleOrder, setRuleOrder] = reactExports.useState([]);
  const [isDragging, setIsDragging] = reactExports.useState(false);
  const [justReordered, setJustReordered] = reactExports.useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = reactExports.useState(false);
  const [editingRuleId, setEditingRuleId] = reactExports.useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = reactExports.useState(false);
  const [ruleToDelete, setRuleToDelete] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (rulesQuery.data?.workflow && !justReordered) {
      const order = rulesQuery.data.workflow.map((rule) => rule.id);
      setRuleOrder(order);
    }
  }, [rulesQuery.data?.workflow, justReordered]);
  const createRule = async () => {
    try {
      await createRuleMutation.mutateAsync({
        scenarioId,
        name: "New Rule",
        fallthrough: false
      });
      setShouldScrollToBottom(true);
    } catch (error) {
      console.error("Failed to create rule:", error);
      zt.error("Failed to create rule");
    }
  };
  const deleteRule = (ruleId, ruleName) => {
    setRuleToDelete({ id: ruleId, name: ruleName });
    setDeleteModalOpen(true);
  };
  const confirmDeleteRule = async () => {
    if (!ruleToDelete) return;
    try {
      await deleteRuleMutation.mutateAsync({
        ruleId: ruleToDelete.id,
        scenarioId
      });
      setDeleteModalOpen(false);
      setRuleToDelete(null);
    } catch (error) {
      console.error("Failed to delete rule:", error);
      zt.error("Failed to delete rule");
    }
  };
  const cancelDeleteRule = () => {
    setDeleteModalOpen(false);
    setRuleToDelete(null);
  };
  const reorderRules = async (sourceIndex, destinationIndex) => {
    const newOrder = Array.from(ruleOrder);
    const [reorderedItem] = newOrder.splice(sourceIndex, 1);
    if (reorderedItem) {
      newOrder.splice(destinationIndex, 0, reorderedItem);
      setRuleOrder(newOrder);
      setJustReordered(true);
      try {
        await reorderRulesMutation.mutateAsync({
          scenarioId,
          ruleIds: newOrder
        });
        setJustReordered(false);
      } catch (error) {
        console.error("Failed to reorder rules:", error);
        if (rulesQuery.data?.workflow) {
          setRuleOrder(rulesQuery.data.workflow.map((rule) => rule.id));
        }
        setJustReordered(false);
        zt.error(t("workflows:rules_reorder.toast.error"));
      }
    }
  };
  const value = {
    // Data
    rules: rulesQuery.data?.workflow || [],
    dataModel,
    workflowDataFeatureAccess,
    triggerObjectType: rulesQuery.data?.triggerObjectType,
    isLoading: rulesQuery.isLoading,
    isError: rulesQuery.isError,
    error: rulesQuery.error,
    scenarioId,
    // State
    ruleOrder,
    isDragging,
    shouldScrollToBottom,
    editingRuleId,
    // Modal state
    deleteModalOpen,
    ruleToDelete,
    // Workflow-level actions only
    createRule,
    deleteRule,
    confirmDeleteRule,
    cancelDeleteRule,
    reorderRules,
    // Drag and drop
    setIsDragging,
    setShouldScrollToBottom,
    setDeleteModalOpen,
    // Editing state
    setEditingRuleId
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(WorkflowContext.Provider, { value, children });
}
function useWorkflow() {
  const context = reactExports.useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
}
function WorkflowContent() {
  const {
    t
  } = useTranslation(["common"]);
  const {
    isLoading,
    isError,
    error
  } = useWorkflow();
  return M({
    isLoading,
    isError
  }).with({
    isError: true
  }, () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorComponent, { error });
  }).with({
    isLoading: true
  }, () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center h-full w-full text-purple-hover gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-10 animate-spin" }),
      t("common:loading")
    ] });
  }).otherwise(() => /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {}) }));
}
function WorkflowPage() {
  const {
    scenarioId,
    dataModel,
    workflowFeatureAccess
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(WorkflowProvider, { scenarioId, dataModel, workflowDataFeatureAccess: workflowFeatureAccess, children: /* @__PURE__ */ jsxRuntimeExports.jsx(WorkflowContent, {}) });
}
export {
  WorkflowPage as component
};
