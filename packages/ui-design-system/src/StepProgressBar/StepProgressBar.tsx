import { cva, type VariantProps } from 'class-variance-authority';
import { type ReactNode } from 'react';
import { cn } from '../utils';

// Drives the text color of active labels; the fill bar reuses it via `bg-current`.
// Mirrors the `Tag` component's `color` palette (default `purple`).
const colorClassName = cva('', {
  variants: {
    color: {
      purple: 'text-purple-primary',
      blue: 'text-blue-58',
      green: 'text-green-primary',
      yellow: 'text-yellow-primary',
      orange: 'text-orange-primary',
      red: 'text-red-primary',
      grey: 'text-grey-primary',
      white: 'text-grey-primary',
    },
  },
  defaultVariants: {
    color: 'purple',
  },
});

export type StepProgressBarColor = NonNullable<VariantProps<typeof colorClassName>['color']>;

export interface StepProgressBarStep<K extends string = string> {
  key: K;
  label: ReactNode;
}

export interface StepProgressBarProps<K extends string = string> {
  steps: ReadonlyArray<StepProgressBarStep<K>>;
  /** Current step. Must be one of `steps[].key`. */
  value: NoInfer<K>;
  /** Highlight color, mirrors the `Tag` component palette. Defaults to `purple`. */
  color?: StepProgressBarColor;
  /** Prefix each label with its 1-based index ("1. ", "2. "). Defaults to `true`. */
  numbered?: boolean;
  /** Slowly pulse the highlight to signal the value is about to change. */
  isPending?: boolean;
  className?: string;
}

// `const K` infers the literal union of keys from `steps`, so `value` only
// accepts a key that is actually present in the provided steps.
export function StepProgressBar<const K extends string>({
  steps,
  value,
  color = 'purple',
  numbered = true,
  isPending = false,
  className,
}: StepProgressBarProps<K>) {
  const activeIndex = steps.findIndex((step) => step.key === value);
  const fillPercent = activeIndex < 0 ? 0 : ((activeIndex + 1) / steps.length) * 100;

  return (
    <div className={cn('flex w-full flex-col gap-sm', className)}>
      <div className="flex w-full">
        {steps.map((step, index) => {
          const isActive = index <= activeIndex;
          return (
            <span
              key={step.key}
              className={cn(
                'text-s flex-1 text-start font-semibold',
                isActive ? colorClassName({ color }) : 'text-grey-placeholder',
              )}
            >
              {numbered ? `${index + 1}. ` : null}
              {step.label}
            </span>
          );
        })}
      </div>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={activeIndex + 1}
        className="bg-grey-border relative h-1 w-full overflow-hidden rounded-full"
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full bg-current transition-[width] duration-500 ease-out',
            colorClassName({ color }),
            isPending && 'animate-pulse [animation-duration:2.5s]',
          )}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
}
