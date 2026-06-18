import { type ComponentProps } from 'react';
import { cn } from 'ui-design-system';

export const ScoreModifier = ({ score, className, ...rest }: ComponentProps<'span'> & { score: number }) => {
  return (
    <span
      {...rest}
      className={cn(
        'bg-purple-background text-purple-primary inline-flex items-center gap-xs rounded-full px-xs py-2xs text-xs font-normal',
        className,
      )}
    >
      <span>{score >= 0 ? '+' : '-'}</span>
      <span>{Math.abs(score)}</span>
    </span>
  );
};
