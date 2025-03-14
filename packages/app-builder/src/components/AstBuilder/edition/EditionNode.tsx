import { type AstNode } from '@app-builder/models';
import {
  isKnownOperandAstNode,
  isMainAstBinaryNode,
  isMainAstUnaryNode,
} from '@app-builder/models/astNode/builder-ast-node';
import { allMainAstOperatorFunctions } from '@app-builder/models/astNode/builder-ast-node-node-operator';
import { isDataAccessorAstNode } from '@app-builder/models/astNode/data-accessor';
import { getDataAccessorAstNodeField } from '@app-builder/services/ast-node/getDataAccessorAstNodeField';
import { getAtPath, getParentPath, parsePath } from '@app-builder/utils/tree';
import { computed } from '@preact/signals-react';
import { memo, type PropsWithChildren } from 'react';
import invariant from 'tiny-invariant';
import { match } from 'ts-pattern';

import { AstBuilderDataSharpFactory } from '../Provider';
import { NodeTypeError } from '../styles/NodeTypeError';
import { EditionAstBuilderOperand } from './EditionOperand';
import { AstBuilderNodeSharpFactory } from './node-store';
import { OperatorSelect } from './OperatorSelect';

function useSiblings(stringPath: string) {
  const rootNode = AstBuilderNodeSharpFactory.useSharp().value.node;

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

export const EditionAstBuilderNode = memo(function EditionAstBuilderNode(props: {
  root?: boolean;
  path: string;
}) {
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const data = dataSharp.value.$data!.value;
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();

  const node = computed(() => getAtPath(nodeSharp.value.node, parsePath(props.path)));
  invariant(node.value, `Couldn't find node at path: ${props.path}`);
  const siblings = useSiblings(props.path);

  // Calculate enumValues based on neighbours
  const enumValues = computed(() => {
    const enums = [];
    const triggerTable = data.dataModel.find((t) => t.name === data.triggerObjectType);
    if (!triggerTable) {
      return;
    }

    for (const neighbourNode of siblings) {
      if (isDataAccessorAstNode(neighbourNode)) {
        const field = getDataAccessorAstNodeField(neighbourNode, {
          dataModel: data.dataModel,
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
    nodeSharp.actions.setNodeAtPath(props.path, newNode);
    nodeSharp.actions.validate(dataSharp.value.validateFn);
  };
  const setOperator = (operator: string) => {
    if (node.value) {
      node.value.name = operator;
      nodeSharp.actions.validate(dataSharp.value.validateFn);
    }
  };

  const children = match(node.value)
    .when(isMainAstBinaryNode, (node) => {
      const hasDirectError = !!nodeSharp.value.evaluation.find((e) => e.nodeId === node.id)?.errors
        .length;

      const children = (
        <>
          <EditionAstBuilderNode path={`${props.path}.children.0`} />
          <OperatorSelect
            options={allMainAstOperatorFunctions}
            validationStatus={hasDirectError ? 'error' : 'valid'}
            operator={node.name}
            onOperatorChange={setOperator}
          />
          <EditionAstBuilderNode path={`${props.path}.children.1`} />
        </>
      );

      return !props.root ? (
        <Brackets>{children}</Brackets>
      ) : (
        <div className="inline-flex flex-row flex-wrap items-center gap-2">{children}</div>
      );
    })
    .when(isMainAstUnaryNode, (node) => {
      const hasDirectError = !!nodeSharp.value.evaluation.find((e) => e.nodeId === node.id)?.errors
        .length;

      return (
        <>
          <EditionAstBuilderNode path={`${props.path}.children.0`} />
          <OperatorSelect
            options={allMainAstOperatorFunctions}
            validationStatus={hasDirectError ? 'error' : 'valid'}
            operator={node.name}
            onOperatorChange={setOperator}
          />
        </>
      );
    })
    .when(isKnownOperandAstNode, (node) => {
      const hasDirectError = !!nodeSharp.value.evaluation.find((e) => e.nodeId === node.id)?.errors
        .length;

      return (
        <EditionAstBuilderOperand
          node={node}
          onChange={setNode}
          enumValues={enumValues.value}
          validationStatus={hasDirectError ? 'error' : 'valid'}
        />
      );
    })
    .otherwise(() => <NodeTypeError />);

  return children;
});
EditionAstBuilderNode.displayName = 'EditionAstBuilderNode';

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
