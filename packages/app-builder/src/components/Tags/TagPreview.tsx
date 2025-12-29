import { cn, Tag } from 'ui-design-system';

interface TagPreviewProps {
  name: string;
  className?: string;
}

export function TagPreview({ name, className }: TagPreviewProps) {
  return (
    <Tag color="purple" size="small" className={cn(className)}>
      {name}
    </Tag>
  );
}
