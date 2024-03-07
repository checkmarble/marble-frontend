import { type LabelledAst } from '@app-builder/models';
import * as Ariakit from '@ariakit/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

import { OperandDescription, OperandInfos } from './OperandInfos';
import {
  getDataTypeIcon,
  getDataTypeTKey,
  getOperatorTypeIcon,
  getOperatorTypeTKey,
} from './utils';

const operandContainerClassnames = cva(
  [
    'group',
    'size-fit min-h-[40px] min-w-[40px] rounded outline-none',
    'flex flex-row items-center justify-between gap-2 px-2',
  ],
  {
    variants: {
      type: {
        view: 'bg-grey-02',
        edit: 'bg-grey-00 aria-expanded:bg-purple-05 aria-expanded:border-purple-100',
      },
      borderColor: {
        'grey-10':
          'border enabled:aria-[expanded=false]:border-grey-10 enabled:aria-[expanded=false]:focus:border-purple-100',
        'red-100':
          'border enabled:aria-[expanded=false]:border-red-100 enabled:aria-[expanded=false]:focus:border-purple-100',
        'red-25':
          'border enabled:aria-[expanded=false]:border-red-25 enabled:aria-[expanded=false]:focus:border-purple-100',
      },
    },
  },
);

interface OperandLabelProps
  extends VariantProps<typeof operandContainerClassnames> {
  operandLabelledAst: LabelledAst;
  tooltipContent?: React.ReactNode;
  placeholder?: string;
}

export const OperandLabel = forwardRef<HTMLDivElement, OperandLabelProps>(
  function OperandLabel(
    {
      operandLabelledAst,
      tooltipContent,
      borderColor,
      placeholder,
      type,
      ...props
    },
    ref,
  ) {
    const displayPlaceholder = !operandLabelledAst.name && !!placeholder;

    return (
      <Ariakit.Role
        ref={ref}
        {...props}
        className={operandContainerClassnames({
          type,
          borderColor,
        })}
        render={(props) =>
          type === 'edit' ? <button {...props} /> : <div {...props} />
        }
      >
        {displayPlaceholder ? (
          <span
            className={selectDisplayText({
              type: 'placeholder',
              size: placeholder.length > 20 ? 'long' : 'short',
            })}
          >
            {placeholder}
          </span>
        ) : (
          <>
            <TypeInfos
              type={type}
              operandType={operandLabelledAst.operandType}
              dataType={operandLabelledAst.dataType}
            />
            <span
              className={selectDisplayText({
                type: 'value',
                size: operandLabelledAst.name.length > 20 ? 'long' : 'short',
              })}
            >
              {operandLabelledAst.name}
            </span>
            <OperandInfos
              gutter={16}
              shift={-16}
              className="size-5 shrink-0 text-transparent transition-colors group-hover:text-purple-50 group-hover:hover:text-purple-100"
            >
              {tooltipContent ? (
                tooltipContent
              ) : (
                <OperandDescription
                  operand={{
                    name: operandLabelledAst.name,
                    operandType: operandLabelledAst.operandType,
                    dataType: operandLabelledAst.dataType,
                    description: operandLabelledAst.description,
                    values: operandLabelledAst.values,
                  }}
                />
              )}
            </OperandInfos>
          </>
        )}
      </Ariakit.Role>
    );
  },
);

const typeInfosClassnames = cva(
  'flex items-center justify-center rounded-sm p-1 text-grey-100',
  {
    variants: {
      type: {
        view: 'bg-grey-10',
        edit: 'bg-grey-02 group-aria-expanded:bg-purple-10 group-aria-expanded:text-purple-100',
      },
    },
  },
);

interface TypeInfosProps extends VariantProps<typeof typeInfosClassnames> {
  operandType: LabelledAst['operandType'];
  dataType: LabelledAst['dataType'];
}

export function TypeInfos({ operandType, dataType, type }: TypeInfosProps) {
  const { t } = useTranslation('scenarios');
  const typeInfos = [
    {
      icon: getOperatorTypeIcon(operandType),
      tKey: getOperatorTypeTKey(operandType),
    },
    {
      icon: getDataTypeIcon(dataType),
      tKey: getDataTypeTKey(dataType),
    },
  ];

  if (typeInfos.filter(({ icon }) => icon !== undefined).length === 0)
    return null;

  return (
    <div className="flex flex-row gap-1">
      {typeInfos.map(({ icon, tKey }) => {
        if (!icon) return null;
        return (
          <div key={tKey} className={typeInfosClassnames({ type })}>
            <Icon
              icon={icon}
              className="size-4 shrink-0"
              aria-label={tKey ? t(tKey) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}

const selectDisplayText = cva(
  'text-s font-medium group-aria-expanded:text-purple-100',
  {
    variants: {
      type: {
        placeholder: 'text-grey-25',
        value: 'text-grey-100',
      },
      size: {
        long: 'hyphens-auto [overflow-wrap:anywhere]',
        short: '',
      },
    },
  },
);
