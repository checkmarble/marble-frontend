import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import {
  isMainAstBinaryNode,
  isMainAstUnaryNode,
  type MainAstBinaryNode,
  type MainAstUnaryNode,
} from '@app-builder/models/astNode/builder-ast-node';
import {
  useAstNodeEditorActions,
  useEvaluationErrors,
} from '@app-builder/services/editor/ast-editor';
import { useMainAstOperatorFunctions } from '@app-builder/services/editor/options';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from 'ui-design-system';

import { AstBuilderNode } from './AstBuilderNode';
import { Operator } from './Operator';

function NewNestedChild(node: AstNode) {
  return NewUndefinedAstNode({
    children: [node, NewUndefinedAstNode()],
  });
}

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

  function addNestedChild(stringPath: string, child: AstNode) {
    setAstNodeAtPath(stringPath, NewNestedChild(child));
  }

  function removeNestedChild(stringPath: string, child: AstNode) {
    const nestedChild = child.children[0];
    if (!nestedChild) return;
    setAstNodeAtPath(stringPath, nestedChild);
  }

  const operators = useMainAstOperatorFunctions();

  const left = mainAstNode.children[0];
  const leftPath = `${treePath}.children.0`;
  const right = mainAstNode.children[1];
  const rightPath = `${treePath}.children.1`;

  const isNestedRight = isMainAstUnaryNode(right) || isMainAstBinaryNode(right);

  const evaluationErrors = useEvaluationErrors(treePath);

  return (
    <div className="flex justify-between gap-2">
      <div className="flex flex-row flex-wrap items-center gap-2">
        {!root ? <span className="text-grey-25">(</span> : null}
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
        {!root ? <span className="text-grey-25">)</span> : null}
      </div>
      {root && !viewOnly ? (
        <NestSwitch
          checked={isNestedRight}
          onCheckedChange={(checked) => {
            if (checked) addNestedChild(rightPath, right);
            else removeNestedChild(rightPath, right);
          }}
        />
      ) : null}
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

  const operators = useMainAstOperatorFunctions();

  const left = mainAstNode.children[0];
  const leftPath = `${treePath}.children.0`;

  const evaluationErrors = useEvaluationErrors(treePath);

  return (
    <div className="flex justify-between gap-2">
      <div className="flex flex-row flex-wrap items-center gap-2">
        {!root ? <span className="text-grey-25">(</span> : null}
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
        {!root ? <span className="text-grey-25">)</span> : null}
      </div>
    </div>
  );
}

function NestSwitch({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const { t } = useTranslation(['scenarios']);
  const id = React.useId();
  return (
    <div className="flex h-10 items-center gap-2">
      <label className="text-s" htmlFor={id}>
        {t('scenarios:nest')}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
