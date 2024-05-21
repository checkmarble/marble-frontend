import { type Outcome } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { assertNever } from 'typescript-utils';
import { type IconName } from 'ui-icons';

import { workflowI18n } from '../workflow-i18n';

export interface DecisionCreatedTrigger {
  type: 'decision-created';
  scenarioId: string | null;
  outcomes: Outcome[];
}

export type TriggerData = DecisionCreatedTrigger;

export function isTriggerData(data: NodeData): data is TriggerData {
  return data.type === 'decision-created';
}

export interface CreateCaseAction {
  type: 'create-case';
  inboxId: string | null;
}

export interface AddToCaseIfPossibleAction {
  type: 'add-to-case-if-possible';
  inboxId: string | null;
}

export type ActionData = CreateCaseAction | AddToCaseIfPossibleAction;

export function isActionData(data: NodeData): data is ActionData {
  return data.type === 'create-case' || data.type === 'add-to-case-if-possible';
}

export interface EmptyNodeData {
  type: 'empty-node';
}

export function isEmptyNodeData(data: NodeData): data is EmptyNodeData {
  return data.type === 'empty-node';
}

export type NodeData = TriggerData | ActionData | EmptyNodeData;

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
