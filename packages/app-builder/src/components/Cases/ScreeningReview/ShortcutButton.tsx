import { Button, type ButtonV2Props, cn } from 'ui-design-system';
import { ShortcutKeys } from './ShortcutHelp';
import type { ShortcutHotkey } from './shortcuts';

// The design's shortcut button styles on the DS Button. The key cap takes the label's colour.
const TONES = {
  primary: { variant: 'primary', className: undefined },
  neutral: { variant: 'secondary', className: 'text-grey-secondary' },
  ghost: { variant: 'secondary', className: 'border-transparent bg-transparent text-grey-secondary shadow-none' },
  picked_hit: { variant: 'secondary', className: 'border-red-primary text-red-primary' },
  picked_no_hit: { variant: 'secondary', className: 'border-green-primary text-green-primary' },
} as const satisfies Record<string, { variant: ButtonV2Props['variant']; className: string | undefined }>;

export type ShortcutButtonTone = keyof typeof TONES;

/** A button with its keyboard shortcut as a key cap. */
export function ShortcutButton({
  tone,
  hotkeys,
  className,
  children,
  ...props
}: Omit<ButtonV2Props, 'variant' | 'appearance' | 'color'> & {
  tone: ShortcutButtonTone;
  hotkeys: readonly ShortcutHotkey[];
}) {
  return (
    <Button variant={TONES[tone].variant} className={cn(TONES[tone].className, className)} {...props}>
      {children}
      <ShortcutKeys hotkeys={hotkeys} variant="small" />
    </Button>
  );
}
