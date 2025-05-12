import {
  type AstNode,
  type DataType,
  type IdLessAstNode,
  NewUndefinedAstNode,
} from '@app-builder/models';
import { NewAggregatorAstNode } from '@app-builder/models/astNode/aggregation';
import { NewIsMultipleOfAstNode } from '@app-builder/models/astNode/multiple-of';
import { NewFuzzyMatchComparatorAstNode } from '@app-builder/models/astNode/strings';
import {
  NewTimeAddAstNode,
  NewTimeNowAstNode,
  NewTimestampExtractAstNode,
} from '@app-builder/models/astNode/time';
import { ComparatorFuzzyMatchConfig } from '@app-builder/models/fuzzy-match/comparatorFuzzyMatchConfig';
import { aggregatorOperators } from '@app-builder/models/modale-operators';
import type { OperandType } from '@app-builder/models/operand-type';
import type { TFunction } from 'i18next';
import type { IconName } from 'ui-icons';

export type OperandMenuOption = {
  astNode: IdLessAstNode;
  displayName?: string;
  operandType?: OperandType;
  dataType?: DataType;
  icon?: IconName;
};
const fuzzyMatchConfig = ComparatorFuzzyMatchConfig;

const FUNCTIONS_OPTIONS: OperandMenuOption[] = [
  NewFuzzyMatchComparatorAstNode({ funcName: 'FuzzyMatch', config: fuzzyMatchConfig }),
  NewTimeAddAstNode(),
  NewTimestampExtractAstNode(),
  NewTimeNowAstNode(),
  NewIsMultipleOfAstNode(),
].map((n) => ({ astNode: n }));

export const MODELING_OPTIONS = ({
  currentNode,
  t,
}: {
  currentNode: AstNode;
  t: TFunction<['common', 'scenarios'], undefined>;
}) =>
  [
    {
      astNode: NewUndefinedAstNode({
        children: [currentNode, NewUndefinedAstNode()],
      }),
      dataType: 'unknown',
      operandType: 'Modeling',
      displayName: t('scenarios:edit_operand.modeling.open_nesting'),
      // searchShortcut: '(',
      icon: 'parentheses',
    },
  ] satisfies OperandMenuOption[];

export const AST_BUILDER_STATIC_OPTIONS: OperandMenuOption[] = [
  ...aggregatorOperators.map((operator) => ({
    astNode: NewAggregatorAstNode(operator),
  })),
  ...FUNCTIONS_OPTIONS,
];
