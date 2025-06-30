import { type AstNode, type DataModel } from '@app-builder/models';
import { NewPayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import { NewNodeEvaluation } from '@app-builder/models/node-evaluation';
import { generateFlatEvaluation } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/validate-ast';
import { AstBuilderDataSharpFactory } from '@ast-builder/Provider';
import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import { AstBuilderNodeSharpFactory } from '../AstBuilder/edition/node-store';

interface WorkflowAstProviderProps {
  children: ReactNode;
  triggerObjectType: string;
  dataModel: DataModel;
  node: AstNode;
  onChange: (node: AstNode) => void;
}

// Helper function to ensure node has proper structure for evaluation
function normalizeAstNode(node: AstNode): AstNode {
  return {
    ...node,
    children: node.children || [],
    namedChildren: node.namedChildren || {},
  };
}

export function WorkflowAstProvider({
  children,
  triggerObjectType,
  dataModel,
  node,
  onChange,
}: WorkflowAstProviderProps) {
  // Create payload accessors from the trigger object fields
  const payloadAccessors = useMemo(() => {
    const triggerTable = dataModel.find((table) => table.name === triggerObjectType);
    if (!triggerTable) {
      return [];
    }

    return triggerTable.fields.map((field) => NewPayloadAstNode(field.name));
  }, [dataModel, triggerObjectType]);

  const dataSharp = AstBuilderDataSharpFactory.createSharp({
    scenarioId: 'workflow',
    data: {
      triggerObjectType,
      dataModel,
      // Provide minimal data for workflow payload evaluation
      databaseAccessors: [],
      payloadAccessors,
      customLists: [],
    },
    mode: 'edit',
    showValues: false,
  });

  // Normalize the node and create validation
  const normalizedNode = useMemo(() => normalizeAstNode(node), [node]);

  const validation = useMemo(() => {
    try {
      return {
        errors: [],
        evaluation: generateFlatEvaluation(normalizedNode, NewNodeEvaluation()),
      };
    } catch (error) {
      console.error('Error generating flat evaluation:', error);
      return {
        errors: [],
        evaluation: [],
      };
    }
  }, [normalizedNode]);

  const nodeSharp = AstBuilderNodeSharpFactory.createSharp({
    initialNode: normalizedNode,
    initialValidation: validation,
    validationFn: async (node: AstNode) => {
      try {
        // For workflow payload evaluation, we use basic validation
        return {
          errors: [],
          evaluation: generateFlatEvaluation(normalizeAstNode(node), NewNodeEvaluation()),
        };
      } catch (error) {
        console.error('Error in validation function:', error);
        return {
          errors: [],
          evaluation: [],
        };
      }
    },
  });

  // Proper change detection with subscription-based approach
  const originalNodeRef = useRef(JSON.stringify(node));
  const lastReportedRef = useRef(JSON.stringify(node));
  const isInitializedRef = useRef(false);

  // Update refs when node prop changes
  useEffect(() => {
    const nodeStr = JSON.stringify(node);
    if (nodeStr !== originalNodeRef.current) {
      console.log('🔄 Node prop changed, updating nodeSharp:', node);
      originalNodeRef.current = nodeStr;
      lastReportedRef.current = nodeStr;
      isInitializedRef.current = false;
      // Update nodeSharp with new normalized node
      const normalized = normalizeAstNode(node);
      nodeSharp.actions.setNodeAtPath('root', normalized);
      nodeSharp.actions.validate();
    }
  }, [node, nodeSharp]);

  // Subscribe to nodeSharp changes using a polling mechanism that's more reliable
  useEffect(() => {
    const checkForChanges = () => {
      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
        return;
      }

      const currentNode = nodeSharp.value.node;
      const currentNodeStr = JSON.stringify(currentNode);
      const hasChangedFromOriginal = currentNodeStr !== originalNodeRef.current;
      const isNewChange = currentNodeStr !== lastReportedRef.current;

      // More detailed debugging
      if (isNewChange) {
        console.log('🔍 Change detected:', {
          operatorName: currentNode.name,
          leftOperand: currentNode.children?.[0]?.name || 'undefined',
          rightOperand: currentNode.children?.[1]?.name || 'undefined',
          hasChangedFromOriginal,
          isNewChange,
        });
      }

      if (hasChangedFromOriginal && isNewChange) {
        console.log('✅ Reporting node change to parent:', currentNode);
        lastReportedRef.current = currentNodeStr;
        onChange(currentNode);
      }
    };

    // Initial check
    checkForChanges();

    // Set up polling for changes - more frequent polling for better responsiveness
    const interval = setInterval(checkForChanges, 50);

    return () => clearInterval(interval);
  }, [nodeSharp, onChange]);

  return (
    <AstBuilderDataSharpFactory.Provider value={dataSharp}>
      <AstBuilderNodeSharpFactory.Provider value={nodeSharp}>
        {children}
      </AstBuilderNodeSharpFactory.Provider>
    </AstBuilderDataSharpFactory.Provider>
  );
}
