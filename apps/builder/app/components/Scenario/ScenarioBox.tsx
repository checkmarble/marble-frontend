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
        'flex h-fit min-h-[40px] min-w-[40px] flex-wrap items-center gap-1 rounded p-2',
        className
      )}
    >
      {children}
    </div>
  );
}
