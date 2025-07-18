import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import {
  isKnownOperandAstNode,
  isMainAstBinaryNode,
  isMainAstNode,
  isMainAstUnaryNode,
} from '@app-builder/models/astNode/builder-ast-node';
import {
  type allMainAstOperatorFunctions,
  isBinaryMainAstOperatorFunction,
  isUnaryMainAstOperatorFunction,
} from '@app-builder/models/astNode/builder-ast-node-node-operator';
import { isDataAccessorAstNode } from '@app-builder/models/astNode/data-accessor';
import { getDataAccessorAstNodeField } from '@app-builder/services/ast-node/getDataAccessorAstNodeField';
import { getAtPath, getParentPath, parsePath } from '@app-builder/utils/tree';
import { AstBuilderDataSharpFactory } from '@ast-builder/Provider';
import { NodeTypeError } from '@ast-builder/styles/NodeTypeError';
import { computed } from '@preact/signals-react';
import { memo, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { match } from 'ts-pattern';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { AstBuilderOperandProps } from '../Operand';
import { EditionAstBuilderOperand } from './EditionOperand';
import { getErrorsForNode } from './helpers';
import { AstBuilderNodeSharpFactory } from './node-store';
import { OperatorSelect, type OperatorSelectOptions } from './OperatorSelect';

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

const allMainAstOperatorFunctionsOptions: OperatorSelectOptions<
  (typeof allMainAstOperatorFunctions)[number]
> = {
  '=': {},
  '≠': { keywords: ['!='] },
  '<': {},
  '<=': {},
  '>': {},
  '>=': {},
  '+': {},
  '-': {},
  '*': {},
  '/': {},
  IsInList: {},
  IsNotInList: {},
  StringContains: {},
  StringNotContain: {},
  StringStartsWith: {},
  StringEndsWith: {},
  ContainsAnyOf: {},
  ContainsNoneOf: {},
  IsEmpty: {},
  IsNotEmpty: {},
};

export const EditionAstBuilderNode = memo(function EditionAstBuilderNode(props: {
  root?: boolean;
  path: string;
  coerceDataType?: AstBuilderOperandProps['coerceDataType'];
  optionsDataType?: AstBuilderOperandProps['optionsDataType'];
}) {
  const operandProps = {
    coerceDataType: props.coerceDataType,
    optionsDataType: props.optionsDataType,
  };
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
    nodeSharp.actions.validate();
  };
  const setOperator = (operator: string) => {
    if (node.value) {
      node.value.name = operator;
      if (isUnaryMainAstOperatorFunction(operator) && node.value.children.length > 1) {
        node.value.children = [node.value.children[0]!];
      } else if (isBinaryMainAstOperatorFunction(operator) && node.value.children.length < 2) {
        node.value.children = [node.value.children[0]!, NewUndefinedAstNode()];
      }
      nodeSharp.actions.validate();
    }
  };

  const children = match(node.value)
    .when(isMainAstBinaryNode, (node) => {
      const hasNestedLeftChild =
        isMainAstNode(node.children[0]) && node.children[0].children.length > 0;
      const hasNestedRightChild =
        isMainAstNode(node.children[1]) && node.children[1].children.length > 0;
      const hasAllNestedChildren = hasNestedLeftChild && hasNestedRightChild;
      const hasDirectError = getErrorsForNode(nodeSharp.value.validation, node.id, true).length > 0;
      const showBrackets = !props.root || hasAllNestedChildren;

      const children = (
        <>
          <EditionAstBuilderNode path={`${props.path}.children.0`} {...operandProps} />
          <OperatorSelect
            hideArrow
            options={allMainAstOperatorFunctionsOptions}
            validationStatus={hasDirectError ? 'error' : 'valid'}
            operator={node.name}
            onOperatorChange={setOperator}
          />
          <EditionAstBuilderNode path={`${props.path}.children.1`} {...operandProps} />
        </>
      );

      const wrappedChildren = showBrackets ? (
        <Brackets
          removeNesting={() => {
            setNode(node.children[0]);
            nodeSharp.actions.validate();
          }}
          addNesting={() => {
            setNode(NewUndefinedAstNode({ children: [node, NewUndefinedAstNode()] }));
          }}
          invertOperands={() => {
            const left = node.children[0];
            const right = node.children[1];

            nodeSharp.update(() => {
              node.children[0] = right;
              node.children[1] = left;
            });
          }}
        >
          {children}
        </Brackets>
      ) : (
        children
      );

      return props.root ? (
        <div className="inline-flex flex-row flex-wrap items-center gap-2">{wrappedChildren}</div>
      ) : (
        wrappedChildren
      );
    })
    .when(isMainAstUnaryNode, (node) => {
      const hasDirectError = getErrorsForNode(nodeSharp.value.validation, node.id, true).length > 0;
      const showBrackets = !props.root;

      const children = (
        <>
          <EditionAstBuilderNode path={`${props.path}.children.0`} {...operandProps} />
          <OperatorSelect
            hideArrow
            options={allMainAstOperatorFunctionsOptions}
            validationStatus={hasDirectError ? 'error' : 'valid'}
            operator={node.name}
            onOperatorChange={setOperator}
          />
        </>
      );

      const wrappedChildren = showBrackets ? (
        <Brackets
          unary
          removeNesting={() => {
            setNode(node.children[0]);
            nodeSharp.actions.validate();
          }}
          addNesting={() => {
            setNode(NewUndefinedAstNode({ children: [node, NewUndefinedAstNode()] }));
          }}
        >
          {children}
        </Brackets>
      ) : (
        children
      );

      return props.root ? (
        <div className="inline-flex flex-row flex-wrap items-center gap-2">{wrappedChildren}</div>
      ) : (
        wrappedChildren
      );
    })
    .when(isKnownOperandAstNode, (node) => {
      const hasDirectError = getErrorsForNode(nodeSharp.value.validation, node.id, true).length > 0;
      return (
        <EditionAstBuilderOperand
          node={node}
          onChange={setNode}
          enumValues={enumValues.value}
          validationStatus={hasDirectError ? 'error' : 'valid'}
          {...operandProps}
        />
      );
    })
    .otherwise(() => <NodeTypeError />);

  return children;
});
EditionAstBuilderNode.displayName = 'EditionAstBuilderNode';

