import { type AstNode } from '@app-builder/models';
import {
  isKnownOperandAstNode,
  isMainAstBinaryNode,
  isMainAstUnaryNode,
} from '@app-builder/models/astNode/builder-ast-node';
import { isDataAccessorAstNode } from '@app-builder/models/astNode/data-accessor';
import { getDataAccessorAstNodeField } from '@app-builder/services/ast-node/getDataAccessorAstNodeField';
import { getAtPath, getParentPath, parsePath } from '@app-builder/utils/tree';
import { computed } from '@preact/signals-react';
import { memo, type PropsWithChildren } from 'react';
import invariant from 'tiny-invariant';
import { match } from 'ts-pattern';

import { AstBuilderNodeState } from '../node-store';
import { AstBuilderDataState } from '../Provider';
import { Internal_EditionAstBuilderOperand } from './InternalOperand';

function useSiblings(stringPath: string) {
  const rootNode = AstBuilderNodeState.useStore().value.node;

  const path = parsePath(stringPath);
  const parentPath = getParentPath(path);
  if (!parentPath || parentPath.childPathSegment?.type !== 'children') {
    return [];
  }
  const childIndex = parentPath.childPathSegment.index;
  const parentNode = getAtPath(rootNode, parentPath.path);
  if (!parentNode || parentNode.name !== '=') {
    return [];
  }

  return [
    ...parentNode.children.slice(0, childIndex),
    ...parentNode.children.slice(childIndex + 1),
  ];
}

export const AstBuilderNode = memo(function (props: { path: string }) {
  const dataStore = AstBuilderDataState.useStore((s) => s);
  const astBuilderStore = AstBuilderNodeState.useStore();

  const node = AstBuilderNodeState.useStoreValue((s) => getAtPath(s.node, parsePath(props.path)));
  invariant(node, `Couldn't find node at path: ${props.path}`);
  const siblings = useSiblings(props.path);

  const enumValues = computed(() => {
    const enums = [];
    const triggerTable = dataStore.dataModel.find((t) => t.name === dataStore.triggerObjectType);
    if (!triggerTable) {
      return;
    }

    for (const neighbourNode of siblings) {
      if (isDataAccessorAstNode(neighbourNode)) {
        const field = getDataAccessorAstNodeField(neighbourNode, {
          dataModel: dataStore.dataModel,
          triggerObjectTable: triggerTable,
        });
        if (field.isEnum) {
          enums.push(...(field.values ?? []));
        }
      }
    }

    return enums;
  });

  const setNode = (newNode: AstNode) => {
    astBuilderStore.actions.setNodeAtPath(props.path, newNode);
  };

  const children = match(node)
    .when(isMainAstBinaryNode, () => {
      const children = (
        <Brackets>
          <AstBuilderNode path={`${props.path}.children.0`} />
          <AstBuilderNode path={`${props.path}.children.1`} />
        </Brackets>
      );

      return props.path !== 'root' ? (
        children
      ) : (
        <div className="inline-flex flex-row flex-wrap items-center gap-2">{children}</div>
      );
    })
    .when(isMainAstUnaryNode, (_node) => 'unary')
    .when(isKnownOperandAstNode, (node) => {
      return (
        <Internal_EditionAstBuilderOperand
          node={node}
          onChange={setNode}
          enumValues={enumValues.value}
        />
      );
    })
    .otherwise(() => <NodeErrorTypePlaceholder />);

  return props.path === 'root' ? <div className="">{children}</div> : children;
});
AstBuilderNode.displayName = 'AstBuilderNode';

export function NodeErrorTypePlaceholder() {
  return (
    <span className="bg-red-95 text-red-47 border-red-47 h-10 w-fit min-w-10 rounded border-[0.5px] p-2">
      Wrong node type
    </span>
  );
}

function Brackets({ children }: PropsWithChildren) {
  return (
    <div className="contents">
      <span>(</span>
      {children}
      <span>)</span>
    </div>
  );
}
