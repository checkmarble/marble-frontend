import { type IdLessAstNode } from '@app-builder/models';
import { type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { getAstNodeDataType } from '@app-builder/services/ast-node/getAstNodeDataType';
import { getAstNodeDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';
import { getAstNodeOperandType } from '@app-builder/services/ast-node/getAstNodeOperandType';
import { useFormatLanguage } from '@app-builder/utils/format';
import { cva } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';

import { type AstBuilderOperandProps } from '../Operand';
import { OperandInfos } from '../OperandInfos';
import { OperandTypeInfos, type OperandTypeVariantProps } from '../OperandTypeInfos';
import { AstBuilderDataSharpFactory } from '../Provider';

export const operandDisplayNameClassnames = cva(
  'text-s font-medium group-aria-expanded:text-purple-65 break-all max-w-[200px] @xl:max-w-[300px] truncate',
  {
    variants: {
      type: {
        placeholder: 'text-grey-80',
        value: 'text-grey-00',
      },
    },
    defaultVariants: {
      type: 'value',
    },
  },
);

type OperandDisplayNameProps = Omit<AstBuilderOperandProps, 'onChange' | 'node'> & {
  node: IdLessAstNode<KnownOperandAstNode>;
} & OperandTypeVariantProps;
export function OperandDisplayName({
  node,
  enumValues,
  interactionMode,
  returnValue,
}: OperandDisplayNameProps) {
  const { t } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const data = dataSharp.select((s) => s.data);
  const showValues = dataSharp.select((s) => s.showValues);
  const triggerObjectTable = dataSharp.computed.triggerObjectTable.value;
  const shouldDisplayReturnValue = showValues && returnValue !== undefined;

  const displayName = getAstNodeDisplayName(node, {
    t,
    language,
    customLists: data.customLists,
  });
  const dataType = getAstNodeDataType(node, {
    triggerObjectTable,
    dataModel: data.dataModel,
  });
  const operandType = getAstNodeOperandType(node, {
    enumValues,
  });

  return shouldDisplayReturnValue ? (
    <>
      <span className={operandDisplayNameClassnames()}>{returnValue}</span>
      <OperandInfos
        dataType={dataType}
        displayName={displayName}
        node={node}
        operandType={operandType}
      />
    </>
  ) : (
    <>
      <OperandTypeInfos
        interactionMode={interactionMode}
        t={t}
        dataType={dataType}
        operandType={operandType}
      />
      <span className={operandDisplayNameClassnames()}>{displayName}</span>
      <OperandInfos
        dataType={dataType}
        displayName={displayName}
        node={node}
        operandType={operandType}
      />
    </>
  );
}
