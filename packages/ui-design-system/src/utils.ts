import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...classLists: ClassValue[]) => twMerge(clsx(classLists));

export const assertValue = <T>(value: T | undefined, msg: string): T => {
  if (value !== undefined) {
    return value;
  }
  throw new Error(msg);
};
