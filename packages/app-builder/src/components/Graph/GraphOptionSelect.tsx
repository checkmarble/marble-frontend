import { useState } from 'react';
import { MenuCommand } from 'ui-design-system';

export type SelectOption = {
  value: string;
  label: string;
};

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

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton className={className} size={size} disabled={disabled}>
          {options.find((option) => option.value === value)?.label ?? (value || placeholder)}
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
              {option.label}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
