import { useUserRoleLabel } from '@app-builder/hooks/useUserRoleLabel';
import { useState } from 'react';
import { MenuCommand, Tag } from 'ui-design-system';

export function RolesSelect({
  value,
  onChange,
  onBlur,
  options,
  disabled,
  hasError,
  placeholder,
}: {
  value: string[];
  onChange: (roles: string[]) => void;
  onBlur?: () => void;
  options: readonly string[];
  disabled?: boolean;
  hasError?: boolean;
  placeholder?: string;
}) {
  const getRoleLabel = useUserRoleLabel();
  const [open, setOpen] = useState(false);

  const toggleRole = (role: string) => {
    onChange(value.includes(role) ? value.filter((r) => r !== role) : [...value, role]);
  };

  return (
    <MenuCommand.Menu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onBlur?.();
      }}
    >
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton hasError={hasError} className="w-full" disabled={disabled}>
          {value.length > 0 ? (
            <div className="flex flex-wrap items-center gap-xs">
              {value.map((role) => (
                <Tag key={role} color="purple" size="small">
                  {getRoleLabel(role)}
                </Tag>
              ))}
            </div>
          ) : placeholder ? (
            <span className="text-grey-disabled text-s">{placeholder}</span>
          ) : null}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth align="start" className="min-w-(--radix-popover-trigger-width)">
        <MenuCommand.List>
          {options.map((role) => (
            <MenuCommand.Item key={role} value={role} selected={value.includes(role)} onSelect={() => toggleRole(role)}>
              {getRoleLabel(role)}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
