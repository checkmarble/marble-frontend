import clsx from 'clsx';

export function EvaluationErrors({
  errors,
  className,
}: {
  errors: string[];
  className?: string;
}) {
  if (errors.length === 0) return null;
  return (
    <div className={clsx('flex flex-row flex-wrap gap-2', className)}>
      {errors.map((error) => (
        <span
          key={error}
          className={clsx(
            'bg-red-95 text-s text-red-47 flex h-8 items-center justify-center rounded px-2 py-1 font-medium',
            className,
          )}
        >
          {error}
        </span>
      ))}
    </div>
  );
}
