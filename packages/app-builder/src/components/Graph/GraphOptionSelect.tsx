import {
  DatatypeOption,
  DatatypeToPrimitiveType,
} from '@app-builder/components/Data/SemanticTables/Shared/DatatypeOption';
import { type DataType, type SemanticTypeField } from '@app-builder/models';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, MenuCommand, Tag } from 'ui-design-system';

export type SelectOption = {
  value: string;
  label: string;
  dataType?: DataType;
  semanticType?: SemanticTypeField;
};

function OptionLabel({ option, fallback }: { option?: SelectOption; fallback?: string }) {
  if (!option) return fallback;
  if (!option.dataType) return option.label;
  return <DatatypeOption dataType={DatatypeToPrimitiveType(option.dataType)} label={option.label} size="small" />;
}

function SemanticTypeTag({ semanticType }: { semanticType: SemanticTypeField }) {
  const { t } = useTranslation(['data']);
  return (
    <Tag color="grey" size="xs" className="shrink-0">
      {t(`data:upload_data.field_semantic.${semanticType}`)}
    </Tag>
  );
}

/** Single-choice `MenuCommand` select that owns its open state and closes on pick. */
export function GraphOptionSelect({
  value,
  options,
  placeholder,
  onChange,
  disabled,
  size,
  className,
}: {
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton className={cn('gap-sm', className)} size={size} disabled={disabled}>
          <OptionLabel option={selected} fallback={value || placeholder} />
          {selected?.semanticType ? <SemanticTypeTag semanticType={selected.semanticType} /> : null}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth>
        <MenuCommand.List>
          {options.map((option) => (
            <MenuCommand.Item
              key={option.value}
              value={option.value}
              onSelect={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <OptionLabel option={option} />
              {option.semanticType ? <SemanticTypeTag semanticType={option.semanticType} /> : null}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
