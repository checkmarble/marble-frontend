import { type AstNode } from '@app-builder/models';
import {
  isKnownOperandAstNode,
  isMainAstBinaryNode,
  isMainAstNode,
  isMainAstUnaryNode,
} from '@app-builder/models/astNode/builder-ast-node';
import { type FlatAstValidation } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/validate-ast';
import { useFormatLanguage } from '@app-builder/utils/format';
import { NodeTypeError } from '@ast-builder/styles/NodeTypeError';
import { memo, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { formatReturnValue } from './helpers';
import { ViewingAstBuilderOperand } from './ViewingOperand';
import { ViewingOperator } from './ViewingOperator';

export const ViewingAstBuilderNode = memo(function ViewingAstBuilderNode(props: {
  root?: boolean;
  path: string;
  node: AstNode;
  validation: FlatAstValidation;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();

  const children = match(props.node)
    .when(isMainAstBinaryNode, (node) => {
      const hasNestedLeftChild = isMainAstNode(node.children[0]) && node.children[0].children.length > 0;
      const hasNestedRightChild = isMainAstNode(node.children[1]) && node.children[1].children.length > 0;
      const hasAllNestedChildren = hasNestedLeftChild && hasNestedRightChild;

      const children = (
        <>
          <ViewingAstBuilderNode
            path={`${props.path}.children.0`}
            node={node.children[0]}
            validation={props.validation}
          />
          <ViewingOperator operator={node.name} />
          <ViewingAstBuilderNode
            path={`${props.path}.children.1`}
            node={node.children[1]}
            validation={props.validation}
          />
        </>
      );

      return !props.root || hasAllNestedChildren ? (
        <Brackets>{children}</Brackets>
      ) : (
        <div className="inline-flex flex-row flex-wrap items-center gap-2">{children}</div>
      );
    })
    .when(isMainAstUnaryNode, (node) => {
      const children = (
        <>
          <ViewingAstBuilderNode
            path={`${props.path}.children.0`}
            node={node.children[0]}
            validation={props.validation}
          />
          <ViewingOperator operator={node.name} />
        </>
      );

      return !props.root ? (
        <Brackets>{children}</Brackets>
      ) : (
        <div className="inline-flex flex-row flex-wrap items-center gap-2">{children}</div>
      );
    })
    .when(isKnownOperandAstNode, (node) => {
      const directEvaluation = props.validation.evaluation.find((e) => e.nodeId === node.id);
      const hasDirectError = !!directEvaluation?.errors.length;
      const returnValue = formatReturnValue(directEvaluation?.returnValue, {
        t,
        language,
      });

      return (
        <ViewingAstBuilderOperand
          node={node}
          validationStatus={hasDirectError ? 'error' : 'valid'}
          returnValue={returnValue}
        />
      );
    })
    .otherwise(() => <NodeTypeError />);

  return children;
});
ViewingAstBuilderNode.displayName = 'ViewingAstBuilderNode';

function Brackets({ children }: PropsWithChildren) {
  const className =
    'text-grey-00 border-grey-90 [.group/nest:hover:not(:has(.group/nest:hover))_>_&]:bg-grey-95 [.group/nest:hover:not(:has(.group/nest:hover))_>_&]:border-grey-50 flex h-10 items-center justify-center rounded border px-2';
  return (
    <div className="group/nest contents">
      <button type="button" className={className}>
        (
      </button>
      {children}
      <button type="button" className={className}>
        )
      </button>
    </div>
  );
}
