import clsx from 'clsx';

export function ScenarioBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <div
      className={clsx(
        'text-s flex h-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-1 rounded',
        className
      )}
    >
      {children}
    </div>
  );
}
