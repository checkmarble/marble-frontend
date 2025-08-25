import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  override: {
    classGroups: {
      'font-size': [
        'text-xs',
        'text-s',
        'text-m',
        'text-l',
        'text-2xl', // Old ones

        'text-h1',
        'text-h2',
        'text-default',
        'text-small',
        'text-tiny', // New ones
      ],
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
