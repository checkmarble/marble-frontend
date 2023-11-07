import { type LabelledAst } from '@app-builder/models';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Tip } from 'ui-icons';

import {
  getDataTypeIcon,
  getDataTypeTKey,
  getOperatorTypeIcon,
  getOperatorTypeTKey,
} from './OperandEditor/OperandOption/Option';
import { OperandDescription, OperandTooltip } from './OperandTooltip';

export const selectBorderColor = ['grey-10', 'red-100', 'red-25'] as const;

export function TypeInfos({
  operandType,
  dataType,
  className,
}: {
  operandType: LabelledAst['operandType'];
  dataType: LabelledAst['dataType'];
  className?: string;
}) {
  const { t } = useTranslation('scenarios');
  const typeInfos = [
    {
      Icon: getOperatorTypeIcon(operandType),
      tKey: getOperatorTypeTKey(operandType),
    },
    {
      Icon: getDataTypeIcon(dataType),
      tKey: getDataTypeTKey(dataType),
    },
  ];

  if (typeInfos.filter(({ Icon }) => !!Icon).length === 0) return null;

  return (
    <div className="flex flex-row gap-1">
      {typeInfos.map(({ Icon, tKey }) => {
        if (!Icon) return null;
        return (
          <div
            key={tKey}
            className={clsx(
              'bg-grey-02 flex items-center justify-center rounded-sm p-1',
              className
            )}
          >
            <Icon width="16px" height="16px" aria-label={tKey && t(tKey)} />
          </div>
        );
      })}
    </div>
  );
}

export const OperandLabel = ({
  operandLabelledAst,
  ariaLabel,
  variant,
  tooltipContent,
}: {
  operandLabelledAst: LabelledAst;
  ariaLabel?: string;
  variant: 'edit' | 'view';
  tooltipContent?: React.ReactNode;
}) => {
  return (
    <div
      aria-label={ariaLabel}
      className={clsx(
        'text-s text-grey-100 group flex flex-row items-center justify-between gap-2 font-normal transition-colors',
        'h-fit min-h-[40px] w-fit min-w-[40px] rounded px-2',
        variant === 'edit' && 'bg-grey-00 group-radix-state-open:bg-purple-05',
        variant === 'view' && 'bg-grey-02'
      )}
    >
      <TypeInfos
        operandType={operandLabelledAst.operandType}
        dataType={operandLabelledAst.dataType}
        className={clsx(
          variant === 'edit' &&
            'bg-grey-02  group-radix-state-open:bg-purple-10',
          variant === 'view' && 'bg-grey-10'
        )}
      />
      {operandLabelledAst.name}
      <OperandTooltip
        content={
          tooltipContent ? (
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
          )
        }
        sideOffset={16}
        alignOffset={-16}
      >
        <Tip className="shrink-0 text-[21px] text-transparent transition-colors group-hover:text-purple-50 group-hover:hover:text-purple-100" />
      </OperandTooltip>
    </div>
  );
};
