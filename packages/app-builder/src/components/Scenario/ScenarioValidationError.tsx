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
            'bg-red-05 text-s flex h-8 items-center justify-center rounded px-2 py-1 font-medium text-red-100',
            className,
          )}
        >
          {error}
        </span>
      ))}
    </div>
  );
}
