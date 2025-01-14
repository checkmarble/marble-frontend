import {
  type MainAstBinaryNode,
  type MainAstUnaryNode,
  NewUndefinedAstNode,
} from '@app-builder/models';
import {
  useAstNodeEditorActions,
  useEvaluationErrors,
} from '@app-builder/services/editor/ast-editor';
import { useMainAstOperatorFunctions } from '@app-builder/services/editor/options';
import type * as React from 'react';
import { useTranslation } from 'react-i18next';
import { MenuButton, MenuItem, MenuPopover, MenuRoot } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { AstBuilderNode } from './AstBuilderNode';
import { Operator } from './Operator';

export function MainAstBinaryOperatorLine({
  treePath,
  mainAstNode,
  viewOnly,
  root,
}: {
  treePath: string;
  mainAstNode: MainAstBinaryNode;
  viewOnly?: boolean;
  root?: boolean;
}) {
  const { setAstNodeAtPath, setOperatorAtPath } = useAstNodeEditorActions();

  function removeNesting() {
    const nestedChild = mainAstNode.children[0];
    if (!nestedChild) return;
    setAstNodeAtPath(treePath, nestedChild);
  }

  function invertOperands() {
    const leftChild = mainAstNode.children[0];
    const rightChild = mainAstNode.children[1];

    if (!leftChild || !rightChild) return;

    setAstNodeAtPath(treePath, {
      ...mainAstNode,
      children: [rightChild, leftChild],
    });
  }

  function addRightNesting() {
    setAstNodeAtPath(
      treePath,
      NewUndefinedAstNode({ children: [mainAstNode, NewUndefinedAstNode()] }),
    );
  }

  const operators = useMainAstOperatorFunctions();

  const left = mainAstNode.children[0];
  const leftPath = `${treePath}.children.0`;
  const right = mainAstNode.children[1];
  const rightPath = `${treePath}.children.1`;

  const evaluationErrors = useEvaluationErrors(treePath);

  const children = (
    <div className="group/nest contents">
      {!root ? (
        <NestingParenthesis
          invertOperands={invertOperands}
          removeNesting={removeNesting}
          addRightNesting={addRightNesting}
        >
          (
        </NestingParenthesis>
      ) : null}
      <AstBuilderNode
        treePath={leftPath}
        astNode={left}
        onSave={(astNode) => {
          setAstNodeAtPath(leftPath, astNode);
        }}
        viewOnly={viewOnly}
      />
      <Operator
        value={mainAstNode.name}
        setValue={(operator: (typeof operators)[number]) => {
          setOperatorAtPath(treePath, operator);
        }}
        validationStatus={evaluationErrors.length > 0 ? 'error' : 'valid'}
        viewOnly={viewOnly}
        operators={operators}
      />
      <AstBuilderNode
        treePath={rightPath}
        astNode={right}
        onSave={(astNode) => {
          setAstNodeAtPath(rightPath, astNode);
        }}
        viewOnly={viewOnly}
      />
      {!root ? (
        <NestingParenthesis
          invertOperands={invertOperands}
          removeNesting={removeNesting}
          addRightNesting={addRightNesting}
        >
          )
        </NestingParenthesis>
      ) : null}
    </div>
  );

  // remove the <div> root wrapper to flatten the structure and use a single root flex-wrap
  if (!root) return children;

  return (
    <div className="inline-flex flex-row flex-wrap items-center gap-2">
      {children}
    </div>
  );
}

export function MainAstUnaryOperatorLine({
  treePath,
  mainAstNode,
  viewOnly,
  root,
}: {
  treePath: string;
  mainAstNode: MainAstUnaryNode;
  viewOnly?: boolean;
  root?: boolean;
}) {
  const { setAstNodeAtPath, setOperatorAtPath } = useAstNodeEditorActions();

  function removeNesting() {
    const nestedChild = mainAstNode.children[0];
    if (!nestedChild) return;
    setAstNodeAtPath(treePath, nestedChild);
  }

  function addRightNesting() {
    setAstNodeAtPath(
      treePath,
      NewUndefinedAstNode({ children: [mainAstNode, NewUndefinedAstNode()] }),
    );
  }

  const operators = useMainAstOperatorFunctions();

  const left = mainAstNode.children[0];
  const leftPath = `${treePath}.children.0`;

  const evaluationErrors = useEvaluationErrors(treePath);

  return (
    <div className="group/nest contents">
      {!root ? (
        <NestingParenthesis
          unary
          removeNesting={removeNesting}
          addRightNesting={addRightNesting}
        >
          (
        </NestingParenthesis>
      ) : null}
      <AstBuilderNode
        treePath={leftPath}
        astNode={left}
        onSave={(astNode) => {
          setAstNodeAtPath(leftPath, astNode);
        }}
        viewOnly={viewOnly}
      />
      <Operator
        value={mainAstNode.name}
        setValue={(operator: (typeof operators)[number]) => {
          setOperatorAtPath(treePath, operator);
        }}
        validationStatus={evaluationErrors.length > 0 ? 'error' : 'valid'}
        viewOnly={viewOnly}
        operators={operators}
      />
      {!root ? (
        <NestingParenthesis
          unary
          removeNesting={removeNesting}
          addRightNesting={addRightNesting}
        >
          )
        </NestingParenthesis>
      ) : null}
    </div>
  );
}

type NestingParenthesisProps = {
  children: React.ReactNode;
  removeNesting: () => void;
  addRightNesting: () => void;
} & ({ unary: true } | { unary?: false; invertOperands: () => void });

const NestingParenthesis = ({
  children,
  removeNesting,
  addRightNesting,
  ...props
}: NestingParenthesisProps) => {
  const { t } = useTranslation(['scenarios']);

  return (
    <MenuRoot>
      <MenuButton
        render={
          <button className="text-grey-00 border-grey-90 [.group\/nest:hover:not(:has(.group\/nest:hover))_>_&]:bg-grey-98 flex h-10 items-center justify-center rounded border px-2" />
        }
      >
        {children}
      </MenuButton>
      <MenuPopover className="flex flex-col gap-2 p-2">
        {!props.unary ? (
          <MenuItem
            onClick={props.invertOperands}
            className="data-[active-item]:bg-purple-98 grid w-full select-none grid-cols-[20px_1fr] gap-1 rounded-sm p-2 outline-none"
          >
            <Icon
              aria-hidden="true"
              className="col-start-1 size-5 shrink-0"
              icon="swap"
            />
            <div className="col-start-2 flex flex-row gap-1 overflow-hidden">
              <div className="text-grey-00 text-s w-full break-all text-start font-normal">
                {t('scenarios:nesting.swap_operands')}
              </div>
            </div>
          </MenuItem>
        ) : null}
        <MenuItem
          onClick={addRightNesting}
          className="data-[active-item]:bg-purple-98 grid w-full select-none grid-cols-[20px_1fr] gap-1 rounded-sm p-2 outline-none"
        >
          <Icon
            aria-hidden="true"
            className="col-start-1 size-5 shrink-0"
            icon="parentheses"
          />
          <div className="col-start-2 flex flex-row gap-1 overflow-hidden">
            <div className="text-grey-00 text-s w-full break-all text-start font-normal">
              {t('scenarios:nesting.add_right_nesting')}
            </div>
          </div>
        </MenuItem>
        <MenuItem
          onClick={removeNesting}
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
        </MenuItem>
      </MenuPopover>
    </MenuRoot>
  );
};
