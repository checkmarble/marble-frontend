import { organizationEnvironmentSchema } from '@bo/server-fns/organization';
import { RadioGroup, RadioGroupItem } from 'ui-design-system';
import { z } from 'zod/v4';

export type CreatableOrganizationEnvironment = z.infer<typeof organizationEnvironmentSchema>;

const OPTIONS: { value: CreatableOrganizationEnvironment; label: string }[] = [
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
];

export function EnvironmentField({
  value,
  onChange,
}: {
  value: CreatableOrganizationEnvironment;
  onChange: (value: CreatableOrganizationEnvironment) => void;
}) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-grey-primary text-s font-medium">Environment</span>
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as CreatableOrganizationEnvironment)}
        aria-label="Environment"
      >
        {OPTIONS.map((option) => (
          <RadioGroupItem key={option.value} value={option.value}>
            {option.label}
          </RadioGroupItem>
        ))}
      </RadioGroup>
    </div>
  );
}

export function creatableEnvironment(value: string | undefined): CreatableOrganizationEnvironment {
  const parsed = organizationEnvironmentSchema.safeParse(value);
  return parsed.success ? parsed.data : 'production';
}
