import { v7 as uuidv7 } from 'uuid';
import { AstNode, CheckNodeId, IdLessAstNode } from '..';
import { ConstantAstNode, NewConstantAstNode } from './constant';

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

export const recordRiskLevelCheckAstNodeName = 'RecordRiskLevel';
export interface RecordRiskLevelCheckAstNode {
  id: string;
  name: typeof recordRiskLevelCheckAstNodeName;
  constant?: undefined;
  children: [ConstantAstNode<number[]>];
  namedChildren: Record<string, never>;
}

export function NewRecordRiskLevelCheckAstNode(riskLevels: number[] = []): RecordRiskLevelCheckAstNode {
  return {
    id: uuidv7(),
    name: recordRiskLevelCheckAstNodeName,
    children: [NewConstantAstNode({ constant: riskLevels })],
    namedChildren: {},
  };
}

export function isRecordHasPastAlertAstNode(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<RecordHasPastAlertsAstNode, typeof node> {
  return node.name === recordHasPastAlertsAstNodeName;
}

export function isRecordRiskLevelCheckAstNode(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<RecordRiskLevelCheckAstNode, typeof node> {
  return node.name === recordRiskLevelCheckAstNodeName;
}
