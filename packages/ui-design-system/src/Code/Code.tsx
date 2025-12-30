import type React from 'react';
import { cn } from '../utils';

interface CodeProps {
  children?: React.ReactNode;
  className?: string;
}

export const Code: React.FC<CodeProps> = ({ children, className }) => (
  <span className={cn('bg-grey-border rounded-md px-[.2em] py-[.1em]', className)}>{children}</span>
);
