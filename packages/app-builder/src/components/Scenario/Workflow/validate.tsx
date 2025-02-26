import { type Edge, getOutgoers, type Node } from 'reactflow';
import { assertNever } from 'typescript-utils';

import {
  type DecisionCreatedTrigger,
  isAddToCaseIfPossibleAction,
  isCreateCaseAction,
  isDecisionCreatedTrigger,
  isEmptyNodeData,
  isTriggerData,
  type NodeData,
  type TriggerData,
} from './models/nodes';
import {
  addToCaseIfPossibleActionSchema,
  createCaseActionSchema,
  decisionCreatedTriggerSchema,
  type ValidationPayload,
  type ValidDecisionCreatedWorkflow,
  type ValidWorkflow,
  type WorkflowError,
} from './models/validation';

function validateSingleTriggerNode(nodes: Node<NodeData>[]): ValidationPayload<Node<TriggerData>> {
  const triggerNodes = nodes.filter((node): node is Node<TriggerData> => isTriggerData(node.data));
  if (triggerNodes.length > 1) {
    return {
      isValid: false,
      errors: [
        {
          type: 'multiple-trigger-nodes',
        },
      ],
    };
  }
  const triggerNode = triggerNodes[0];
  if (!triggerNode) {
    return {
      isValid: false,
      errors: [
        {
          type: 'missing-trigger-node',
        },
      ],
    };
  }
  return {
    isValid: true,
    value: triggerNode,
  };
}

function validateSingleOutgoer(
  node: Node<NodeData>,
  nodes: Node<NodeData>[],
  edges: Edge[],
): ValidationPayload<Node<NodeData>> {
  const outgoers = getOutgoers(node, nodes, edges);
  if (outgoers.length > 1) {
    return {
      isValid: false,
      errors: [
        {
          type: 'multiple-outgoing-nodes',
          nodeId: node.id,
        },
      ],
    };
  }
  const outgoer = outgoers[0];
  if (!outgoer) {
    return {
      isValid: false,
      errors: [
        {
          type: 'missing-outgoing-node',
          nodeId: node.id,
        },
      ],
    };
  }
  return { isValid: true, value: outgoer };
}

function validateNoOutgoer(
  node: Node<NodeData>,
  nodes: Node<NodeData>[],
  edges: Edge[],
): ValidationPayload {
  const outgoers = getOutgoers(node, nodes, edges);
  if (outgoers.length > 0) {
    return {
      isValid: false,
      errors: [
        {
          type: 'no-outgoing-node-required',
          nodeId: node.id,
        },
      ],
    };
  }
  return { isValid: true };
}

function validatNoEmptyNodes(nodes: Node<NodeData>[]): ValidationPayload {
  const emptyNodeIds = nodes.filter((node) => isEmptyNodeData(node.data)).map((node) => node.id);
  if (emptyNodeIds.length > 0) {
    return {
      isValid: false,
      errors: emptyNodeIds.map((nodeId) => ({
        type: 'empty-nodes',
        nodeId,
      })),
    };
  }
  return { isValid: true };
}

const defaulOptions = { allowGraphLoops: false };
function validateSingleGraph(
  triggerNode: Node,
  nodes: Node<NodeData>[],
  edges: Edge[],
  options?: { allowGraphLoops?: boolean },
): ValidationPayload {
  const { allowGraphLoops } = { ...defaulOptions, ...options };

  const visited = new Set();
  const queue = [triggerNode];
  while (queue.length > 0) {
    const node = queue.pop();
    if (!node) continue;
    if (visited.has(node.id)) {
      if (allowGraphLoops) continue;
      return {
        isValid: false,
        errors: [
          {
            type: 'graph-loop',
          },
        ],
      };
    }
    visited.add(node.id);
    const children = getOutgoers(node, nodes, edges);
    queue.push(...children);
  }

  if (visited.size !== nodes.length) {
    return {
      isValid: false,
      errors: nodes
        .filter((node) => !visited.has(node.id))
        .map((node) => ({
          type: 'not-connected-to-trigger',
          nodeId: node.id,
        })),
    };
  }
  return { isValid: true };
}

