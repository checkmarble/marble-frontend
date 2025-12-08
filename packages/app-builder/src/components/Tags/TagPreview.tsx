import { cn } from 'ui-design-system';

interface TagPreviewProps {
  name: string;
  className?: string;
}

export function TagPreview({ name, className }: TagPreviewProps) {
  return (
    <div className={cn('bg-purple-96 flex size-fit flex-row items-center gap-2 rounded-full px-2 py-[3px]', className)}>
      <span className="text-purple-65 text-xs font-normal">{name}</span>
    </div>
  );
}
