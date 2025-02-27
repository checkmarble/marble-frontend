import { type AndAstNode } from '@app-builder/models/astNode/builder-ast-node';

import { AstBuilderDataState } from '../Provider';

export function AstBuilderRootAnd(_props: { node: AndAstNode }) {
  const triggerObjectType = AstBuilderDataState.useStore((s) => s.triggerObjectType);

  return (
    <>
      <div className="text-s grid grid-cols-[8px_16px_max-content_1fr_max-content]">
        <div className="text-s bg-grey-98 text-purple-65 col-span-5 flex size-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-1 rounded p-2 font-semibold">
          {triggerObjectType}
        </div>
        {/* {andAstNodeChildren.map(({ child, key, treePath }, childIndex) => {
          const isFirstCondition = childIndex === 0;
          const isLastCondition = childIndex === andAstNodeChildren.length - 1;

          return (
            <AndOperand
              key={key}
              isFirstCondition={isFirstCondition}
              isLastCondition={isLastCondition}
              treePath={treePath}
              astNode={child}
              viewOnly={viewOnly}
            />
          );
        })} */}
      </div>
    </>
  );
}
