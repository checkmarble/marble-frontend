import {
  type AstNode,
  isTwoLineOperandAstNode,
  NewUndefinedAstNode,
  type TwoLineOperandAstNode,
} from '@app-builder/models';
import {
  useAstNodeEditorActions,
  useEvaluationErrors,
} from '@app-builder/services/editor/ast-editor';
import { useTwoLineOperandOperatorFunctions } from '@app-builder/services/editor/options';
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

export function TwoOperandsLine({
  path,
  twoLineOperandAstNode,
  viewOnly,
  root,
}: {
  path: string;
  twoLineOperandAstNode: TwoLineOperandAstNode;
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

  const operators = useTwoLineOperandOperatorFunctions();

  const left = twoLineOperandAstNode.children[0];
  const leftPath = `${path}.children.0`;
  const right = twoLineOperandAstNode.children[1];
  const rightPath = `${path}.children.1`;

  const isNestedRight = isTwoLineOperandAstNode(right);

  const evaluationErrors = useEvaluationErrors(path);

  return (
    <div className="flex justify-between gap-2">
      <div className="flex flex-row flex-wrap items-center gap-2">
        {!root ? <span className="text-grey-25">(</span> : null}
        <AstBuilderNode
          path={leftPath}
          astNode={left}
          onSave={(astNode) => {
            setAstNodeAtPath(leftPath, astNode);
          }}
          viewOnly={viewOnly}
        />
        <Operator
          value={twoLineOperandAstNode.name}
          setValue={(operator: (typeof operators)[number]) => {
            setOperatorAtPath(path, operator);
          }}
          validationStatus={evaluationErrors.length > 0 ? 'error' : 'valid'}
          viewOnly={viewOnly}
          operators={operators}
        />
        <AstBuilderNode
          path={rightPath}
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
