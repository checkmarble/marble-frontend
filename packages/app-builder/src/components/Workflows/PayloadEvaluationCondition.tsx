import { type DataModel, NewUndefinedAstNode } from '@app-builder/models';
import { type AstNode } from '@app-builder/models/astNode/ast-node';
import { useEffect, useMemo } from 'react';
import { v7 as uuidv7 } from 'uuid';
import { WorkflowAstProvider } from './WorkflowAstProvider';
import { WorkflowPayloadEvaluationNode } from './WorkflowPayloadEvaluationNode';

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

// Helper function to create a default binary expression for workflow payload evaluation
function createDefaultBinaryExpression(): AstNode {
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
  triggerObjectType,
  dataModel,
  onChange,
}: PayloadEvaluationConditionProps) {
  // Add debugging for when condition prop changes
  useEffect(() => {
    console.log('🔄 PayloadEvaluationCondition: condition prop changed:', condition);
  }, [condition]);

  // Get the current expression or create a default binary expression
  const currentExpression = useMemo(() => {
    return condition.params?.expression || createDefaultBinaryExpression();
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
      <WorkflowAstProvider
        triggerObjectType={triggerObjectType}
        dataModel={dataModel}
        node={currentExpression}
        onChange={handleExpressionChange}
      >
        <WorkflowPayloadEvaluationNode root path="root" />
      </WorkflowAstProvider>
    </div>
  );
}
