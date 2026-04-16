import { getDataTypeIcon, PrimitiveTypes } from '@app-builder/models/data-model';
import { useMemo } from 'react';
import { Icon } from 'ui-icons';

const dataTypeOptions: { value: PrimitiveTypes; labelKey: string }[] = [
  { value: 'String', labelKey: 'String' },
  { value: 'Timestamp', labelKey: 'Timestamp' },
  { value: 'Int', labelKey: 'Integer' },
  { value: 'Float', labelKey: 'Float' },
  { value: 'Bool', labelKey: 'Boolean' },
  { value: 'Coords', labelKey: 'GPS Coords' },
  { value: 'IpAddress', labelKey: 'IP Address' },
] as const;

function DatatypeOption({ dataType }: { dataType: PrimitiveTypes }) {
  const labelKey = dataTypeOptions.find((opt) => opt.value === dataType)?.labelKey ?? dataType;
  return (
    <div className="flex items-center gap-v2-sm">
      <DatatypeIcon dataType={dataType} />
      <span>{labelKey}</span>
    </div>
  );
}

export function DatatypeIcon({ dataType }: { dataType: PrimitiveTypes }) {
  return (
    <span className=" text-grey-secondary bg-grey-background rounded p-v2-sm grid place-items-center">
      <Icon icon={getDataTypeIcon(dataType) ?? 'minus'} className="size-4" />
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
