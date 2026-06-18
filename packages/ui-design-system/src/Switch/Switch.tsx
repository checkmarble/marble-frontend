import { Root, type SwitchProps, Thumb } from '@radix-ui/react-switch';
import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from '../utils';

const switchRoot = cva([
  'group/switch relative flex h-6 w-10 items-center rounded-full px-2xs outline-hidden transition-colors',
  // Off (unchecked) — light + dark
  'bg-grey-border dark:bg-grey-secondary',
  // On (checked) — purple-primary applies in both enabled and disabled.
  // Light disabled relies on opacity-50 below to wash it out; dark disabled keeps the
  // solid purple-primary per design intent.
  'radix-state-checked:bg-purple-primary radix-state-checked:justify-end',
  // Focus
  'focus-visible:ring-purple-primary focus-visible:ring-2',
  // Disabled
  'disabled:cursor-not-allowed',
  // Light disabled uses opacity-50 on the whole element (per Figma)
  'disabled:opacity-50',
  // Dark disabled clears the opacity (Figma uses solid color tokens in dark)
  'dark:disabled:opacity-100',
  // Dark off-disabled: solid grey-disabled (#3F3F46)
  'dark:disabled:radix-state-unchecked:bg-grey-disabled',
]);

const switchThumb = cva([
  'block size-4 rounded-full',
  // Light thumb: always white
  'bg-grey-white',
  // Dark thumb off (unchecked): #FAFAFB (grey-primary in dark)
  'dark:bg-grey-primary',
  // Dark thumb on (checked): white
  'dark:group-data-[state=checked]/switch:bg-grey-white',
  // Dark thumb disabled (either state): #C1C0C8. The `!` forces a win over the
  // checked rule above when both apply (Tailwind generates `data-*` after
  // `disabled` in its cascade, so the checked rule would otherwise leak through).
  'dark:group-disabled/switch:bg-grey-secondary!',
]);

export const Switch = forwardRef<HTMLButtonElement, SwitchProps & { className?: string }>(function Switch(
  { className, ...props },
  ref,
) {
  return (
    <Root ref={ref} className={cn(switchRoot(), className)} {...props}>
      <Thumb className={switchThumb()} />
    </Root>
  );
});
