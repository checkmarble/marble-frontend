import { type DataModel } from '@app-builder/models';
import {
  type Rule,
  type WorkflowAction,
  type WorkflowCondition,
  type WorkflowFeatureAccess,
} from '@app-builder/models/scenario/workflow';
import { validateRuleEnhanced } from '@app-builder/models/scenario/workflow-validation';
import {
  useCreateRuleMutation,
  useDeleteConditionMutation,
  useDeleteRuleMutation,
  useListRulesQuery,
  useRenameRuleMutation,
  useReorderRulesMutation,
  useUpdateRuleMutation,
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

  // State
  localWorkflowRules: Map<string, Rule>;
  ruleOrder: string[];
  modifiedRules: Set<string>;
  pendingDeletedConditions: Map<string, Set<string>>; // ruleId -> Set of conditionIds
  ruleValidationErrors: Map<string, string[]>;
  isDragging: boolean;
  shouldScrollToBottom: boolean;

  // Modal state
  deleteModalOpen: boolean;
  ruleToDelete: { id: string; name: string } | null;

  // Actions
  createRule: () => Promise<void>;
  deleteRule: (ruleId: string, ruleName: string) => void;
  confirmDeleteRule: () => Promise<void>;
  cancelDeleteRule: () => void;
  renameRule: (ruleId: string, newName: string, fallthrough: boolean) => void;
  updateRuleName: (ruleId: string, newName: string) => void;
  reorderRules: (sourceIndex: number, destinationIndex: number) => Promise<void>;

  addCondition: (ruleId: string, condition: WorkflowCondition) => void;
  updateCondition: (
    ruleId: string,
    conditionId: string,
    updatedCondition: WorkflowCondition,
  ) => void;
  deleteCondition: (ruleId: string, conditionId: string) => void;

  updateAction: (ruleId: string, updatedAction: WorkflowAction) => void;
  confirmRule: (ruleId: string) => Promise<void>;
  cancelRuleChanges: (ruleId: string) => void;

  isConditionPersisted: (ruleId: string, conditionId: string) => boolean;
  isConditionMarkedForDeletion: (ruleId: string, conditionId: string) => boolean;
  isRuleModified: (ruleId: string) => boolean;
  hasRuleValidationErrors: (ruleId: string) => boolean;
  getRuleValidationErrors: (ruleId: string) => string[];

  // Drag and drop
  setIsDragging: (isDragging: boolean) => void;
  setShouldScrollToBottom: (shouldScroll: boolean) => void;
  setDeleteModalOpen: (open: boolean) => void;
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
  const updateRuleMutation = useUpdateRuleMutation();
  const deleteRuleMutation = useDeleteRuleMutation();
  const deleteConditionMutation = useDeleteConditionMutation();
  const renameRuleMutation = useRenameRuleMutation();
  const reorderRulesMutation = useReorderRulesMutation();

  // State
  const [localWorkflowRules, setLocalWorkflowRules] = useState<Map<string, Rule>>(new Map());
  const [ruleOrder, setRuleOrder] = useState<string[]>([]);
  const [modifiedRules, setModifiedRules] = useState<Set<string>>(new Set());
  const [pendingDeletedConditions, setPendingDeletedConditions] = useState<
    Map<string, Set<string>>
  >(new Map());
  const [originalRules, setOriginalRules] = useState<Map<string, Rule>>(new Map());
  const [ruleValidationErrors, setRuleValidationErrors] = useState<Map<string, string[]>>(
    new Map(),
  );
  const [isDragging, setIsDragging] = useState(false);
  const [justReordered, setJustReordered] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<{ id: string; name: string } | null>(null);

  // Helper function to store original rule state
  const storeOriginalRule = (ruleId: string) => {
    if (!originalRules.has(ruleId)) {
      const originalRule = localWorkflowRules.get(ruleId);
      if (originalRule) {
        setOriginalRules((prev) =>
          new Map(prev).set(ruleId, JSON.parse(JSON.stringify(originalRule))),
        );
      }
    }
  };

  // Update local rules when query data changes
  useEffect(() => {
    if (rulesQuery.data?.workflow && !justReordered) {
      const rulesMap = new Map(rulesQuery.data.workflow.map((rule) => [rule.id, rule]));
      const order = rulesQuery.data.workflow.map((rule) => rule.id);
      setLocalWorkflowRules(rulesMap);
      setRuleOrder(order);
    }
  }, [rulesQuery.data?.workflow, justReordered]);

  // Validate modified rules in real-time
  useEffect(() => {
    console.log('🔄 Validation triggered for modified rules:', Array.from(modifiedRules));
    const newValidationErrors = new Map<string, string[]>();

    modifiedRules.forEach((ruleId) => {
      const rule = localWorkflowRules.get(ruleId);
      if (rule) {
        console.log(`🔍 Validating rule ${ruleId}:`, rule);
        const validationResult = validateRuleEnhanced(rule);
        if (!validationResult.success) {
          const errors = validationResult.error?.errors?.map((error) => error.message) || [];
          console.log(`❌ Validation errors for rule ${ruleId}:`, errors);
          newValidationErrors.set(ruleId, errors);
        } else {
          console.log(`✅ Rule ${ruleId} passed validation`);
        }
      }
    });

    setRuleValidationErrors(newValidationErrors);
  }, [localWorkflowRules, modifiedRules]);

  // Helper functions
  const isConditionPersisted = (ruleId: string, conditionId: string): boolean => {
    if (conditionId.startsWith('temp-')) {
      return false;
    }
    if (!modifiedRules.has(ruleId)) {
      return true;
    }
    const originalRule = originalRules.get(ruleId);
    if (originalRule?.conditions) {
      return originalRule.conditions.some(
        (condition: WorkflowCondition) => condition.id === conditionId,
      );
    }
    return false;
  };

  const isConditionMarkedForDeletion = (ruleId: string, conditionId: string): boolean => {
    const deletedConditions = pendingDeletedConditions.get(ruleId);
    return deletedConditions ? deletedConditions.has(conditionId) : false;
  };

  const isRuleModified = (ruleId: string): boolean => {
    return modifiedRules.has(ruleId);
  };

  const hasRuleValidationErrors = (ruleId: string): boolean => {
    const errors = ruleValidationErrors.get(ruleId);
    return errors !== undefined && errors.length > 0;
  };

  const getRuleValidationErrors = (ruleId: string): string[] => {
    return ruleValidationErrors.get(ruleId) || [];
  };

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

  const renameRule = (ruleId: string, newName: string, fallthrough: boolean) => {
    renameRuleMutation.mutate({
      scenarioId,
      ruleId,
      name: newName,
      fallthrough,
    });
  };

  const updateRuleName = (ruleId: string, newName: string) => {
    storeOriginalRule(ruleId);
    setModifiedRules((prev) => new Set(prev).add(ruleId));

    setLocalWorkflowRules((prev) => {
      const newMap = new Map(prev);
      const rule = newMap.get(ruleId);
      if (rule) {
        const updatedRule = { ...rule };
        updatedRule.name = newName;
        newMap.set(ruleId, updatedRule);
      }
      return newMap;
    });
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

  const addCondition = (ruleId: string, condition: WorkflowCondition) => {
    storeOriginalRule(ruleId);
    setModifiedRules((prev) => new Set(prev).add(ruleId));

    setLocalWorkflowRules((prev) => {
      const newMap = new Map(prev);
      const rule = newMap.get(ruleId);
      if (rule) {
        const updatedRule = { ...rule };
        if (!updatedRule.conditions) {
          updatedRule.conditions = [];
        }

        if (condition.id) {
          const existingConditionIndex = updatedRule.conditions.findIndex(
            (c: WorkflowCondition) => c.id === condition.id,
          );

          if (existingConditionIndex !== -1) {
            // Update existing condition
            updatedRule.conditions = [...updatedRule.conditions];
            updatedRule.conditions[existingConditionIndex] = condition;
          } else {
            // New condition with ID - add it
            updatedRule.conditions.push(condition);
          }
        } else {
          // New condition without ID - generate unique ID
          const newCondition: WorkflowCondition = {
            ...condition,
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };
          updatedRule.conditions.push(newCondition);
        }

        newMap.set(ruleId, updatedRule);
      }
      return newMap;
    });
  };

  const updateCondition = (
    ruleId: string,
    conditionId: string,
    updatedCondition: WorkflowCondition,
  ) => {
    console.log(
      '🔄 WorkflowProvider: updateCondition called for rule',
      ruleId,
      'condition',
      conditionId,
      ':',
      updatedCondition,
    );
    storeOriginalRule(ruleId);
    setModifiedRules((prev) => new Set(prev).add(ruleId));

    setLocalWorkflowRules((prev) => {
      const newMap = new Map(prev);
      const rule = newMap.get(ruleId);
      if (rule && rule.conditions) {
        const updatedRule = { ...rule };
        const conditionIndex = rule.conditions.findIndex(
          (condition: WorkflowCondition) => condition.id === conditionId,
        );
        if (conditionIndex !== -1) {
          updatedRule.conditions = [...rule.conditions];
          updatedRule.conditions[conditionIndex] = updatedCondition;
        }
        newMap.set(ruleId, updatedRule);
      }
      return newMap;
    });
  };

  const deleteCondition = (ruleId: string, conditionId: string) => {
    // Toggle condition deletion state
    storeOriginalRule(ruleId);
    setModifiedRules((prev) => new Set(prev).add(ruleId));

    setPendingDeletedConditions((prev) => {
      const newMap = new Map(prev);
      const existingDeleted = newMap.get(ruleId) || new Set();

      if (existingDeleted.has(conditionId)) {
        // If already marked for deletion, restore it
        const updatedDeleted = new Set(existingDeleted);
        updatedDeleted.delete(conditionId);
        if (updatedDeleted.size === 0) {
          newMap.delete(ruleId);
        } else {
          newMap.set(ruleId, updatedDeleted);
        }
      } else {
        // Mark for deletion
        const updatedDeleted = new Set(existingDeleted).add(conditionId);
        newMap.set(ruleId, updatedDeleted);
      }

      return newMap;
    });
  };

  const updateAction = (ruleId: string, updatedAction: WorkflowAction) => {
    storeOriginalRule(ruleId);
    setModifiedRules((prev) => new Set(prev).add(ruleId));

    setLocalWorkflowRules((prev) => {
      const newMap = new Map(prev);
      const rule = newMap.get(ruleId);
      if (rule) {
        const updatedRule = { ...rule };
        if (!updatedRule.actions) {
          updatedRule.actions = [];
        }
        if (updatedRule.actions.length > 0) {
          updatedRule.actions[0] = updatedAction;
        } else {
          updatedRule.actions.push(updatedAction);
        }
        newMap.set(ruleId, updatedRule);
      }
      return newMap;
    });
  };

  const confirmRule = async (ruleId: string) => {
    const rule = localWorkflowRules.get(ruleId);
    if (!rule) return;

    if (hasRuleValidationErrors(ruleId)) {
      toast.error('Cannot save rule with validation errors');
      return;
    }

    try {
      // First handle any pending condition deletions
      const conditionsToDelete = pendingDeletedConditions.get(ruleId);
      if (conditionsToDelete && conditionsToDelete.size > 0) {
        // Delete each condition that was marked for deletion
        for (const conditionId of conditionsToDelete) {
          if (conditionId.startsWith('temp-')) {
            continue;
          }
          await deleteConditionMutation.mutateAsync({
            ruleId,
            conditionId,
            scenarioId,
          });
        }
      }

      // remove the conditions from the rule
      rule.conditions = rule.conditions.filter((c) => !isConditionMarkedForDeletion(ruleId, c.id));

      // compare the rule with the original rule for other changes on remaining conditions, actions, and name
      const originalRule = originalRules.get(ruleId);
      if (originalRule) {
        const originalConditionsFiltered =
          originalRule.conditions?.filter((c) => !isConditionMarkedForDeletion(ruleId, c.id)) || [];
        const updatedConditions = rule.conditions || [];
        const originalActions = originalRule.actions || [];
        const updatedActions = rule.actions || [];

        // Deep compare conditions, actions, and name to see if there are other changes beyond deletions
        const conditionsChanged =
          JSON.stringify(originalConditionsFiltered) !== JSON.stringify(updatedConditions);
        const actionsChanged = JSON.stringify(originalActions) !== JSON.stringify(updatedActions);
        const nameChanged = originalRule.name !== rule.name;

        // Handle name change first if it's the only change
        if (nameChanged && !conditionsChanged && !actionsChanged) {
          await renameRuleMutation.mutateAsync({
            scenarioId,
            ruleId,
            name: rule.name,
            fallthrough: rule.fallthrough,
          });

          setModifiedRules((prev) => {
            const newSet = new Set(prev);
            newSet.delete(ruleId);
            return newSet;
          });
          setOriginalRules((prev) => {
            const newMap = new Map(prev);
            newMap.delete(ruleId);
            return newMap;
          });
          setPendingDeletedConditions((prev) => {
            const newMap = new Map(prev);
            newMap.delete(ruleId);
            return newMap;
          });
          return;
        }

        if (!conditionsChanged && !actionsChanged && !nameChanged) {
          // Only condition deletions, no other changes - skip rule update
          setModifiedRules((prev) => {
            const newSet = new Set(prev);
            newSet.delete(ruleId);
            return newSet;
          });
          setOriginalRules((prev) => {
            const newMap = new Map(prev);
            newMap.delete(ruleId);
            return newMap;
          });
          setPendingDeletedConditions((prev) => {
            const newMap = new Map(prev);
            newMap.delete(ruleId);
            return newMap;
          });
          return;
        }
      }

      // Then update the rule
      await updateRuleMutation.mutateAsync({
        ruleId,
        scenarioId,
        rule,
      });

      setModifiedRules((prev) => {
        const newSet = new Set(prev);
        newSet.delete(ruleId);
        return newSet;
      });
      setOriginalRules((prev) => {
        const newMap = new Map(prev);
        newMap.delete(ruleId);
        return newMap;
      });
      setPendingDeletedConditions((prev) => {
        const newMap = new Map(prev);
        newMap.delete(ruleId);
        return newMap;
      });
    } catch (error) {
      console.error('Failed to update rule:', error);
      toast.error('Failed to update rule');
    }
  };

  const cancelRuleChanges = (ruleId: string) => {
    const originalRule = originalRules.get(ruleId);
    if (originalRule) {
      setLocalWorkflowRules((prev) => {
        const newMap = new Map(prev);
        newMap.set(ruleId, JSON.parse(JSON.stringify(originalRule)));
        return newMap;
      });
    }

    setModifiedRules((prev) => {
      const newSet = new Set(prev);
      newSet.delete(ruleId);
      return newSet;
    });
    setOriginalRules((prev) => {
      const newMap = new Map(prev);
      newMap.delete(ruleId);
      return newMap;
    });
    setPendingDeletedConditions((prev) => {
      const newMap = new Map(prev);
      newMap.delete(ruleId);
      return newMap;
    });
  };

  const value: WorkflowContextValue = {
    // Data
    rules: ruleOrder.map((id) => localWorkflowRules.get(id)).filter(Boolean) as Rule[],
    dataModel,
    workflowDataFeatureAccess,
    triggerObjectType: rulesQuery.data?.triggerObjectType,
    isLoading: rulesQuery.isLoading,
    isError: rulesQuery.isError,
    error: rulesQuery.error as Error,

    // State
    localWorkflowRules,
    ruleOrder,
    modifiedRules,
    pendingDeletedConditions,
    ruleValidationErrors,
    isDragging,
    shouldScrollToBottom,

    // Modal state
    deleteModalOpen,
    ruleToDelete,

    // Actions
    createRule,
    deleteRule,
    confirmDeleteRule,
    cancelDeleteRule,
    renameRule,
    updateRuleName,
    reorderRules,
    addCondition,
    updateCondition,
    deleteCondition,
    updateAction,
    confirmRule,
    cancelRuleChanges,

    // Helper functions
    isConditionPersisted,
    isConditionMarkedForDeletion,
    isRuleModified,
    hasRuleValidationErrors,
    getRuleValidationErrors,

    // Setters
    setIsDragging,
    setShouldScrollToBottom,
    setDeleteModalOpen,
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
