import { type LabelledAst } from '@app-builder/models';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useTranslation } from 'react-i18next';

import {
  getDataTypeIcon,
  getDataTypeTKey,
  getOperatorTypeIcon,
  getOperatorTypeTKey,
} from './Option';

export function OperandTooltip({
  option,
  children,
  side = 'right',
  align = 'start',
  sideOffset,
  alignOffset,
}: {
  option: LabelledAst;
  children: React.ReactNode;
} & Pick<
  Tooltip.TooltipContentProps,
  'sideOffset' | 'side' | 'align' | 'alignOffset'
>) {
  const typeInfos = [
    {
      Icon: getOperatorTypeIcon(option.operandType),
      tKey: getOperatorTypeTKey(option.operandType),
    },
    {
      Icon: getDataTypeIcon(option.dataType),
      tKey: getDataTypeTKey(option.dataType),
    },
  ];

  return (
    <Tooltip.Root delayDuration={0}>
      <Tooltip.Trigger>{children}</Tooltip.Trigger>
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
              {option.name}
            </p>
          </div>
          {option.description && (
            <p className="text-grey-50 text-xs font-normal">
              {option.description}
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
            {t(tKey)}
          </span>
        );
      })}
    </div>
  );
}
