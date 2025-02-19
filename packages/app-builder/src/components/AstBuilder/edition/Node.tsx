import { findDataModelTableByName } from '@app-builder/models';
import {
  isKnownOperandAstNode,
  isMainAstBinaryNode,
  isMainAstNode,
  isMainAstUnaryNode,
} from '@app-builder/models/astNode/builder-ast-node';
import { getEnumValuesFromNeighbour } from '@app-builder/services/editor/getEnumOptionsFromNeighbour';
import { getAtPath, getParentPath, parsePath } from '@app-builder/utils/tree';
import { memo, type PropsWithChildren, useMemo } from 'react';
import invariant from 'tiny-invariant';
import { match } from 'ts-pattern';

import { AstBuilderNodeState } from '../node-store';
import { AstBuilderDataState } from '../Provider';
import { getEnumValues } from './helpers';
import { Internal_EditionAstBuilderOperand } from './InternalOperand';

export const AstBuilderNode = memo(function (props: { path: string }) {
  const node = AstBuilderNodeState.useStore((s) =>
    getAtPath(s.node, parsePath(props.path)),
  );
  invariant(node, `Couldn't find node at path: ${props.path}`);

  const parentPath = useMemo(
    () => getParentPath(parsePath(props.path)),
    [props.path],
  );
  const parentNode = AstBuilderNodeState.useStore((s) =>
    !parentPath ? null : getAtPath(s.node, parentPath.path),
  );

  const setNodeAtPath = AstBuilderNodeState.useStore((s) => s.setNodeAtPath);
  const dataStore = AstBuilderDataState.useStore((s) => s);
  const enumValues = useMemo(() => {
    const triggerObjectTable = findDataModelTableByName({
      dataModel: dataStore.dataModel,
      tableName: dataStore.triggerObjectType,
    });
    const nodeSegment = parsePath(props.path)?.pop() ?? null;
    if (!nodeSegment || !parentNode) return [];

    return getEnumValues(nodeSegment, {
      parentNode,
      context: { dataModel: dataStore.dataModel, triggerObjectTable },
    });
  }, [props.path, parentNode, dataStore]);

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
        <div className="inline-flex flex-row flex-wrap items-center gap-2">
          {children}
        </div>
      );
    })
    .when(isMainAstUnaryNode, (_node) => 'unary')
    .when(isKnownOperandAstNode, (node) => {
      return (
        <Internal_EditionAstBuilderOperand
          node={node}
          onChange={(newNode) => setNodeAtPath(props.path, newNode)}
          enumValues={enumValues}
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
  return <div className="contents">{children}</div>;
}
