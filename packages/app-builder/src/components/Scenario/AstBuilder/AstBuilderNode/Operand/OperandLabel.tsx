import {
  type AstNode,
  type DataType,
  getDataTypeIcon,
  getDataTypeTKey,
  isUndefinedAstNode,
} from '@app-builder/models';
import {
  getOperandTypeIcon,
  getOperandTypeTKey,
  type OperandType,
} from '@app-builder/models/operand-type';
import { useDisplayReturnValues } from '@app-builder/services/editor/return-value';
import * as Ariakit from '@ariakit/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

import { OperandInfos } from './OperandInfos';

const operandContainerClassnames = cva(
  [
    'group',
    'size-fit min-h-[40px] min-w-[40px] rounded outline-none',
    'flex flex-row items-center justify-between gap-2 px-2',
  ],
  {
    variants: {
      interactionMode: {
        viewer: 'bg-grey-98',
        editor: 'bg-grey-100 aria-expanded:bg-purple-98 aria-expanded:border-purple-65',
      },
      validationStatus: {
        valid: '',
        error: '',
        'light-error': '',
      },
    },
    compoundVariants: [
      // editor cases
      {
        interactionMode: 'editor',
        validationStatus: 'valid',
        className:
          'border enabled:aria-[expanded=false]:border-grey-90 enabled:aria-[expanded=false]:focus:border-purple-65',
      },
      {
        interactionMode: 'editor',
        validationStatus: 'error',
        className:
          'border enabled:aria-[expanded=false]:border-red-47 enabled:aria-[expanded=false]:focus:border-purple-65',
      },
      {
        interactionMode: 'editor',
        validationStatus: 'light-error',
        className:
          'border enabled:aria-[expanded=false]:border-red-87 enabled:aria-[expanded=false]:focus:border-purple-65',
      },
      // viewer cases
      {
        interactionMode: 'viewer',
        validationStatus: 'valid',
        className: 'border border-grey-98',
      },
      {
        interactionMode: 'viewer',
        validationStatus: 'error',
        className: 'border border-red-47',
      },
      {
        interactionMode: 'viewer',
        validationStatus: 'light-error',
        className: 'border border-red-87',
      },
    ],
    defaultVariants: {
      interactionMode: 'viewer',
      validationStatus: 'valid',
    },
  },
);

interface OperandLabelProps extends VariantProps<typeof operandContainerClassnames> {
  astNode: AstNode;
  dataType: DataType;
  operandType: OperandType;
  displayName: string;
  placeholder?: string;
  returnValue?: string;
}

// TODO: split this comp in separate components for use in Editor, Viewer and ReturnValues
export const OperandLabel = forwardRef<HTMLDivElement, OperandLabelProps>(function OperandLabel(
  {
    astNode,
    placeholder,
    interactionMode,
    returnValue,
    dataType,
    operandType,
    displayName,
    validationStatus,
    ...props
  },
  ref,
) {
  const { t } = useTranslation(['scenarios']);

  const shouldDisplayPlaceholder = isUndefinedAstNode(astNode);
  const [displayReturnValues] = useDisplayReturnValues();
  const shouldDisplayReturnValue = displayReturnValues && returnValue !== undefined;

  let children;
  if (shouldDisplayPlaceholder) {
    children = (
      <span
        className={operandDisplayName({
          type: 'placeholder',
        })}
      >
        {placeholder ?? t('scenarios:edit_operand.placeholder')}
      </span>
    );
  } else if (shouldDisplayReturnValue) {
    children = (
      <>
        <span className={operandDisplayName()}>{returnValue}</span>
        <OperandInfos
          gutter={16}
          shift={-16}
          className="group-hover:hover:text-purple-65 group-hover:text-purple-82 size-5 shrink-0 text-transparent transition-colors"
          astNode={astNode}
          dataType={dataType}
          operandType={operandType}
          displayName={displayName}
        />
      </>
    );
  } else {
    children = (
      <>
        <TypeInfos
          interactionMode={interactionMode}
          operandType={operandType}
          dataType={dataType}
        />
        <span className={operandDisplayName()}>{displayName}</span>
        <OperandInfos
          gutter={16}
          shift={-16}
          className="group-hover:hover:text-purple-65 group-hover:text-purple-82 size-5 shrink-0 text-transparent transition-colors"
          astNode={astNode}
          dataType={dataType}
          operandType={operandType}
          displayName={displayName}
        />
      </>
    );
  }

  return (
    <Ariakit.Role
      ref={ref}
      {...props}
      className={operandContainerClassnames({
        interactionMode,
        validationStatus,
      })}
      render={interactionMode === 'editor' ? <button /> : <div />}
    >
      {children}
    </Ariakit.Role>
  );
});

const typeInfosClassnames = cva('flex items-center justify-center rounded-sm p-1 text-grey-00', {
  variants: {
    interactionMode: {
      viewer: 'bg-grey-90',
      editor: 'bg-grey-98 group-aria-expanded:bg-purple-96 group-aria-expanded:text-purple-65',
    },
  },
});

interface TypeInfosProps extends VariantProps<typeof typeInfosClassnames> {
  operandType: OperandType;
  dataType: DataType;
}

function TypeInfos({ operandType, dataType, interactionMode }: TypeInfosProps) {
  const { t } = useTranslation('scenarios');
  const typeInfos = [
    {
      icon: getOperandTypeIcon(operandType),
      tKey: getOperandTypeTKey(operandType),
    },
    {
      icon: getDataTypeIcon(dataType),
      tKey: getDataTypeTKey(dataType),
    },
  ];

  if (typeInfos.filter(({ icon }) => icon !== undefined).length === 0) return null;

  return (
    <div className="flex flex-row gap-1">
      {typeInfos.map(({ icon, tKey }) => {
        if (!icon) return null;
        return (
          <div key={tKey} className={typeInfosClassnames({ interactionMode })}>
            <Icon icon={icon} className="size-4 shrink-0" aria-label={tKey ? t(tKey) : undefined} />
          </div>
        );
      })}
    </div>
  );
}

const operandDisplayName = cva('text-s font-medium group-aria-expanded:text-purple-65 break-all', {
  variants: {
    type: {
      placeholder: 'text-grey-80',
      value: 'text-grey-00',
    },
  },
  defaultVariants: {
    type: 'value',
  },
});
