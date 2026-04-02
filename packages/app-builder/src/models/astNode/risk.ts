import { v7 as uuidv7 } from 'uuid';
import { AstNode, CheckNodeId, IdLessAstNode } from '..';

export const recordHasPastAlertsAstNodeName = 'RecordHasPastAlerts';

export interface RecordHasPastAlertsAstNode {
  id: string;
  name: typeof recordHasPastAlertsAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: Record<string, never>;
}

export function NewRecordHasPastAlertsAstNode(): RecordHasPastAlertsAstNode {
  return {
    id: uuidv7(),
    name: recordHasPastAlertsAstNodeName,
    children: [],
    namedChildren: {},
  };
}

export function isRecordHasPastAlertAstNode(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<RecordHasPastAlertsAstNode, typeof node> {
  return node.name === recordHasPastAlertsAstNodeName;
}
