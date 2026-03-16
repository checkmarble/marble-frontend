import { Tag } from 'ui-design-system';

export function PivotType({ type }: { type: 'field' | 'link' }) {
  return (
    <Tag size="small" color={type === 'field' ? 'grey' : 'purple'} className="w-fit">
      {type}
    </Tag>
  );
}
