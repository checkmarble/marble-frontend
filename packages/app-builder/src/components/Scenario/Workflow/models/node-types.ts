import { assertNever } from 'typescript-utils';

import {
  isActionData,
  isEmptyNodeData,
  isTriggerData,
  type NodeData,
} from './node-data';

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
