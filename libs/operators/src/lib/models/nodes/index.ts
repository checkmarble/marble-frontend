import {
  constantDeclarationsMap,
  type ConstantNode,
  type ConstantNodeMap,
  isConstantNode,
} from './constants';
import {
  dataFieldDeclarationsMap,
  type DataFieldNode,
  type DataFieldNodeMap,
  isDataFieldNode,
  isDbFieldNode,
} from './data-field';
import {
  isMathOperatorNode,
  mathOperatorDeclarationsMap,
  type MathOperatorNode,
  type MathOperatorNodeMap,
  type MathOperatorNodeName,
} from './math-operator';
import { type OperatorDeclarationMap } from './types';

export {
  type ConstantNode,
  type DataFieldNode,
  isConstantNode,
  isDataFieldNode,
  isDbFieldNode,
  isMathOperatorNode,
  type MathOperatorNode,
  type MathOperatorNodeName,
};

type OperatorNodeMap = MathOperatorNodeMap & ConstantNodeMap & DataFieldNodeMap;

export type OperatorNodeName = keyof OperatorNodeMap;
export type OperatorNode = OperatorNodeMap[OperatorNodeName];

export const operatorDeclarationsMap = {
  ...mathOperatorDeclarationsMap,
  ...constantDeclarationsMap,
  ...dataFieldDeclarationsMap,
} satisfies OperatorDeclarationMap<OperatorNodeMap>;
