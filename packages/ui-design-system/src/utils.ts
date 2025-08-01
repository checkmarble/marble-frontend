import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  override: {
    classGroups: {
      'font-size': ['text-s', 'text-m', 'text-l', 'text-2xl'],
    },
  },
});

export const cn = (...classLists: ClassValue[]) => twMerge(clsx(classLists));

export const assertValue = <T>(value: T | undefined, msg: string): T => {
  if (value !== undefined) {
    return value;
  }
  throw new Error(msg);
};
