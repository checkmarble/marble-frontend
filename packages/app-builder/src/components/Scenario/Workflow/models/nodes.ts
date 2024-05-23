import { type Outcome } from 'marble-api';
import { nanoid } from 'nanoid';
import { useTranslation } from 'react-i18next';
import { type Node } from 'reactflow';
import { assertNever } from 'typescript-utils';
import { type IconName } from 'ui-icons';

import { workflowI18n } from '../workflow-i18n';

export interface DecisionCreatedTrigger {
  type: 'decision-created';
  scenarioId: string | null;
  outcomes: Outcome[];
}

export function isDecisionCreatedTrigger(
  data: NodeData,
): data is DecisionCreatedTrigger {
  return data.type === 'decision-created';
}

export type TriggerData = DecisionCreatedTrigger;

export function isTriggerData(data: NodeData): data is TriggerData {
  return isDecisionCreatedTrigger(data);
}

export interface CreateCaseAction {
  type: 'create-case';
  inboxId: string | null;
}

export function isCreateCaseAction(data: NodeData): data is CreateCaseAction {
  return data.type === 'create-case';
}

export interface AddToCaseIfPossibleAction {
  type: 'add-to-case-if-possible';
  inboxId: string | null;
}

export function isAddToCaseIfPossibleAction(
  data: NodeData,
): data is AddToCaseIfPossibleAction {
  return data.type === 'add-to-case-if-possible';
}

export type ActionData = CreateCaseAction | AddToCaseIfPossibleAction;

export function isActionData(data: NodeData): data is ActionData {
  return isCreateCaseAction(data) || isAddToCaseIfPossibleAction(data);
}

export interface EmptyNodeData {
  type: 'empty-node';
}

export function isEmptyNodeData(data: NodeData): data is EmptyNodeData {
  return data.type === 'empty-node';
}

export type NodeData = TriggerData | ActionData | EmptyNodeData;

export function isTriggerOrActionData(
  data: NodeData,
): data is TriggerData | ActionData {
  return isTriggerData(data) || isActionData(data);
}

export function useTitleInfo(data: TriggerData | ActionData): {
  icon: IconName;
  title: string;
  entity: string;
} {
  const { t } = useTranslation(workflowI18n);
  if (isTriggerData(data)) {
    switch (data.type) {
      case 'decision-created':
        return {
          icon: 'decision',
          title: t('workflows:trigger_node.decision_created.title'),
          entity: t('workflows:trigger_node.decision_created.entity'),
        };
      default:
        assertNever('Unknown TriggerData', data);
    }
  }
  if (isActionData(data)) {
    switch (data.type) {
      case 'create-case':
        return {
          icon: 'case-manager',
          title: t('workflows:action_node.create_case.title'),
          entity: t('workflows:action_node.create_case.entity'),
        };
      case 'add-to-case-if-possible':
        return {
          icon: 'case-manager',
          title: t('workflows:action_node.add_to_case_if_possible.title'),
          entity: t('workflows:action_node.add_to_case_if_possible.entity'),
        };
      default:
        assertNever('Unknown ActionData', data);
    }
  }
  assertNever('Unknown NodeData', data);
}

export type NodeType = 'trigger' | 'action' | 'empty_node';

export function adaptNodeType(nodeData: NodeData): NodeType {
  if (isTriggerData(nodeData)) {
    return 'trigger';
  }
  if (isActionData(nodeData)) {
    return 'action';
  }
  if (isEmptyNodeData(nodeData)) {
    return 'empty_node';
  }
  assertNever('Unknown node data type', nodeData);
}

export function createNode<Data extends NodeData>(nodeData: Data): Node<Data> {
  return {
    id: nanoid(6),
    type: adaptNodeType(nodeData),
    data: nodeData,
    position: { x: 0, y: 0 },
  };
}

export function createEmptyNode(): Node<EmptyNodeData> {
  return createNode({
    type: 'empty-node',
  });
}