export function validateWorkflow(
  nodes: Node<NodeData>[],
  edges: Edge[],
): ValidationPayload<ValidWorkflow> {
  const errors: WorkflowError[] = [];
  const noEmpty = validatNoEmptyNodes(nodes);
  if (!noEmpty.isValid) {
    errors.push(...noEmpty.errors);
  }

  const triggerNode = validateSingleTriggerNode(nodes);
  if (!triggerNode.isValid) {
    errors.push(...triggerNode.errors);
    return { isValid: false, errors };
  }

  const graph = validateSingleGraph(triggerNode.value, nodes, edges);
  if (!graph.isValid) {
    errors.push(...graph.errors);
  }

  const workflowBusinessLogic = validateWorkflowBusinessLogic(triggerNode.value, nodes, edges);
  if (!workflowBusinessLogic.isValid) {
    errors.push(...workflowBusinessLogic.errors);
  }

  if (errors.length === 0 && workflowBusinessLogic.isValid) {
    return workflowBusinessLogic;
  }

  return { isValid: false, errors };
}

function validateWorkflowBusinessLogic(
  trigger: Node<TriggerData>,
  nodes: Node<NodeData>[],
  edges: Edge[],
): ValidationPayload<ValidWorkflow> {
  if (isDecisionCreatedTrigger(trigger.data)) {
    return validateDecisionCreatedWorkflow(trigger, nodes, edges);
  }
  assertNever('Unknown trigger type', trigger.data);
}

function validateDecisionCreatedWorkflow(
  trigger: Node<DecisionCreatedTrigger>,
  nodes: Node<NodeData>[],
  edges: Edge[],
): ValidationPayload<ValidDecisionCreatedWorkflow> {
  const errors: WorkflowError[] = [];
  const decisionCreatedTrigger = decisionCreatedTriggerSchema.safeParse(trigger.data);
  if (!decisionCreatedTrigger.success) {
    errors.push({
      type: 'invalid-node-config',
      nodeId: trigger.id,
    });
  }

  const outgoer = validateSingleOutgoer(trigger, nodes, edges);
  if (!outgoer.isValid) {
    errors.push(...outgoer.errors);
  }

  if (!decisionCreatedTrigger.success || !outgoer.isValid) {
    return { isValid: false, errors };
  }

  const action = outgoer.value;

  if (isCreateCaseAction(action.data)) {
    const createCaseAction = createCaseActionSchema.safeParse(action.data);
    if (!createCaseAction.success) {
      errors.push({
        type: 'invalid-node-config',
        nodeId: action.id,
      });
    }

    const noOutgoer = validateNoOutgoer(action, nodes, edges);
    if (!noOutgoer.isValid) {
      errors.push(...noOutgoer.errors);
    }

    if (!createCaseAction.success || !noOutgoer.isValid) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      value: {
        type: 'CREATE_CASE',
        trigger: decisionCreatedTrigger.data,
        action: createCaseAction.data,
      },
    };
  }

  if (isAddToCaseIfPossibleAction(action.data)) {
    const addToCaseIfPossibleAction = addToCaseIfPossibleActionSchema.safeParse(action.data);

    if (!addToCaseIfPossibleAction.success) {
      errors.push({
        type: 'invalid-node-config',
        nodeId: action.id,
      });
    }

    const noOutgoer = validateNoOutgoer(action, nodes, edges);
    if (!noOutgoer.isValid) {
      errors.push(...noOutgoer.errors);
    }

    if (!addToCaseIfPossibleAction.success || !noOutgoer.isValid) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      value: {
        type: 'ADD_TO_CASE_IF_POSSIBLE',
        trigger: decisionCreatedTrigger.data,
        action: addToCaseIfPossibleAction.data,
      },
    };
  }

  // Empty nodes are handled by the global validation
  if (!isEmptyNodeData(action.data)) {
    errors.push({
      type: 'wrong-outgoing-node',
      nodeId: trigger.id,
    });
  }
  return { isValid: false, errors };
}
