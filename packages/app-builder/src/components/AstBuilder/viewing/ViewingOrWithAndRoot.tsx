import { type AstNode } from '@app-builder/models';
import { type AndAstNode, type OrWithAndAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { type FlatAstValidation } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/validate-ast';
import { AstBuilderDataSharpFactory } from '@ast-builder/Provider';
import { LogicalOperatorLabel } from '@ast-builder/styles/LogicalOperatorLabel';
import { type AstBuilderRootProps } from '@ast-builder/types';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, type TagProps } from 'ui-design-system';

import { adaptBooleanOrNullReturnValue } from './helpers';
import { ViewingEvaluationErrors } from './ViewingEvaluationErrors';
import { ViewingAstBuilderNode } from './ViewingNode';

type ViewingAstBuilderOrWithAndRootProps = Omit<AstBuilderRootProps<OrWithAndAstNode>, 'onStoreInit'>;
export function ViewingAstBuilderOrWithAndRoot(props: ViewingAstBuilderOrWithAndRootProps) {
  const validation = useMemo(() => props.validation ?? { errors: [], evaluation: [] }, [props.validation]);

  return (
    <div className="grid grid-cols-[40px_1fr_max-content] gap-2">
      {props.node.children.map((child, i) => {
        return (
          <ViewingRootOrGroup
            key={child.id}
            isFirst={i === 0}
            path={`root.children.${i}`}
            node={child}
            validation={validation}
          />
        );
      })}
      <ViewingEvaluationErrors direct id={props.node.id} evaluation={validation.evaluation} className="col-span-3" />
    </div>
  );
}

type ViewingRootOrGroupProps = {
  isFirst: boolean;
  path: string;
  node: AndAstNode;
  validation: FlatAstValidation;
};
function ViewingRootOrGroup({ isFirst, path, node, validation }: ViewingRootOrGroupProps) {
  return (
    <>
      {!isFirst ? (
        <>
          <LogicalOperatorLabel operator="or" className="uppercase" type="contained" />
          <div className="col-span-2 flex flex-1 items-center">
            <div className="bg-grey-90 h-px w-full" />
          </div>
        </>
      ) : null}
      {node.children.map((child, i) => {
        return (
          <ViewingRootOrWithAndLine
            key={child.id}
            isFirst={i === 0}
            path={`${path}.children.${i}`}
            node={child}
            validation={validation}
          />
        );
      })}
      <ViewingEvaluationErrors
        direct
        id={node.id}
        evaluation={validation.evaluation}
        className="col-span-2 col-start-2"
      />
    </>
  );
}

type ViewingRootAndLineProps = {
  isFirst: boolean;
  path: string;
  node: AstNode;
  validation: FlatAstValidation;
};
function ViewingRootOrWithAndLine({ isFirst, path, node, validation }: ViewingRootAndLineProps) {
  const { t } = useTranslation(['common']);
  const showValues = AstBuilderDataSharpFactory.select((s) => s.showValues);
  const directEvaluation = validation.evaluation.find((e) => e.nodeId === node.id);

  let rightComponent = null;
  if (showValues && directEvaluation) {
    const hasDirectError = directEvaluation.errors.length ?? 0 > 0;
    const isOmitted = directEvaluation.returnValue.isOmitted;
    if (!hasDirectError && !isOmitted) {
      const adaptedValue = adaptBooleanOrNullReturnValue(directEvaluation.returnValue);
      if (adaptedValue.isBooleanOrNull) {
        const { value } = adaptedValue;
        const tKey = value === null ? 'null' : value;
        let color: TagProps['color'] = 'red';
        if (directEvaluation.skipped) {
          color = 'grey';
        } else if (value === null) {
          color = 'orange';
        } else if (value) {
          color = 'green';
        }

        rightComponent = (
          <div className="flex h-10 items-center justify-center">
            <Tag border="square" className="w-full" color={color}>
              {t(`common:${directEvaluation.skipped ? 'skipped' : tKey}`)}
            </Tag>
          </div>
        );
      }
    }
  }

  return (
    <>
      <LogicalOperatorLabel operator={isFirst ? 'if' : 'and'} type="text" />

      <div className={clsx('flex flex-col gap-2', rightComponent === null && 'col-span-2')}>
        <ViewingAstBuilderNode root path={path} node={node} validation={validation} />
        <ViewingEvaluationErrors id={node.id} evaluation={validation.evaluation} />
      </div>
      {rightComponent}
    </>
  );
}
