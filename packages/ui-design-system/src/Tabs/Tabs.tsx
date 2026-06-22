import { cn } from '../utils';

// Works for both:
// - NavLink: uses aria-current="page" (set automatically when active)
// - Button: uses data-status="active" (set manually)
export const tabClassName = cn(
  'flex items-center h-8 px-sm text-s font-medium rounded-sm',
  'bg-purple-background text-purple-primary',
  'dark:bg-transparent dark:text-grey-placeholder',
  // Active state via aria-current (NavLink)
  'aria-[current=page]:bg-purple-primary aria-[current=page]:text-white',
  'aria-[current=page]:dark:bg-purple-primary aria-[current=page]:dark:text-grey-white',
  // Active state via data-status (Button)
  'data-[status=active]:bg-purple-primary data-[status=active]:text-white',
  'data-[status=active]:dark:bg-purple-primary data-[status=active]:dark:text-grey-white',
  // Disabled state
  'aria-disabled:text-grey-secondary',
);

/**
 * Container component for tabs providing consistent spacing and background styling.
 * Children should be buttons or NavLinks with the `tabClassName` applied.
 */
export function Tabs({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="tablist"
      className="flex p-xs gap-xs rounded-md bg-purple-background self-start justify-self-start dark:bg-grey-background"
    >
      {children}
    </div>
  );
}
