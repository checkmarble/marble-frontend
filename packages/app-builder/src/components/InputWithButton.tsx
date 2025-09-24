import { useState } from 'react';
import { Button, Input } from 'ui-design-system';
import { IconName } from 'ui-icons';
import { ZodType } from 'zod/v4';

type InputWithButtonProps = {
  initialValue?: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  label?: string;
  buttonLabel: string;
  validator?: ZodType<string>;
  icon?: IconName;
  inputClassName?: string;
};

export const InputWithButton = ({
  initialValue,
  onChange,
  onClear,
  placeholder,
  label,
  buttonLabel,
  validator,
  icon,
  inputClassName,
}: InputWithButtonProps) => {
  const [value, setValue] = useState(initialValue ?? '');
  const isValid = validator ? validator.safeParse(value).success : true;

  return (
    <div className="flex gap-1">
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (!e.target.value) onClear?.();
        }}
        startAdornment={icon}
        className={inputClassName}
      />
      <Button onClick={() => onChange(value)} disabled={!isValid}>
        {buttonLabel}
      </Button>
    </div>
  );
};
