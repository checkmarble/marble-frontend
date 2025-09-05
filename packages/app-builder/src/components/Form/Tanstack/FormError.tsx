import { AnyFieldApi } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';
import { $ZodIssueCode } from 'zod/v4/core';

const supportedErrors = ['duplicates', 'duplicate_value'] as const;

type FormErrorProps = {
  field: AnyFieldApi;
  asString?: boolean;
  className?: string;
  translations?: Partial<Record<$ZodIssueCode | (typeof supportedErrors)[number], string>>;
};

export function FormError({ field, className, asString = false, translations }: FormErrorProps) {
  const { t } = useTranslation(['common']);
  if (field.state.meta.errors.length === 0) return null;

  const errorMessages = field.state.meta.errors.map((error) => {
    const errorCode = error.params?.code ?? error.code;
    if (translations?.[errorCode as $ZodIssueCode]) {
      return translations[errorCode as $ZodIssueCode];
    }

    if (supportedErrors.includes(errorCode)) {
      return t(`common:errors.forms.${errorCode}`, { ...error.params });
    }
    return error.message;
  });

  return asString ? (
    <FormErrorDisplayAsString className={className} messages={errorMessages} />
  ) : (
    <FormErrorDisplayAsComponents className={className} messages={errorMessages} />
  );
}

type FormErrorDisplayProps = {
  messages: string[];
  className?: string;
};

const containerClassName = 'text-red-base bg-red-background rounded-v2-md';

function FormErrorDisplayAsString({ messages, className }: FormErrorDisplayProps) {
  return (
    <div className={cn(containerClassName, 'px-v2-sm py-v2-xs', className)}>
      {messages.join(', ')}
    </div>
  );
}

function FormErrorDisplayAsComponents({ messages, className }: FormErrorDisplayProps) {
  return (
    <div className={cn(containerClassName, 'w-fit p-v2-md', className)}>
      <ul className="list-disc list-inside">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
