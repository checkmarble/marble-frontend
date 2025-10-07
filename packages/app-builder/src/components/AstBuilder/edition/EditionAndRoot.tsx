import { NewUndefinedAstNode } from '@app-builder/models';
import { type AndAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { AstBuilderDataSharpFactory } from '@ast-builder/Provider';
import { AddLogicalOperatorButton } from '@ast-builder/styles/AddLogicalOperatorButton';
import { LogicalOperatorLabel } from '@ast-builder/styles/LogicalOperatorLabel';
import { RemoveButton } from '@ast-builder/styles/RemoveButton';
import { type AstBuilderRootProps } from '@ast-builder/types';
import clsx from 'clsx';

import { EditionAstBuilderNode } from './EditionNode';
import { EditionEvaluationErrors } from './EvaluationErrors';
import { useRoot } from './hooks/useRoot';
import { AstBuilderNodeSharpFactory } from './node-store';

function NewAndChild() {
  return NewUndefinedAstNode({
    children: [NewUndefinedAstNode(), NewUndefinedAstNode()],
  });
}

export function EditionAstBuilderAndRoot(props: AstBuilderRootProps<AndAstNode>) {
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const nodeStore = useRoot(props);

  const appendChild = () => {
    nodeStore.value.node.children.push(NewAndChild());
    nodeStore.actions.validate();
    nodeStore.actions.triggerUpdate();
  };
  const removeChild = (index: number) => {
    nodeStore.value.node.children.splice(index, 1);
    nodeStore.actions.validate();
    nodeStore.actions.triggerUpdate();
  };

  return (
    <AstBuilderNodeSharpFactory.Provider value={nodeStore}>
      <div className="flex flex-col gap-2 lg:gap-4">
        <div className="text-s grid grid-cols-[8px_16px_max-content_1fr_max-content]">
          <div className="text-s bg-grey-98 text-purple-65 col-span-5 flex size-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-1 rounded-sm p-2 font-semibold">
            {dataSharp.value.data.$triggerObjectType}
          </div>
          {nodeStore.value.node.children.map((child, i, children) => {
            return (
              <EditionRootAndLine
                key={child.id}
                isFirst={i === 0}
                isLast={i === children.length - 1}
                path={`root.children.${i}`}
                nodeId={child.id}
                removeNode={() => {
                  removeChild(i);
                }}
              />
            );
          })}
        </div>
        <div className="flex flex-row flex-wrap gap-2">
          <AddLogicalOperatorButton onClick={appendChild} operator="and" />
          <EditionEvaluationErrors
            direct
            id={nodeStore.value.node.id}
            filterOut={['ARGUMENT_MUST_BE_BOOLEAN']}
          />
        </div>
      </div>
    </AstBuilderNodeSharpFactory.Provider>
  );
}

type EditionRootAndLineProps = {
  isFirst: boolean;
  isLast: boolean;
  path: string;
  nodeId: string;
  removeNode: () => void;
};
function EditionRootAndLine({
  isFirst,
  isLast,
  path,
  nodeId,
  removeNode,
}: EditionRootAndLineProps) {
  return (
    <>
      {/* Row 1 */}
      <div className={clsx('border-grey-90 col-span-5 w-2 border-e', isFirst ? 'h-4' : 'h-2')} />

      {/* Row 2 */}
      <div className={clsx('border-grey-90 col-start-1 border-e', isLast && 'h-5')} />
      <div className="border-grey-90 col-start-2 h-5 border-b" />

      <LogicalOperatorLabel
        operator={isFirst ? 'where' : 'and'}
        className="col-start-3"
        type="contained"
      />

      <div className={clsx('col-span-1 col-start-4 flex flex-col gap-2 px-2')}>
        <EditionAstBuilderNode path={path} root />
        <EditionEvaluationErrors id={nodeId} />
      </div>
      <div className="col-start-5 flex h-10 flex-col items-center justify-center">
        <RemoveButton onClick={removeNode} />
      </div>
    </>
  );
}
