import { type AnyFormApi } from '@tanstack/react-form';
import { select } from 'radash';
import type { FormEvent } from 'react';

export const submitOnCtrlEnter: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    e.currentTarget.closest('form')?.requestSubmit();
  }
};

export function handleSubmit(form: AnyFormApi) {
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
