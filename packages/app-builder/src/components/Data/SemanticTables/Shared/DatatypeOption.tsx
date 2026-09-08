import { DataType, getDataTypeIcon, PrimitiveTypes } from '@app-builder/models/data-model';
import { useMemo } from 'react';
import { match } from 'ts-pattern';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

const dataTypeOptions: { value: PrimitiveTypes; labelKey: string }[] = [
  { value: 'String', labelKey: 'String' },
  { value: 'Timestamp', labelKey: 'Timestamp' },
  { value: 'Float', labelKey: 'Number' },
  { value: 'Bool', labelKey: 'Boolean' },
  { value: 'Coords', labelKey: 'GPS Coords' },
  { value: 'IpAddress', labelKey: 'IP Address' },
] as const;

export function DatatypeOption({
  dataType,
  label,
  size = 'medium',
}: {
  dataType: PrimitiveTypes;
  label?: string;
  size?: DataTypeIconSize;
}) {
  const labelKey = label ?? dataTypeOptions.find((opt) => opt.value === dataType)?.labelKey ?? dataType;
  return (
    <div className="flex items-center gap-sm">
      <DatatypeIcon dataType={dataType} size={size} />
      <span>{labelKey}</span>
    </div>
  );
}

type DataTypeIconSize = 'small' | 'medium';

export function DatatypeIcon({ dataType, size = 'medium' }: { dataType: PrimitiveTypes; size?: DataTypeIconSize }) {
  const labelKey = dataTypeOptions.find((opt) => opt.value === dataType)?.labelKey;
  return (
    <span
      className={cn(
        'text-grey-secondary bg-grey-background grid shrink-0 place-items-center rounded',
        size === 'small' ? 'p-xs' : 'p-sm',
      )}
      title={labelKey}
    >
      <Icon icon={getDataTypeIcon(dataType) ?? 'string'} className={size === 'small' ? 'size-3' : 'size-4'} />
    </span>
  );
}

export function useDatatypeOptions() {
  return useMemo(
    () =>
      dataTypeOptions.map((opt) => ({
        label: <DatatypeOption dataType={opt.value} />,
        value: opt.value,
      })),
    [],
  );
}

export function DatatypeToPrimitiveType(dataType: DataType): PrimitiveTypes {
  return match(dataType)
    .with('Timestamp', 'Timestamp[]', () => 'Timestamp')
    .with('String', 'String[]', () => 'String')
    .with('Float', 'Float[]', () => 'Float')
    .with('Bool', 'Bool[]', () => 'Bool')
    .with('Coords', 'Coords[]', () => 'Coords')
    .with('IpAddress', 'IpAddress[]', () => 'IpAddress')
    .with('Int', 'Int[]', () => 'Int')
    .otherwise(() => 'String') as PrimitiveTypes;
}
