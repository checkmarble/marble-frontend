import { NewUndefinedAstNode } from '@app-builder/models';
import {
  type AndAstNode,
  NewAndAstNode,
  type OrWithAndAstNode,
} from '@app-builder/models/astNode/builder-ast-node';
import { getAtPath, parsePath } from '@app-builder/utils/tree';
import { AddLogicalOperatorButton } from '@ast-builder/styles/AddLogicalOperatorButton';
import { LogicalOperatorLabel } from '@ast-builder/styles/LogicalOperatorLabel';
import { RemoveButton } from '@ast-builder/styles/RemoveButton';
import { type AstBuilderRootProps } from '@ast-builder/types';
import { computed } from '@preact/signals-react';
import invariant from 'tiny-invariant';

import { EditionAstBuilderNode } from './EditionNode';
import { EditionEvaluationErrors } from './EvaluationErrors';
import { useRoot } from './hooks/useRoot';
import { AstBuilderNodeSharpFactory } from './node-store';

function NewChildForAnd() {
  return NewUndefinedAstNode({
    children: [NewUndefinedAstNode(), NewUndefinedAstNode()],
  });
}

function NewChildForOr(): AndAstNode {
  return NewAndAstNode({
    children: [NewChildForAnd()],
  });
}

export function EditionAstBuilderOrWithAndRoot(props: AstBuilderRootProps<OrWithAndAstNode>) {
  const nodeStore = useRoot(props);

  const appendChild = () => {
    nodeStore.value.node.children.push(NewChildForOr());
    nodeStore.actions.validate();
  };
  const removeChild = (index: number) => {
    nodeStore.value.node.children.splice(index, 1);
    nodeStore.actions.validate();
  };

  return (
    <AstBuilderNodeSharpFactory.Provider value={nodeStore}>
      <div className="grid grid-cols-[40px_1fr_max-content] gap-2">
        {nodeStore.value.node.children.map((child, i) => {
          return (
            <EditionRootOrGroup
              key={child.id}
              isFirst={i === 0}
              path={`root.children.${i}`}
              nodeId={child.id}
              removeNode={() => {
                removeChild(i);
              }}
            />
          );
        })}
        <div className="col-span-3 flex flex-row flex-wrap gap-2">
          <AddLogicalOperatorButton onClick={appendChild} operator="or" />
          <EditionEvaluationErrors direct id={nodeStore.value.node.id} />
        </div>
      </div>
    </AstBuilderNodeSharpFactory.Provider>
  );
}

type EditionRootOrGroupProps = {
  isFirst: boolean;
  path: string;
  nodeId: string;
  removeNode: () => void;
};
function EditionRootOrGroup({ isFirst, path, removeNode }: EditionRootOrGroupProps) {
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();

  const node = computed(() => getAtPath(nodeSharp.value.node, parsePath(path)));
  invariant(node.value, `Couldn't find node at path: ${path}`);

  const appendChild = () => {
    if (!node.value) return;

    node.value.children.push(NewChildForAnd());
    nodeSharp.actions.validate();
  };
  const removeChild = (index: number) => {
    if (!node.value) return;

    if (node.value.children.length === 1) {
      removeNode();
      return;
    }

    node.value.children.splice(index, 1);
    nodeSharp.actions.validate();
  };

  return (
    <>
      {!isFirst ? (
        <>
          <LogicalOperatorLabel operator="or" className="uppercase" type="contained" />
          <div className="col-span-2 flex flex-1 items-center">
            <div className="bg-grey-90 h-px w-full" />
          </div>
        </>
      ) : null}
      {node.value.children.map((child, i) => {
        return (
          <EditionRootOrWithAndLine
            key={child.id}
            isFirst={i === 0}
            path={`${path}.children.${i}`}
            nodeId={child.id}
            removeNode={() => {
              removeChild(i);
            }}
          />
        );
      })}
      <div className="col-span-2 col-start-2 flex flex-row flex-wrap gap-2">
        <AddLogicalOperatorButton onClick={appendChild} operator="and" />
        <EditionEvaluationErrors direct id={node.value.id} />
      </div>
    </>
  );
}

type EditionRootAndLineProps = {
  isFirst: boolean;
  path: string;
  nodeId: string;
  removeNode: () => void;
};
function EditionRootOrWithAndLine({ isFirst, path, nodeId, removeNode }: EditionRootAndLineProps) {
  return (
    <>
      <LogicalOperatorLabel operator={isFirst ? 'if' : 'and'} type="contained" />

      <div className="flex flex-col gap-2">
        <EditionAstBuilderNode path={path} root />
        <EditionEvaluationErrors id={nodeId} />
      </div>
      <div className="flex h-10 flex-col items-center justify-center">
        <RemoveButton onClick={removeNode} />
      </div>
    </>
  );
}
