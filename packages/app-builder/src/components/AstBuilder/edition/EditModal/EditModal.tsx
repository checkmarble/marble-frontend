import {
  isAggregation,
  isFuzzyMatchFilterOptionsAstNode,
} from '@app-builder/models/astNode/aggregation';
import { type EditableAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { isIsMultipleOf } from '@app-builder/models/astNode/multiple-of';
import {
  isFuzzyMatchComparator,
  isStringTemplateAstNode,
} from '@app-builder/models/astNode/strings';
import { isTimeAdd, isTimestampExtract } from '@app-builder/models/astNode/time';
import { type ParseKeys } from 'i18next';
import { type ComponentType } from 'react';
import { match } from 'ts-pattern';

import { getEvaluationForNode } from '../helpers';
import { useRoot } from '../hooks/useRoot';
import { AstBuilderNodeSharpFactory } from '../node-store';
import { EditAggregation } from './modals/Aggregation/Aggregation';
import { EditFuzzyMatchAggregation } from './modals/FuzzyMatchComparator/FuzzyMatchAggregation';
import { EditFuzzyMatchComparator } from './modals/FuzzyMatchComparator/FuzzyMatchComparator';
import { EditIsMultipleOf } from './modals/IsMultipleOf/IsMultipleOf';
import { EditStringTemplate } from './modals/StringTemplate/StringTemplate';
import { EditTimeAdd } from './modals/TimeAdd/TimeAdd';
import { EditTimestampExtract } from './modals/TimestampExtract/TimestampExtract';

export type EditModalContent = {
  titleTKey: ParseKeys<['scenarios']>;
  Content: ComponentType;
  size?: 'small' | 'medium' | 'large';
};

export type OperandEditModalProps = {
  onSave: (node: EditableAstNode) => void;
  onCancel: () => void;
  node: EditableAstNode;
};

export function OperandEditModal({ node, ...props }: OperandEditModalProps) {
  const validation = AstBuilderNodeSharpFactory.useOptionalSharp()?.select((s) => s.validation);
  const nodeSharp = useRoot(
    {
      node,
      validation: {
        errors: [],
        evaluation: getEvaluationForNode(validation?.evaluation ?? [], node.id),
      },
    },
    false,
  );

  return (
    <AstBuilderNodeSharpFactory.Provider value={nodeSharp}>
      {match(node)
        .when(isIsMultipleOf, () => <EditIsMultipleOf {...props} />)
        .when(isTimeAdd, () => <EditTimeAdd {...props} />)
        .when(isTimestampExtract, () => <EditTimestampExtract {...props} />)
        .when(isFuzzyMatchComparator, () => <EditFuzzyMatchComparator {...props} />)
        .when(isAggregation, () => <EditAggregation {...props} />)
        .when(isStringTemplateAstNode, () => <EditStringTemplate {...props} />)
        .when(isFuzzyMatchFilterOptionsAstNode, () => <EditFuzzyMatchAggregation {...props} />)
        .exhaustive()}
    </AstBuilderNodeSharpFactory.Provider>
  );
}
