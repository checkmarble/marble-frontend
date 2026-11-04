import { CalloutV2 } from '@app-builder/components/Callout';
import { cn } from 'ui-design-system';

/** A `CalloutV2` in the error colours: a failure is never reported as a neutral tip. */
export function ErrorBanner({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <CalloutV2
      role="alert"
      className={cn('bg-red-background text-red-primary dark:text-red-primary items-start', className)}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-xs">{children}</div>
    </CalloutV2>
  );
}
