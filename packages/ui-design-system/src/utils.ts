import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...classLists: ClassValue[]) => twMerge(clsx(classLists));

export const UX_DELAY_300MS = 300;
export const UX_DELAY_1S = 1_000;
