import { type AstNode } from '@app-builder/models';
import { type AndAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { type FlatNodeEvaluation } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/validate-ast';
import { AstBuilderDataSharpFactory } from '@ast-builder/Provider';
import { LogicalOperatorLabel } from '@ast-builder/styles/LogicalOperatorLabel';
import { type AstBuilderRootProps } from '@ast-builder/types';
import clsx from 'clsx';
import { useMemo } from 'react';

import { ViewingEvaluationErrors } from './ViewingEvaluationErrors';
import { ViewingAstBuilderNode } from './ViewingNode';

type ViewingAstBuilderAndRootProps = Omit<AstBuilderRootProps<AndAstNode>, 'onStoreInit'>;

export function ViewingAstBuilderAndRoot(props: ViewingAstBuilderAndRootProps) {
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const evaluation = useMemo(() => props.evaluation ?? [], [props.evaluation]);

  return (
    <div className="flex flex-col gap-2 lg:gap-4">
      <div className="text-s grid grid-cols-[8px_16px_max-content_1fr_max-content]">
        <div className="text-s bg-grey-98 text-purple-65 col-span-5 flex size-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-1 rounded p-2 font-semibold">
          {dataSharp.value.data.$triggerObjectType}
        </div>
        {props.node.children.map((child, i, children) => {
          return (
            <ViewingRootAndLine
              key={child.id}
              isFirst={i === 0}
              isLast={i === children.length - 1}
              path={`root.children.${i}`}
              node={child}
              evaluation={evaluation}
            />
          );
        })}
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        <ViewingEvaluationErrors direct id={props.node.id} evaluation={evaluation} />
      </div>
    </div>
  );
}

type ViewingRootAndLineProps = {
  isFirst: boolean;
  isLast: boolean;
  path: string;
  node: AstNode;
  evaluation: FlatNodeEvaluation[];
};
function ViewingRootAndLine({ isFirst, isLast, path, evaluation, node }: ViewingRootAndLineProps) {
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

      <div className={clsx('col-span-2 col-start-4 flex flex-col gap-2 px-2')}>
        <ViewingAstBuilderNode path={path} node={node} evaluation={evaluation} root />
        <ViewingEvaluationErrors id={node.id} evaluation={evaluation} />
      </div>
    </>
  );
}
