import { type LabelledAst } from '@app-builder/models';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getDataTypeIcon,
  getDataTypeTKey,
  getOperatorTypeIcon,
  getOperatorTypeTKey,
} from './OperandEditor/OperandOption/Option';

const MAX_ENUM_VALUES = 50;

interface OperandTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: Tooltip.TooltipContentProps['side'];
  align?: Tooltip.TooltipContentProps['align'];
  sideOffset?: Tooltip.TooltipContentProps['sideOffset'];
  alignOffset?: Tooltip.TooltipContentProps['alignOffset'];
}

export function OperandTooltip({
  children,
  content,
  side = 'right',
  align = 'start',
  sideOffset,
  alignOffset,
}: OperandTooltipProps) {
  return (
    <Tooltip.Root delayDuration={0}>
      <Tooltip.Trigger tabIndex={-1} asChild>
        <span>{children}</span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className="bg-grey-00 border-grey-10 flex max-h-[400px] max-w-[300px] overflow-y-auto overflow-x-hidden rounded border shadow-md"
        >
          <div className="flex flex-col gap-2 p-4">{content}</div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export const OperandDescription = ({
  operand,
}: {
  operand: {
    name: string;
    operandType: LabelledAst['operandType'];
    dataType: LabelledAst['dataType'];
    description?: string;
    values?: string[];
  };
}) => {
  const { t } = useTranslation(['scenarios']);

  const values = useMemo(() => {
    if (!operand.values) return null;
    const sorted = [...operand.values].sort();
    if (sorted.length > MAX_ENUM_VALUES) {
      const sliced = sorted.slice(0, MAX_ENUM_VALUES);
      sliced.push('...');
      return sliced;
    }
    return sorted;
  }, [operand.values]);

  return (
    <Fragment>
      <div className="flex flex-col gap-1">
        <TypeInfos
          operandType={operand.operandType}
          dataType={operand.dataType}
        />
        <p className="text-grey-100 text-s text-ellipsis font-normal">
          {operand.name}
        </p>
      </div>
      {operand.description && (
        <p className="text-grey-50 text-xs font-normal first-letter:capitalize">
          {operand.description}
        </p>
      )}
      {values && values.length > 0 && (
        <div>
          <p className="text-grey-50 text-s">{t('scenarios:enum_options')}</p>
          <div className="px-1">
            {values.map((value) => {
              return (
                <p key={value} className="text-grey-50 text-xs font-normal">
                  {value}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </Fragment>
  );
};

function TypeInfos({
  operandType,
  dataType,
}: {
  operandType: LabelledAst['operandType'];
  dataType: LabelledAst['dataType'];
}) {
  const { t } = useTranslation(['scenarios']);
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
  if (typeInfos.filter(({ tKey }) => !!tKey).length === 0) return null;

  return (
    <div className="flex flex-row gap-2">
      {typeInfos.map(({ Icon, tKey }) => {
        if (!tKey) return null;
        return (
          <span
            key={tKey}
            className="inline-flex items-center gap-[2px] text-xs font-normal text-purple-50"
          >
            {Icon && <Icon className="text-[12px]" />}
            {t(tKey, { count: 1 })}
          </span>
        );
      })}
    </div>
  );
}
