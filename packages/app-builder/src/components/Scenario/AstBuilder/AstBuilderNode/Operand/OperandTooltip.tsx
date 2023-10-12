import { type LabelledAst } from '@app-builder/models';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getDataTypeIcon,
  getDataTypeTKey,
  getOperatorTypeIcon,
  getOperatorTypeTKey,
} from './OperandEditor/OperandOption/Option';

const MAX_ENUM_VALUES = 50;

interface OperandTooltipProps {
  operand: {
    name: string;
    operandType: LabelledAst['operandType'];
    dataType: LabelledAst['dataType'];
    description?: string;
    values?: string[];
  };
  children: React.ReactNode;
  side?: Tooltip.TooltipContentProps['side'];
  align?: Tooltip.TooltipContentProps['align'];
  sideOffset?: Tooltip.TooltipContentProps['sideOffset'];
  alignOffset?: Tooltip.TooltipContentProps['alignOffset'];
}

export function OperandTooltip({
  operand,
  children,
  side = 'right',
  align = 'start',
  sideOffset,
  alignOffset,
}: OperandTooltipProps) {
  const { t } = useTranslation(['scenarios']);
  const typeInfos = [
    {
      Icon: getOperatorTypeIcon(operand.operandType),
      tKey: getOperatorTypeTKey(operand.operandType),
    },
    {
      Icon: getDataTypeIcon(operand.dataType),
      tKey: getDataTypeTKey(operand.dataType),
    },
  ];
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
          <div className="flex flex-col gap-2 p-4">
            <div className="flex flex-col gap-1">
              <TypeInfos typeInfos={typeInfos} />
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
                <p className="text-grey-50 text-s">
                  {t('scenarios:enum_options')}
                </p>
                <div className="px-1">
                  {values.map((value, index) => {
                    return (
                      <p
                        key={-index}
                        className="text-grey-50 text-xs font-normal"
                      >
                        {value}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function TypeInfos({
  typeInfos,
}: {
  typeInfos: {
    Icon: ReturnType<typeof getDataTypeIcon>;
    tKey: ReturnType<typeof getDataTypeTKey>;
  }[];
}) {
  const { t } = useTranslation(['scenarios']);

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
