import {
  type AstNode,
  type EnumValue,
  findDataModelTableByName,
  isUndefinedAstNode,
} from '@app-builder/models';
import { type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { isConstant } from '@app-builder/models/astNode/constant';
import {
  type CustomListAccessAstNode,
  isCustomListAccess,
} from '@app-builder/models/astNode/custom-list';
import {
  type DatabaseAccessAstNode,
  isDatabaseAccess,
  isPayload,
  type PayloadAstNode,
} from '@app-builder/models/astNode/data-accessor';
import { formatConstant } from '@app-builder/services/ast-node/formatConstant';
import { getAstNodeDataType } from '@app-builder/services/ast-node/getAstNodeDataType';
import { getAstNodeOperandType } from '@app-builder/services/ast-node/getAstNodeOperandType';
import { useFormatLanguage } from '@app-builder/utils/format';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { cva } from 'class-variance-authority';
import { forwardRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { createSharpFactory } from 'sharpstate';
import { match } from 'ts-pattern';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { type AstBuilderOperandProps } from '../Operand';
import { OperandTypeInfos } from '../OperandTypeInfos';
import { AstBuilderDataSharpFactory } from '../Provider';
import { type AstBuilderBaseProps, type AstNodeStringifierContext } from '../types';
import { type EnrichedMenuOption, getOperandMenuOptions } from './helpers';
import { AstBuilderOperandMenu } from './OperandMenu';

type InternalOperandStore = {
  enumValues: EnumValue[] | undefined;
  options: EnrichedMenuOption[];
};

export const InternalOperandSharpFactory = createSharpFactory({
  name: 'InternalOperand',
  initializer: (initialData: InternalOperandStore) => ({
    ...initialData,
  }),
}).withActions({
  setEnumsAndOptions(api, enums: EnumValue[] | undefined, options: EnrichedMenuOption[]) {
    api.batch(() => {
      api.value.enumValues = enums;
      api.value.options = options;
    });
  },
  updateNodeAtPath(_api, path: string, newNode: AstNode) {
    console.log(path, newNode);
  },
});

const operandLabelClassnames = cva(
  [
    'group',
    'size-fit min-h-10 min-w-10 rounded outline-none',
    'flex flex-row items-center justify-between gap-2 px-2',
    'bg-grey-100 aria-expanded:bg-purple-98 aria-expanded:border-purple-65',
  ],
  {
    variants: {
      validationStatus: {
        valid: 'border enabled:border-grey-90 enabled:aria-[expanded=false]:focus:border-purple-65',
        error: 'border enabled:border-red-47 enabled:aria-[expanded=false]:focus:border-purple-65',
        'light-error':
          'border enabled:border-red-87 enabled:aria-[expanded=false]:focus:border-purple-65',
      },
    },
    defaultVariants: {
      validationStatus: 'valid',
    },
  },
);

const operandDisplayNameClassnames = cva(
  'text-s font-medium group-aria-expanded:text-purple-65 break-all max-w-[300px] truncate',
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

export function Internal_EditionAstBuilderOperand({ onChange, ...props }: AstBuilderOperandProps) {
  const { t } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();
  const data = AstBuilderDataSharpFactory.useSharp().value.$data!.value;

  const operandSharp = InternalOperandSharpFactory.createSharp({
    enumValues: props.enumValues,
    options: getOperandMenuOptions(props.enumValues, data, props.node, language, t),
  });
  const onSelect = useCallbackRef(onChange);

  useEffect(() => {
    operandSharp.actions.setEnumsAndOptions(
      props.enumValues,
      getOperandMenuOptions(props.enumValues, data, props.node, language, t),
    );
  }, [operandSharp, props.enumValues, data, props.node, t, language]);

  return (
    <InternalOperandSharpFactory.Provider value={operandSharp}>
      <AstBuilderOperandMenu onSelect={onSelect}>
        <MenuCommand.Trigger>
          <OperandLabel {...props} />
        </MenuCommand.Trigger>
      </AstBuilderOperandMenu>
    </InternalOperandSharpFactory.Provider>
  );
}

type OperandLabelProps = Omit<AstBuilderBaseProps<KnownOperandAstNode>, 'onChange'> & {
  enumValues?: EnumValue[];
  placeholder?: string;
};
const OperandLabel = forwardRef<HTMLButtonElement, OperandLabelProps>(function OperandLabel(
  { node, placeholder, enumValues, ...props },
  ref,
) {
  const { t } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();
  const data = AstBuilderDataSharpFactory.useSharp().value.$data!.value;
  const triggerObjectTable = findDataModelTableByName({
    dataModel: data.dataModel,
    tableName: data.triggerObjectType,
  });

  const displayName = getOperandDisplayName(node, {
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

  return (
    <button
      ref={ref}
      type="button"
      className={operandLabelClassnames({ validationStatus: 'valid' })}
      {...props}
    >
      {match(node)
        .when(isUndefinedAstNode, () => (
          <span
            className={operandDisplayNameClassnames({
              type: 'placeholder',
            })}
          >
            {placeholder ?? t('scenarios:edit_operand.placeholder')}
          </span>
        ))
        .otherwise(() => (
          <>
            <OperandTypeInfos t={t} dataType={dataType} operandType={operandType} />
            <span className={operandDisplayNameClassnames()}>{displayName}</span>
            <Icon
              icon="tip"
              className="group-hover:hover:text-purple-65 group-hover:text-purple-82 size-5 shrink-0 text-transparent"
            />
          </>
        ))}
      <MenuCommand.Arrow />
    </button>
  );
});

function getOperandDisplayName(node: KnownOperandAstNode, ctx: AstNodeStringifierContext): string {
  return match(node)
    .when(isConstant, (n) => formatConstant(n.constant, ctx))
    .when(isCustomListAccess, (n) => getCustomListDisplayName(n, ctx))
    .when(isDatabaseAccess, (n) => getDatabaseAccessDisplayName(n))
    .when(isPayload, (n) => getPayloadDisplayName(n))
    .otherwise((n) => n.name);
}

function getCustomListDisplayName(node: CustomListAccessAstNode, ctx: AstNodeStringifierContext) {
  const listId = node.namedChildren.customListId.constant;
  const customListAccess = R.pipe(
    ctx.customLists,
    R.find(({ id }) => id === listId),
  );

  return customListAccess?.name ?? ctx.t('scenarios:custom_list.unknown');
}

function getDatabaseAccessDisplayName(node: DatabaseAccessAstNode) {
  const { path, fieldName } = node.namedChildren;
  return [...path.constant, fieldName.constant].join('.');
}

function getPayloadDisplayName(node: PayloadAstNode) {
  return node.children[0].constant;
}
