import { select } from 'radash';
import type { FormEvent, LegacyRef, MutableRefObject, RefCallback } from 'react';

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

export const mergeRefs = <T>(
  refs: Array<MutableRefObject<T> | LegacyRef<T> | undefined | null>,
): RefCallback<T> => {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as MutableRefObject<T | null>).current = value;
      }
    });
  };
};
