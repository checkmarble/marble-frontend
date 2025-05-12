import {
  type AstNode,
  type DataType,
  type EnumValue,
  injectIdToNode,
  isUndefinedAstNode,
  NewUndefinedAstNode,
} from '@app-builder/models';
import {
  type EditableAstNode,
  isEditableAstNode,
} from '@app-builder/models/astNode/builder-ast-node';
import { useFormatLanguage } from '@app-builder/utils/format';
import { useCallbackRef } from '@app-builder/utils/hooks';
import type { AstBuilderOperandProps } from '@ast-builder/Operand';
import { AstBuilderDataSharpFactory } from '@ast-builder/Provider';
import {
  OperandDisplayName,
  operandDisplayNameClassnames,
} from '@ast-builder/styles/OperandDisplayName';
import { cva } from 'class-variance-authority';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { createSharpFactory } from 'sharpstate';
import { match } from 'ts-pattern';
import { MenuCommand } from 'ui-design-system';

import { OperandEditModal } from './EditModal/EditModal';
import { EditionEvaluationErrors } from './EvaluationErrors';
import { type EnrichedMenuOption, getOperandMenuOptions } from './helpers';
import { AstBuilderNodeSharpFactory } from './node-store';
import { AstBuilderOperandMenu, type BottomAction } from './OperandMenu';

export const editionOperandLabelClassnames = cva(
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

type EditionOperandStore = {
  enumValues: EnumValue[] | undefined;
  options: EnrichedMenuOption[];
  optionsDataType: DataType[] | ((o: EnrichedMenuOption) => boolean) | undefined;
  coerceDataType: DataType[] | undefined;
};

export const EditionOperandSharpFactory = createSharpFactory({
  name: 'EditionOperand',
  initializer: (initialData: EditionOperandStore) => ({
    ...initialData,
  }),
})
  .withActions({
    setEnumsAndOptions(api, enums: EnumValue[] | undefined, options: EnrichedMenuOption[]) {
      api.batch(() => {
        api.value.enumValues = enums;
        api.value.options = options;
      });
    },
  })
  .withComputed({
    filteredOptions(state) {
      const dataTypes = state.optionsDataType;
      return dataTypes
        ? state.options.filter((o) =>
            typeof dataTypes === 'function' ? dataTypes(o) : dataTypes.includes(o.dataType),
          )
        : state.options;
    },
  });

export function EditionAstBuilderOperand({ onChange, ...props }: AstBuilderOperandProps) {
  const { node } = props;
  const { t } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const nodeSharp = AstBuilderNodeSharpFactory.useOptionalSharp();
  const [editedNode, setEditedNode] = useState<EditableAstNode | null>(null);
  const data = dataSharp.select((s) => s.$data);
  const triggerObjectTable = dataSharp.computed.triggerObjectTable;
  const validationStatus = props.validationStatus;

  const operandSharp = EditionOperandSharpFactory.createSharp({
    enumValues: props.enumValues,
    options: getOperandMenuOptions({
      enums: props.enumValues,
      data: data.value,
      triggerObjectTable: triggerObjectTable.value,
      node,
      language,
      t,
    }),
    optionsDataType: props.optionsDataType,
    coerceDataType: props.coerceDataType,
  });
  const onSelect = useCallbackRef(onChange);
  const onCreateSelect = useCallbackRef((node: AstNode) => {
    if (isEditableAstNode(node)) {
      setEditedNode(node);
    } else {
      onSelect(node);
    }
  });
  const onEditSave = useCallbackRef((node: AstNode) => {
    onSelect(node);
    setEditedNode(null);
  });

  useEffect(() => {
    operandSharp.actions.setEnumsAndOptions(
      props.enumValues,
      getOperandMenuOptions({
        enums: props.enumValues,
        data: data.value,
        triggerObjectTable: triggerObjectTable.value,
        node,
        language,
        t,
      }),
    );
  }, [operandSharp, props.enumValues, data.value, triggerObjectTable.value, node, t, language]);

  const bottomActions: BottomAction[] = [
    ...(!isUndefinedAstNode(node)
      ? ([
          {
            id: 'clean',
            label: t('scenarios:edit_operand.clear_operand'),
            icon: 'restart-alt',
            onSelect: () => onSelect(NewUndefinedAstNode()),
          },
        ] as const)
      : []),
    ...(isEditableAstNode(node)
      ? ([
          {
            id: 'edit',
            label: t('common:edit'),
            icon: 'edit-square',
            onSelect: () => {
              setEditedNode(R.clone(node));
            },
          },
        ] as const)
      : []),
    ...(nodeSharp && !isUndefinedAstNode(node)
      ? [
          {
            id: 'copy',
            label: t('common:copy'),
            icon: 'copy',
            onSelect: () => {
              nodeSharp.actions.copyNode(node);
            },
          } as const,
        ]
      : []),
    ...(nodeSharp?.value.copiedNode
      ? [
          {
            id: 'paste',
            label: t('common:paste'),
            icon: 'paste',
            onSelect: () => {
              if (nodeSharp.value.copiedNode) {
                onSelect(injectIdToNode(nodeSharp.value.copiedNode));
              }
            },
          } as const,
        ]
      : []),
  ];

  return (
    <EditionOperandSharpFactory.Provider value={operandSharp}>
      <div className="inline-flex flex-col gap-2 self-start">
        <AstBuilderOperandMenu onSelect={onCreateSelect} bottomActions={bottomActions}>
          <MenuCommand.Trigger>
            <button type="button" className={editionOperandLabelClassnames({ validationStatus })}>
              {match(node)
                .when(isUndefinedAstNode, () => (
                  <span
                    className={operandDisplayNameClassnames({
                      type: 'placeholder',
                    })}
                  >
                    {props.placeholder ?? t('scenarios:edit_operand.placeholder')}
                  </span>
                ))
                .otherwise(() => (
                  <OperandDisplayName interactionMode="editor" {...props} />
                ))}
              <MenuCommand.Arrow />
            </button>
          </MenuCommand.Trigger>
        </AstBuilderOperandMenu>
        {editedNode ? (
          <OperandEditModal
            node={editedNode}
            onSave={onEditSave}
            onCancel={() => setEditedNode(null)}
          />
        ) : null}
        {props.showErrors ? <EditionEvaluationErrors id={node.id} /> : null}
      </div>
    </EditionOperandSharpFactory.Provider>
  );
}
