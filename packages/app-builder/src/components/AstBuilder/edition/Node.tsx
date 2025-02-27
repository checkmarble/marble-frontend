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
import { cva } from 'class-variance-authority';
import { memo, type PropsWithChildren, useState } from 'react';
import invariant from 'tiny-invariant';
import { match } from 'ts-pattern';
import { MenuCommand } from 'ui-design-system';

import { AstBuilderNodeSharpFactory } from '../node-store';
import { AstBuilderDataSharpFactory } from '../Provider';
import { Internal_EditionAstBuilderOperand } from './InternalOperand';

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

export const AstBuilderNode = memo(function (props: { path: string }) {
  const data = AstBuilderDataSharpFactory.useSharp().value.$data!.value;
  const astBuilderSharp = AstBuilderNodeSharpFactory.useSharp();

  const node = computed(() => getAtPath(astBuilderSharp.value.node, parsePath(props.path)));
  invariant(node.value, `Couldn't find node at path: ${props.path}`);
  const siblings = useSiblings(props.path);

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
    astBuilderSharp.actions.setNodeAtPath(props.path, newNode);
  };
  const setOperator = (operator: string) => {
    if (node.value) {
      node.value.name = operator;
    }
  };

  const children = match(node.value)
    .when(isMainAstBinaryNode, (node) => {
      const children = (
        <>
          <AstBuilderNode path={`${props.path}.children.0`} />
          <OperatorSelector operator={node.name} onOperatorChange={setOperator} />
          <AstBuilderNode path={`${props.path}.children.1`} />
        </>
      );

      return props.path !== 'root' ? (
        <Brackets>{children}</Brackets>
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

export const operatorContainerClassnames = cva(
  [
    'flex h-10 min-w-[40px] items-center justify-between outline-none gap-2 rounded px-2 border',
    'bg-grey-100 disabled:border-grey-98 disabled:bg-grey-98',
    'radix-state-open:border-purple-65  radix-state-open:bg-purple-98',
  ],
  {
    variants: {
      validationStatus: {
        valid: 'border-grey-90 focus:border-purple-65',
        error: 'border-red-47 focus:border-purple-65',
      },
    },
    defaultVariants: {
      validationStatus: 'valid',
    },
  },
);

const ops = ['+', '-', '/', '*', '=', '!='];
function OperatorSelector({
  operator,
  onOperatorChange,
}: {
  operator: string;
  onOperatorChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <button type="button" className={operatorContainerClassnames()}>
          <span className="text-s text-grey-00 w-full text-center font-medium">{operator}</span>
        </button>
      </MenuCommand.Trigger>
      <MenuCommand.Content sideOffset={4} align="start" className="min-w-24">
        <MenuCommand.List>
          {ops.map((op) => (
            <MenuCommand.Item
              selected={operator === op}
              key={op}
              onSelect={() => onOperatorChange(op)}
            >
              {op}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
