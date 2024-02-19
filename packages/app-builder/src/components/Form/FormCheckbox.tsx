import { Checkbox } from 'ui-design-system';

import { useFieldConfig } from './FormField';

export function FormCheckbox({
  children,
  onCheckedChange,
  ...rest
}: Omit<React.ComponentProps<typeof Checkbox>, 'checked'>) {
  const config = useFieldConfig();

  return (
    <Checkbox
      id={config.id}
      name={config.name}
      defaultChecked={
        typeof config.defaultValue === 'boolean'
          ? config.defaultValue
          : config.defaultValue === 'on'
      }
      {...rest}
    />
  );
}
