import type { FormApi } from '@tanstack/react-form';
import type { FormEvent } from 'react';

export const submitOnBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = (
  event,
) => {
  if (event.currentTarget.value !== event.currentTarget.defaultValue) {
    event.currentTarget.form?.requestSubmit();
  }
};

export function adaptToStringArray(value: string | (string | undefined)[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }
  if (typeof value === 'string') {
    return [value];
  }
  return value.filter((val) => val !== undefined);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleSubmit(form: FormApi<any>) {
  return (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };
}
