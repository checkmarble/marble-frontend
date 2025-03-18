import { select } from 'radash';
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

export function handleSubmit(form: { handleSubmit: () => void }) {
  return (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };
}

export const getFieldErrors = (errors: ({ message: string } | undefined)[]) =>
  select(
    errors,
    (e) => (e as { message: string }).message,
    (e) => e !== undefined,
  );
