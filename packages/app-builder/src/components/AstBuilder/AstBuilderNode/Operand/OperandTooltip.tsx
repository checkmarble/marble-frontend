import { type LabelledAst } from '@app-builder/models';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useTranslation } from 'react-i18next';

import {
  getDataTypeIcon,
  getDataTypeTKey,
  getOperatorTypeIcon,
  getOperatorTypeTKey,
} from './OperandEditor/OperandOption/Option';

interface OperandTooltipProps {
  operand: {
    name: string;
    operandType: LabelledAst['operandType'];
    dataType: LabelledAst['dataType'];
    description?: string;
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
          className="bg-grey-00 border-grey-10 flex max-w-[200px] flex-col gap-2 rounded border p-4 shadow-md"
        >
          <div className="flex flex-col gap-1">
            <TypeInfos typeInfos={typeInfos} />
            <p className="text-grey-100 text-s overflow-hidden text-ellipsis font-normal">
              {operand.name}
            </p>
          </div>
          {operand.description && (
            <p className="text-grey-50 text-xs font-normal">
              {operand.description}
            </p>
          )}
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
  const { t } = useTranslation('scenarios');

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
