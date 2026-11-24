import { CopyToClipboardButton } from '@app-builder/components/CopyToClipboardButton';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { getFieldErrors } from '@app-builder/utils/form';
import { type AnyFieldApi } from '@tanstack/react-form';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, Input, type InputProps } from 'ui-design-system';

/** The light purple card of the first step and of the recovery commands. */
export const SSO_HIGHLIGHTED_CARD_CLASSNAME =
  'rounded-lg border border-purple-border-light bg-purple-background-light p-md dark:border-grey-border';

export function SsoSection({
  title,
  tag,
  description,
  highlighted,
  children,
}: {
  title: string;
  tag?: ReactNode;
  description: string;
  highlighted?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      className={cn(
        'flex flex-col gap-md',
        highlighted ? SSO_HIGHLIGHTED_CARD_CLASSNAME : 'rounded-lg border border-grey-border bg-surface-card p-md',
      )}
    >
      <div className="flex flex-col gap-xs">
        <h3 className="text-xs text-grey-primary flex items-center gap-sm font-medium">
          {title}
          {tag}
        </h3>
        <p className="text-xs text-grey-primary">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function SsoField({
  id,
  label,
  hint,
  errors,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  errors?: string[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-xs">
      <FormLabel name={id} valid={errors?.length ? false : undefined} className="text-2xs text-grey-primary">
        {label}
      </FormLabel>
      {children}
      <FormErrorOrDescription
        errors={errors}
        description={hint ? <p className="text-2xs text-grey-secondary">{hint}</p> : undefined}
      />
    </div>
  );
}

export function SsoTextField({
  field,
  label,
  hint,
  id = field.name,
  ...inputProps
}: { field: AnyFieldApi; label: string; hint?: string } & InputProps) {
  const errors = getFieldErrors(field.state.meta.errors);
  const invalid = errors.length > 0;

  return (
    <SsoField id={id} label={label} hint={hint} errors={errors}>
      <Input
        id={id}
        size="medium"
        dir="ltr"
        inputClassName="text-start"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.currentTarget.value)}
        onBlur={field.handleBlur}
        aria-invalid={invalid || undefined}
        borderColor={invalid ? 'redfigma-47' : 'greyfigma-90'}
        {...inputProps}
      />
    </SsoField>
  );
}

/** Read-only values look like a filled input with no border. */
export function SsoReadOnlyInput({ id, value }: { id: string; value: string }) {
  return (
    <Input
      id={id}
      value={value}
      readOnly
      size="medium"
      // URLs and keys read left to right, translated values follow the locale.
      dir="auto"
      className="min-w-0 flex-1"
      inputClassName="border-transparent dark:border-transparent text-start"
    />
  );
}

export function SsoCopyableValue({ id, value }: { id: string; value: string }) {
  return (
    <div className="flex items-center gap-sm">
      <SsoReadOnlyInput id={id} value={value} />
      <SsoCopyButton value={value} />
    </div>
  );
}

export function SsoCopyButton({ value, label }: { value: string; label?: string }) {
  const { t } = useTranslation(['common']);

  return (
    <CopyToClipboardButton
      toCopy={value}
      secret
      {...(label ? { 'aria-label': label } : {})}
      className="bg-surface-card text-xs rounded-md"
    >
      {t('common:copy')}
    </CopyToClipboardButton>
  );
}
