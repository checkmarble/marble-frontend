import { AstBuilder } from '@app-builder/components/AstBuilder';
import { NewUndefinedAstNode } from '@app-builder/models';
import { isAggregation } from '@app-builder/models/astNode/aggregation';
import { type AstNode } from '@app-builder/models/astNode/ast-node';
import { isDatabaseAccess } from '@app-builder/models/astNode/data-accessor';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { type FlatAstValidation } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/validate-ast';
import { useEffect, useMemo, useRef } from 'react';
import { v7 as uuidv7 } from 'uuid';

interface PayloadEvaluationConditionProps {
  condition: {
    id: string;
    function: 'payload_evaluates';
    params?: {
      expression?: AstNode;
    };
  };
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

export function PayloadEvaluationCondition({
  condition,
  onChange,
}: PayloadEvaluationConditionProps) {
  const currentScenario = useCurrentScenario();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  return (
    <div className="flex items-center gap-2">
      <AstBuilder.Provider scenarioId={currentScenario.id} mode="edit" showValues={false}>
        <AstBuilder.Root
          node={currentExpression}
          optionsDataType={(option) =>
            option.operandType !== 'Modeling' &&
            !isDatabaseAccess(option.astNode) &&
            !isAggregation(option.astNode)
          }
          onStoreChange={(nodeStore) => {
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
              intervalRef.current = setInterval(checkForChanges, 100);
            } else {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
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
