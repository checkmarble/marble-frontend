import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import {
  type AstNodeViewModel,
  isTwoLineOperandAstNodeViewModel,
  type TwoLineOperandAstNodeViewModel,
} from '@app-builder/models/ast-node-view-model';
import { useTwoLineOperandOperatorFunctions } from '@app-builder/services/editor/options';
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
  setOperand,
  setOperator,
  twoOperandsViewModel,
  viewOnly,
  root,
}: {
  setOperand: (nodeId: string, operandAst: AstNode) => void;
  setOperator: (nodeId: string, name: string) => void;
  twoOperandsViewModel: TwoLineOperandAstNodeViewModel;
  viewOnly?: boolean;
  root?: boolean;
}) {
  const { t } = useTranslation(['scenarios']);
  function addNestedChild(child: AstNodeViewModel) {
    setOperand(child.nodeId, NewNestedChild(child));
  }

  function removeNestedChild(child: AstNodeViewModel) {
    const nestedChild = child.children[0];
    if (!nestedChild) return;
    setOperand(child.nodeId, nestedChild);
  }

  const operators = useTwoLineOperandOperatorFunctions();

  const left = twoOperandsViewModel.children[0];
  const right = twoOperandsViewModel.children[1];

  const isNestedRight = isTwoLineOperandAstNodeViewModel(right);

  return (
    <div className="flex justify-between gap-2">
      <div className="flex flex-row flex-wrap items-center gap-2">
        {!root ? <span className="text-grey-25">(</span> : null}
        <AstBuilderNode
          setOperand={setOperand}
          setOperator={setOperator}
          astNodeVM={left}
          onSave={(astNode) => {
            setOperand(left.nodeId, astNode);
          }}
          viewOnly={viewOnly}
        />
        <Operator
          value={twoOperandsViewModel.name}
          setValue={(operator: (typeof operators)[number]) => {
            setOperator(twoOperandsViewModel.nodeId, operator);
          }}
          validationStatus={
            twoOperandsViewModel.errors?.length > 0 ? 'error' : 'valid'
          }
          viewOnly={viewOnly}
          operators={operators}
        />
        <AstBuilderNode
          setOperand={setOperand}
          setOperator={setOperator}
          astNodeVM={right}
          onSave={(astNode) => {
            setOperand(right.nodeId, astNode);
          }}
          viewOnly={viewOnly}
        />
        {!root ? <span className="text-grey-25">)</span> : null}
      </div>
      {root && !viewOnly ? (
        <div className="flex h-10 items-center gap-2">
          <label className="text-s" htmlFor="nest">
            {t('scenarios:nest')}
          </label>
          <Switch
            id="nest"
            checked={isNestedRight}
            onCheckedChange={(checked) =>
              checked ? addNestedChild(right) : removeNestedChild(right)
            }
          />
        </div>
      ) : null}
    </div>
  );
}
