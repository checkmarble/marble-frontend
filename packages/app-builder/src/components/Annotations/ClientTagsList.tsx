import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';

export function ClientTagsList({ tagsIds }: { tagsIds: string[] }) {
  const { orgObjectTags } = useOrganizationObjectTags();

  return (
    <div className="flex flex-wrap gap-2">
      {tagsIds.map((tagId) => {
        const tag = orgObjectTags.find((t) => t.id === tagId);
        if (!tag) return null;

        return (
          <div
            key={tagId}
            className="bg-purple-background flex size-fit flex-row items-center gap-2 rounded-full px-2 py-[3px]"
          >
            <span className="text-purple-primary text-xs font-normal">{tag.name}</span>
          </div>
        );
      })}
    </div>
  );
}
