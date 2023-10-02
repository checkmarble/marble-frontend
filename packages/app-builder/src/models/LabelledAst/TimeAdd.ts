import {
  getDatabaseAccessorDisplayName,
  getPayloadAccessorsDisplayName,
  isDatabaseAccess,
  isPayload,
  type LabelledAst,
  NewTimeAddAstNode,
  type TimeAddAstNode,
} from '@app-builder/models';

export function newTimeAddLabelledAst(
  node: TimeAddAstNode = NewTimeAddAstNode()
): LabelledAst {
  return {
    name: getTimeAddName(node),
    description: '',
    operandType: 'Variable',
    dataType: 'Timestamp',
    astNode: node,
  };
}

const getTimeAddName = (node: TimeAddAstNode): string => {
  const operator = node.children[1].constant.slice(0, 1);
  const interval = node.children[1].constant.slice(1);
  let timestamp = '';
  if (isDatabaseAccess(node.children[0])) {
    timestamp = getDatabaseAccessorDisplayName(node.children[0]);
  }
  if (isPayload(node.children[0])) {
    timestamp = getPayloadAccessorsDisplayName(node.children[0]);
  }

  if (operator === '' || interval === '' || timestamp === '') {
    return 'Date';
  }

  return `${timestamp} ${operator} ${interval}`;
};
