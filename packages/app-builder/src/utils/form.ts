import { AnyFormApi, StandardSchemaV1Issue } from '@tanstack/react-form';
import { select } from 'radash';
import type { FormEvent, MutableRefObject, Ref, RefCallback } from 'react';

export const submitOnBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
  if (event.currentTarget.value !== event.currentTarget.defaultValue) {
    event.currentTarget.form?.requestSubmit();
  }
};

export const submitOnCtrlEnter: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    e.currentTarget.closest('form')?.requestSubmit();
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

type PossibleRef<T> = MutableRefObject<T> | Ref<T> | undefined | null;

function assignRef<T>(ref: PossibleRef<T>, value: T | null) {
  if (typeof ref === 'function') {
    return ref(value);
  }
  if (ref != null) {
    (ref as MutableRefObject<T | null>).current = value;
  }
}

export const mergeRefs = <T>(refs: Array<PossibleRef<T>>): RefCallback<T> => {
  return (value) => {
    const cleanups: Array<(() => void) | void> = [];

    for (const ref of refs) {
      const cleanup = assignRef(ref, value);
      cleanups.push(typeof cleanup === 'function' ? cleanup : undefined);
    }

    if (cleanups.some((cleanup) => typeof cleanup === 'function')) {
      return () => {
        for (const [index, cleanup] of cleanups.entries()) {
          if (typeof cleanup === 'function') {
            cleanup();
          } else {
            assignRef(refs[index], null);
          }
        }
      };
    }
  };
};

export function getFieldErrorObjects(
  errors: (Record<string, StandardSchemaV1Issue[]> | undefined)[],
  fieldName: string,
): StandardSchemaV1Issue[] {
  return errors
    .map((errorObj) => errorObj?.[fieldName])
    .flat()
    .filter((error) => error !== undefined);
}
