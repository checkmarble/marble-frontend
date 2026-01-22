import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';
import { Tag } from 'ui-design-system';

export function ClientTagsList({ tagsIds }: { tagsIds: string[] }) {
  const { orgObjectTags } = useOrganizationObjectTags();

  return (
    <div className="flex flex-wrap gap-2">
      {tagsIds.map((tagId) => {
        const tag = orgObjectTags.find((t) => t.id === tagId);
        if (!tag) return null;

        return (
          <Tag key={tagId} color="purple" size="small">
            {tag.name}
          </Tag>
        );
      })}
    </div>
  );
}
