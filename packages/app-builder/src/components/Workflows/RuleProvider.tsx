import {
  type Rule,
  type WorkflowAction,
  type WorkflowCondition,
} from '@app-builder/models/scenario/workflow';
import { validateRuleEnhanced } from '@app-builder/models/scenario/workflow-validation';
import { useUpdateRuleMutation } from '@app-builder/queries/Workflows';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface RuleContextValue {
  // Data
  rule?: Rule;
  isLoading: boolean;
  isError: boolean;
  error?: Error;

  // State
  isModified: boolean;
  validationErrors: string[];

  // Rule CRUD actions
  updateRuleName: (newName: string) => void;
  addCondition: (condition: WorkflowCondition) => void;
  updateCondition: (conditionId: string, updatedCondition: WorkflowCondition) => void;
  deleteCondition: (conditionId: string) => void;
  updateAction: (updatedAction: WorkflowAction) => void;

  // Save/Cancel
  saveRule: () => Promise<void>;
  cancelChanges: () => Promise<void>;

  // Helper functions
  hasValidationErrors: () => boolean;
  getValidationErrors: () => string[];
}

const RuleContext = createContext<RuleContextValue | null>(null);

interface RuleProviderProps {
  children: ReactNode;
  rule: Rule;
  setEditingRuleId?: (ruleId: string | null) => void;
  scenarioId?: string;
}

export function RuleProvider({ children, rule, setEditingRuleId, scenarioId }: RuleProviderProps) {
  // Mutations
  const updateRuleMutation = useUpdateRuleMutation();

  // State
  const [localRule, setLocalRule] = useState<Rule>(rule);
  const [isModified, setIsModified] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize local rule when prop changes
  useEffect(() => {
    setLocalRule(rule);
    setIsModified(false);
    setValidationErrors([]);
  }, [rule]);

  // Notify parent when editing state changes
  useEffect(() => {
    if (setEditingRuleId) {
      setEditingRuleId(isModified ? rule.id : null);
    }
  }, [isModified, rule.id, setEditingRuleId]);

  // Validate rule in real-time when it changes
  useEffect(() => {
    if (localRule && isModified) {
      console.log('🔄 Validation triggered for rule:', localRule.id);
      const validationResult = validateRuleEnhanced(localRule);
      if (!validationResult.success) {
        const errors = validationResult.error?.errors?.map((error) => error.message) || [];
        console.log(`❌ Validation errors for rule ${localRule.id}:`, errors);
        setValidationErrors(errors);
      } else {
        console.log(`✅ Rule ${localRule.id} passed validation`);
        setValidationErrors([]);
      }
    } else {
      setValidationErrors([]);
    }
  }, [localRule, isModified]);

  // Rule CRUD actions
  const updateRuleName = (newName: string) => {
    if (!localRule) return;

    const updatedRule = { ...localRule, name: newName };
    setLocalRule(updatedRule);
    setIsModified(true);
  };

  const addCondition = (condition: WorkflowCondition) => {
    if (!localRule) return;

    const updatedRule = { ...localRule };
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

    setLocalRule(updatedRule);
    setIsModified(true);
  };

  const updateCondition = (conditionId: string, updatedCondition: WorkflowCondition) => {
    if (!localRule?.conditions) return;

    console.log(
      '🔄 RuleProvider: updateCondition called for condition',
      conditionId,
      ':',
      updatedCondition,
    );

    const updatedRule = { ...localRule };
    const conditionIndex = localRule.conditions.findIndex(
      (condition: WorkflowCondition) => condition.id === conditionId,
    );

    if (conditionIndex !== -1) {
      updatedRule.conditions = [...localRule.conditions];
      updatedRule.conditions[conditionIndex] = updatedCondition;
      setLocalRule(updatedRule);
      setIsModified(true);
    }
  };

  const deleteCondition = (conditionId: string) => {
    if (!localRule?.conditions) return;

    console.log('🔄 RuleProvider: deleteCondition called for condition', conditionId);

    const updatedRule = { ...localRule };
    updatedRule.conditions = localRule.conditions.filter(
      (condition: WorkflowCondition) => condition.id !== conditionId,
    );

    setLocalRule(updatedRule);
    setIsModified(true);
  };

  const updateAction = (updatedAction: WorkflowAction) => {
    if (!localRule) return;

    const updatedRule = { ...localRule };
    if (!updatedRule.actions) {
      updatedRule.actions = [];
    }

    if (updatedRule.actions.length > 0) {
      updatedRule.actions[0] = updatedAction;
    } else {
      updatedRule.actions.push(updatedAction);
    }

    setLocalRule(updatedRule);
    setIsModified(true);
  };

  const saveRule = async () => {
    if (!localRule || !isModified) return;

    if (validationErrors.length > 0) {
      toast.error('Cannot save rule with validation errors');
      return;
    }

    if (!scenarioId) {
      toast.error('Scenario ID is required to save rule');
      return;
    }

    try {
      await updateRuleMutation.mutateAsync({
        ruleId: localRule.id,
        rule: localRule,
        scenarioId: scenarioId,
      });

      setIsModified(false);
      toast.success('Rule saved successfully');
    } catch (error) {
      console.error('Failed to update rule:', error);
      toast.error('Failed to update rule');
    }
  };

  const cancelChanges = async () => {
    try {
      // Reset to the original rule data
      setLocalRule(rule);
      setIsModified(false);
      setValidationErrors([]);
    } catch (error) {
      console.error('Failed to reset rule data:', error);
      toast.error('Failed to reset rule data');
    }
  };

  // Helper functions
  const hasValidationErrors = (): boolean => {
    return validationErrors.length > 0;
  };

  const getValidationErrors = (): string[] => {
    return validationErrors;
  };

  const value: RuleContextValue = {
    // Data
    rule: localRule,
    isLoading: false,
    isError: false,
    error: undefined,

    // State
    isModified,
    validationErrors,

    // Rule CRUD actions
    updateRuleName,
    addCondition,
    updateCondition,
    deleteCondition,
    updateAction,

    // Save/Cancel
    saveRule,
    cancelChanges,

    // Helper functions
    hasValidationErrors,
    getValidationErrors,
  };

  return <RuleContext.Provider value={value}>{children}</RuleContext.Provider>;
}

export function useRule() {
  const context = useContext(RuleContext);
  if (!context) {
    throw new Error('useRule must be used within a RuleProvider');
  }
  return context;
}
