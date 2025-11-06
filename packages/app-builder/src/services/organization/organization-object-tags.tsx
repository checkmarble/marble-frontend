import { createSimpleContext } from '@app-builder/utils/create-context';
import { type Tag } from 'marble-api';
import { useMemo } from 'react';

interface OrganizationObjectTagsContext {
  orgObjectTags: Tag[];
  getTagById: (tagId: string) => Tag | undefined;
}

const OrganizationObjectTagsContext = createSimpleContext<OrganizationObjectTagsContext>('OrganizationTags');

export function OrganizationObjectTagsContextProvider({ tags, children }: { tags: Tag[]; children: React.ReactNode }) {
  const value = useMemo(() => {
    const orgUserMap = new Map<string, Tag>(tags.map((tag) => [tag.id, tag]));

    return {
      orgObjectTags: tags,
      getTagById: (tagid: string) => orgUserMap.get(tagid),
    };
  }, [tags]);
  return <OrganizationObjectTagsContext.Provider value={value}>{children}</OrganizationObjectTagsContext.Provider>;
}

export const useOrganizationObjectTags = () => OrganizationObjectTagsContext.useValue();