type BracketProps = {
  children: ReactNode;
  removeNesting: () => void;
  addNesting: () => void;
} & ({ unary: true } | { unary?: false; invertOperands: () => void });
function Brackets({ children, ...props }: BracketProps) {
  return (
    <div className="group/nest contents">
      <Bracket {...props}>(</Bracket>
      {children}
      <Bracket {...props}>)</Bracket>
    </div>
  );
}

const Bracket = ({ children, removeNesting, addNesting, ...props }: BracketProps) => {
  const { t } = useTranslation(['scenarios']);
  const [open, setOpen] = useState(false);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <button className="text-grey-00 border-grey-90 [.group\/nest:hover:not(:has(.group\/nest:hover))_>_&]:bg-grey-95 [.group\/nest:hover:not(:has(.group\/nest:hover))_>_&]:border-grey-50 flex h-10 items-center justify-center rounded border px-2">
          {children}
        </button>
      </MenuCommand.Trigger>
      <MenuCommand.Content>
        <MenuCommand.List>
          {!props.unary ? (
            <MenuCommand.Item
              onSelect={props.invertOperands}
              className="data-[active-item]:bg-purple-98 grid w-full select-none grid-cols-[20px_1fr] gap-1 rounded-sm p-2 outline-none"
            >
              <Icon aria-hidden="true" className="col-start-1 size-5 shrink-0" icon="swap" />
              <div className="col-start-2 flex flex-row gap-1 overflow-hidden">
                <div className="text-grey-00 text-s w-full break-all text-start font-normal">
                  {t('scenarios:nesting.swap_operands')}
                </div>
              </div>
            </MenuCommand.Item>
          ) : null}
          <MenuCommand.Item
            onSelect={addNesting}
            className="data-[active-item]:bg-purple-98 grid w-full select-none grid-cols-[20px_1fr] gap-1 rounded-sm p-2 outline-none"
          >
            <Icon aria-hidden="true" className="col-start-1 size-5 shrink-0" icon="parentheses" />
            <div className="col-start-2 flex flex-row gap-1 overflow-hidden">
              <div className="text-grey-00 text-s w-full break-all text-start font-normal">
                {t('scenarios:nesting.add_right_nesting')}
              </div>
            </div>
          </MenuCommand.Item>
          <MenuCommand.Item
            onSelect={removeNesting}
            className="data-[active-item]:bg-red-95 grid w-full select-none grid-cols-[20px_1fr] gap-1 rounded-sm p-2 outline-none"
          >
            <Icon
              aria-hidden="true"
              className="text-red-43 col-start-1 size-5 shrink-0"
              icon="delete"
            />
            <div className="col-start-2 flex flex-row gap-1 overflow-hidden">
              <div className="text-grey-00 text-s w-full break-all text-start font-normal">
                {t('scenarios:nesting.remove')}
              </div>
            </div>
          </MenuCommand.Item>
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
};
