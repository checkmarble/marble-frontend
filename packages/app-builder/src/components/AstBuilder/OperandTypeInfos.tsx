import { type DataType, getDataTypeIcon, getDataTypeTKey } from '@app-builder/models';
import {
  getOperandTypeIcon,
  getOperandTypeTKey,
  type OperandType,
} from '@app-builder/models/operand-type';
import { cva, type VariantProps } from 'class-variance-authority';
import type { TFunction } from 'i18next';
import { Icon } from 'ui-icons';

const operandTypeInfosClassnames = cva(
  'flex items-center justify-center rounded-sm p-1 text-grey-00',
  {
    variants: {
      interactionMode: {
        viewer: 'bg-grey-90',
        editor: 'bg-grey-98 group-aria-expanded:bg-purple-96 group-aria-expanded:text-purple-65',
      },
    },
    defaultVariants: {
      interactionMode: 'editor',
    },
  },
);

export type OperandTypeVariantProps = VariantProps<typeof operandTypeInfosClassnames>;
type OperandTypeInfosProps = OperandTypeVariantProps & {
  t: TFunction<['common', 'scenarios'], undefined>;
  operandType: OperandType;
  dataType: DataType;
};

export function OperandTypeInfos({
  t,
  operandType,
  dataType,
  interactionMode,
}: OperandTypeInfosProps) {
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
          <div key={tKey} className={operandTypeInfosClassnames({ interactionMode })}>
            <Icon
              icon={icon}
              className="size-4 shrink-0"
              aria-label={tKey ? t(`scenarios:${tKey}`) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
