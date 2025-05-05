import { type ComponentProps } from 'react';
import { cn } from 'ui-design-system';

export const ScoreModifier = ({
  score,
  className,
  ...rest
}: ComponentProps<'span'> & { score: number }) => {
  return (
    <span
      {...rest}
      className={cn(
        'bg-purple-96 text-purple-65 inline-flex items-center gap-2 rounded-full px-2 py-[3px] text-xs font-normal',
        className,
      )}
    >
      <span>{score >= 0 ? '+' : '-'}</span>
      <span>{score}</span>
    </span>
  );
};
