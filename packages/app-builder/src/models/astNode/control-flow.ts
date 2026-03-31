import { v7 as uuidv7 } from 'uuid';

import { type AstNode, CheckNodeId, IdLessAstNode, NewUndefinedAstNode } from './ast-node';
import { ConstantAstNode, NewConstantAstNode } from './constant';

export const switchAstNodeName = 'Switch';
export interface SwitchAstNode {
  id: string;
  name: typeof switchAstNodeName;
  constant?: undefined;
  children: AstNode[];
  namedChildren: {
    field: AstNode;
    type: AstNode;
  };
}

export function isSwitchAstNode(node: IdLessAstNode | AstNode): node is CheckNodeId<SwitchAstNode, typeof node> {
  return node.name === switchAstNodeName;
}

export function NewSwitchAstNode(ruleType: string, field?: AstNode): SwitchAstNode {
  return {
    id: uuidv7(),
    name: switchAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      field: field ?? NewUndefinedAstNode(),
      type: NewConstantAstNode({ constant: ruleType }),
    },
  };
}

export const scoreComputationAstNodeName = 'ScoreComputation';
export interface ScoreComputationAstNode {
  id: string;
  name: typeof scoreComputationAstNodeName;
  constant?: undefined;
  children: AstNode[];
  namedChildren: {
    modifier: ConstantAstNode<number>;
    floor?: ConstantAstNode<number>;
  };
}

export function isScoreComputationAstNode(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<ScoreComputationAstNode, typeof node> {
  return node.name === scoreComputationAstNodeName;
}
