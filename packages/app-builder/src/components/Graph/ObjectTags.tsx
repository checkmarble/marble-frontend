import { useGetAnnotationsQuery } from '@app-builder/queries/data/get-annotations';
import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';
import { type Tag as TagModel } from 'marble-api';
import { cn, ExpandableGroupTagLine, Tag } from 'ui-design-system';

/**
 * Org tags currently annotating an object. `enabled: false` skips the request
 * entirely, so callers can gate on a display toggle.
 */
export function useObjectTags(
  objectType: string,
  objectId: string,
  enabled = true,
): { isPending: boolean; tags: TagModel[] } {
  const { getTagById } = useOrganizationObjectTags();
  const annotationsQuery = useGetAnnotationsQuery(objectType, objectId, false, enabled);

  // A disabled query keeps serving its cache, so gate on `enabled` too — otherwise
  // tags stay on screen after the display toggle goes off.
  const tags = enabled
    ? (annotationsQuery.data?.annotations.tags ?? [])
        .map((annotation) => getTagById(annotation.payload.tag_id))
        .filter((tag): tag is TagModel => tag != null)
    : [];

  return { isPending: enabled && annotationsQuery.isPending, tags };
}

/** Read-only tag line that folds overflow into a `+N` popover. */
export function ObjectTagLine({ tags, className }: { tags: TagModel[]; className?: string }) {
  return (
    <div className={className}>
      <ExpandableGroupTagLine
        classname="gap-xs"
        overflowBehavior="popover"
        items={tags.map((tag) => (
          <Tag key={tag.id} size="small" color="purple">
            <div className="size-3 shrink-0 rounded-full me-xs" style={{ backgroundColor: tag.color }} />
            {tag.name}
          </Tag>
        ))}
        moreButton={(overflow, onExpand) => (
          <Tag
            color="purple"
            size="small"
            className={cn('cursor-pointer shrink-0 transition-colors hover:bg-purple-primary/20', className)}
            onClick={onExpand}
          >
            +{overflow}
          </Tag>
        )}
      />
    </div>
  );
}

export function ObjectTagLineSkeleton() {
  return (
    <div className="flex flex-wrap gap-xs">
      <div className="bg-grey-border h-5 w-16 animate-pulse rounded-full" />
      <div className="bg-grey-border h-5 w-14 animate-pulse rounded-full" />
    </div>
  );
}
