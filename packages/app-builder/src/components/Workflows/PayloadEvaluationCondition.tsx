import { AstBuilder } from '@app-builder/components/AstBuilder';
import { type AstBuilderNodeSharpFactory } from '@app-builder/components/AstBuilder/edition/node-store';
import { type DataModel, NewUndefinedAstNode } from '@app-builder/models';
import { type AstNode } from '@app-builder/models/astNode/ast-node';
import { NewPayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import { NewFuzzyMatchComparatorAstNode } from '@app-builder/models/astNode/strings';
import {
  NewTimeAddAstNode,
  NewTimeNowAstNode,
  NewTimestampExtractAstNode,
} from '@app-builder/models/astNode/time';
import { ComparatorFuzzyMatchConfig } from '@app-builder/models/fuzzy-match/comparatorFuzzyMatchConfig';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { type BuilderOptionsResource } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/builder-options';
import { type FlatAstValidation } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/validate-ast';
import { useEffect, useMemo } from 'react';
import { type InferSharpApi } from 'sharpstate';
import { v7 as uuidv7 } from 'uuid';

interface PayloadEvaluationConditionProps {
  condition: {
    id: string;
    function: 'payload_evaluates';
    params?: {
      expression?: AstNode;
    };
  };
  triggerObjectType: string;
  dataModel: DataModel;
  onChange: (condition: any) => void;
}

// Helper function to create a default simple expression for workflow payload evaluation
// This creates a binary expression with undefined operands to show operator and right operand
function createDefaultSimpleExpression(): AstNode {
  return {
    id: uuidv7(),
    name: '=',
    constant: undefined,
    children: [NewUndefinedAstNode(), NewUndefinedAstNode()],
    namedChildren: {},
  };
}

// Custom hook to temporarily filter AST options for workflow context
function useWorkflowAstOptions() {
  useEffect(() => {
    let restoreOptions: (() => void) | null = null;

    // Dynamically import and modify the base options
    import('@app-builder/components/AstBuilder/edition/base-options').then((baseOptions) => {
      // Store original options
      const originalStaticOptions = [...baseOptions.AST_BUILDER_STATIC_OPTIONS];
      const originalModelingOptions = baseOptions.MODELING_OPTIONS;

      // Create filtered options for workflow (only string similarity and date functions)
      const workflowFilteredOptions = [
        // String similarity functions
        {
          astNode: NewFuzzyMatchComparatorAstNode({
            funcName: 'FuzzyMatch',
            config: ComparatorFuzzyMatchConfig,
          }),
        },
        // Date functions
        { astNode: NewTimeAddAstNode() },
        { astNode: NewTimestampExtractAstNode() },
        { astNode: NewTimeNowAstNode() },
      ];

      // Replace the static options
      baseOptions.AST_BUILDER_STATIC_OPTIONS.length = 0;
      baseOptions.AST_BUILDER_STATIC_OPTIONS.push(...workflowFilteredOptions);

      // Replace MODELING_OPTIONS to return empty array (no brackets/modeling allowed)
      (baseOptions as any).MODELING_OPTIONS = () => [];

      // Set up restore function
      restoreOptions = () => {
        baseOptions.AST_BUILDER_STATIC_OPTIONS.length = 0;
        baseOptions.AST_BUILDER_STATIC_OPTIONS.push(...originalStaticOptions);
        (baseOptions as any).MODELING_OPTIONS = originalModelingOptions;
      };
    });

    // Cleanup function
    return () => {
      if (restoreOptions) {
        restoreOptions();
      }
    };
  }, []);
}

export function PayloadEvaluationCondition({
  condition,
  triggerObjectType,
  dataModel,
  onChange,
}: PayloadEvaluationConditionProps) {
  const currentScenario = useCurrentScenario();

  // Apply workflow-specific AST options filtering
  useWorkflowAstOptions();

  // Add debugging for when condition prop changes
  useEffect(() => {
    console.log('🔄 PayloadEvaluationCondition: condition prop changed:', condition);
  }, [condition]);

  // Get the current expression or create a default simple expression
  const currentExpression = useMemo(() => {
    return condition.params?.expression || createDefaultSimpleExpression();
  }, [condition.params?.expression]);

  const handleExpressionChange = (newExpression: AstNode) => {
    console.log('🔄 PayloadEvaluationCondition: Expression changed:', newExpression);
    const newCondition = {
      ...condition,
      params: {
        expression: newExpression,
      },
    };
    console.log(
      '🔄 PayloadEvaluationCondition: Calling onChange with new condition:',
      newCondition,
    );
    onChange(newCondition);
  };

  // Build builder data for workflow context
  const builderData = useMemo((): BuilderOptionsResource => {
    const triggerTable = dataModel.find((table) => table.name === triggerObjectType);
    if (!triggerTable) {
      return {
        triggerObjectType,
        dataModel,
        databaseAccessors: [],
        payloadAccessors: [],
        customLists: [],
      };
    }

    // Create payload accessors from trigger table fields
    const payloadAccessors = triggerTable.fields.map((field) => NewPayloadAstNode(field.name));

    return {
      triggerObjectType,
      dataModel,
      databaseAccessors: [], // No database access for workflows
      payloadAccessors,
      customLists: [], // No custom lists for workflows
    };
  }, [triggerObjectType, dataModel]);

  return (
    <div className="flex items-center gap-2">
      <AstBuilder.Provider
        scenarioId={currentScenario.id}
        initialData={builderData}
        mode="edit"
        showValues={false}
      >
        <AstBuilder.Root
          node={currentExpression}
          onStoreChange={(nodeStore: InferSharpApi<typeof AstBuilderNodeSharpFactory> | null) => {
            if (nodeStore) {
              // Use a ref-based approach to track changes
              let lastValue = JSON.stringify(currentExpression);

              const checkForChanges = () => {
                const currentValue = JSON.stringify(nodeStore.value.node);
                if (currentValue !== lastValue) {
                  lastValue = currentValue;
                  handleExpressionChange(nodeStore.value.node);
                }
              };

              // Set up polling to check for changes
              const interval = setInterval(checkForChanges, 100);

              return () => clearInterval(interval);
            }
          }}
          onValidationUpdate={(validation: FlatAstValidation) => {
            // Handle validation updates if needed
            console.log('Validation updated:', validation);
          }}
        />
      </AstBuilder.Provider>
    </div>
  );
}
