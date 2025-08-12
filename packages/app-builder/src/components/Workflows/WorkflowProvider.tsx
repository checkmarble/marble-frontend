import { type DataModel } from '@app-builder/models';
import { type Rule, type WorkflowFeatureAccess } from '@app-builder/models/scenario/workflow';
import {
  useCreateRuleMutation,
  useDeleteRuleMutation,
  useGetLatestRulesReferencesQuery,
  useListRulesQuery,
  useReorderRulesMutation,
} from '@app-builder/queries/Workflows';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface WorkflowContextValue {
  // Data
  rules: Rule[];
  dataModel?: DataModel;
  workflowDataFeatureAccess: WorkflowFeatureAccess;
  triggerObjectType?: string;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  scenarioId: string;

  // State
  ruleOrder: string[];
  isDragging: boolean;
  shouldScrollToBottom: boolean;
  editingRuleId: string | null;

  // Modal state
  deleteModalOpen: boolean;
  ruleToDelete: { id: string; name: string } | null;

  // Workflow-level actions only
  createRule: () => Promise<void>;
  deleteRule: (ruleId: string, ruleName: string) => void;
  confirmDeleteRule: () => Promise<void>;
  cancelDeleteRule: () => void;
  reorderRules: (sourceIndex: number, destinationIndex: number) => Promise<void>;

  // Drag and drop
  setIsDragging: (isDragging: boolean) => void;
  setShouldScrollToBottom: (shouldScroll: boolean) => void;
  setDeleteModalOpen: (open: boolean) => void;

  // Editing state
  setEditingRuleId: (ruleId: string | null) => void;
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

interface WorkflowProviderProps {
  children: ReactNode;
  scenarioId: string;
  dataModel?: DataModel;
  workflowDataFeatureAccess: WorkflowFeatureAccess;
}

export function WorkflowProvider({
  children,
  scenarioId,
  dataModel,
  workflowDataFeatureAccess,
}: WorkflowProviderProps) {
  const { t } = useTranslation(['workflows']);

  // Queries and mutations
  const rulesQuery = useListRulesQuery(scenarioId);
  const createRuleMutation = useCreateRuleMutation();
  const deleteRuleMutation = useDeleteRuleMutation();
  const reorderRulesMutation = useReorderRulesMutation();

  const latestRulesReferencesQuery = useGetLatestRulesReferencesQuery(scenarioId);

  console.log('latestRulesReferencesQuery', latestRulesReferencesQuery.data);

  // State
  const [ruleOrder, setRuleOrder] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [justReordered, setJustReordered] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<{ id: string; name: string } | null>(null);

  // Update rule order when query data changes
  useEffect(() => {
    if (rulesQuery.data?.workflow && !justReordered) {
      const order = rulesQuery.data.workflow.map((rule) => rule.id);
      setRuleOrder(order);
    }
  }, [rulesQuery.data?.workflow, justReordered]);

  // Actions
  const createRule = async () => {
    try {
      await createRuleMutation.mutateAsync({
        scenarioId,
        name: 'New Rule',
        fallthrough: false,
      });

      setShouldScrollToBottom(true);
    } catch (error) {
      console.error('Failed to create rule:', error);
      toast.error('Failed to create rule');
    }
  };

  const deleteRule = (ruleId: string, ruleName: string) => {
    setRuleToDelete({ id: ruleId, name: ruleName });
    setDeleteModalOpen(true);
  };

  const confirmDeleteRule = async () => {
    if (!ruleToDelete) return;

    try {
      await deleteRuleMutation.mutateAsync({
        ruleId: ruleToDelete.id,
        scenarioId,
      });
      setDeleteModalOpen(false);
      setRuleToDelete(null);
    } catch (error) {
      console.error('Failed to delete rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  const cancelDeleteRule = () => {
    setDeleteModalOpen(false);
    setRuleToDelete(null);
  };

  const reorderRules = async (sourceIndex: number, destinationIndex: number) => {
    const newOrder = Array.from(ruleOrder);
    const [reorderedItem] = newOrder.splice(sourceIndex, 1);
    if (reorderedItem) {
      newOrder.splice(destinationIndex, 0, reorderedItem);
      setRuleOrder(newOrder);
      setJustReordered(true);

      try {
        await reorderRulesMutation.mutateAsync({
          scenarioId,
          ruleIds: newOrder,
        });
        setJustReordered(false);
      } catch (error) {
        console.error('Failed to reorder rules:', error);
        if (rulesQuery.data?.workflow) {
          setRuleOrder(rulesQuery.data.workflow.map((rule) => rule.id));
        }
        setJustReordered(false);
        toast.error(t('workflows:rules_reorder.toast.error'));
      }
    }
  };

  const value: WorkflowContextValue = {
    // Data
    rules: rulesQuery.data?.workflow || [],
    dataModel,
    workflowDataFeatureAccess,
    triggerObjectType: rulesQuery.data?.triggerObjectType,
    isLoading: rulesQuery.isLoading,
    isError: rulesQuery.isError,
    error: rulesQuery.error as Error,
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
    setEditingRuleId,
  };

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}

export function useWorkflowDataFeatureAccess() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflowDataFeatureAccess must be used within a WorkflowProvider');
  }
  return context.workflowDataFeatureAccess;
}
