import clsx from 'clsx';

/**
 * A ping animation.
 * @param className - Use tex-color-* to customize ping color. Use border to make a "white" circle arround the ping.
 *
 * @example className="border-grey-00 absolute right-0 top-0 h-[10px] w-[10px] border-2 text-red-100"
 */
export function Ping({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        'flex items-center justify-center rounded-full',
        className,
      )}
    >
      <span className="animate-ping-slow absolute inline-flex size-full rounded-full bg-current opacity-75"></span>
      <span className="relative inline-flex size-full rounded-full bg-current"></span>
    </span>
  );
}
