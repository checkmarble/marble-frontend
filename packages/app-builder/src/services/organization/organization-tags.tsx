import { createSimpleContext } from '@app-builder/utils/create-context';
import { type Tag } from 'marble-api';
import { useMemo } from 'react';

interface OrganizationTagsContext {
  orgTags: Tag[];
  getTagById: (tagId: string) => Tag | undefined;
}

const OrganizationTagsContext = createSimpleContext<OrganizationTagsContext>('OrganizationTags');

export function OrganizationTagsContextProvider({ orgTags, children }: { orgTags: Tag[]; children: React.ReactNode }) {
  const value = useMemo(() => {
    const orgUserMap = new Map<string, Tag>(orgTags.map((tag) => [tag.id, tag]));

    return {
      orgTags,
      getTagById: (tagid: string) => orgUserMap.get(tagid),
    };
  }, [orgTags]);
  return <OrganizationTagsContext.Provider value={value}>{children}</OrganizationTagsContext.Provider>;
}

export const useOrganizationTags = () => OrganizationTagsContext.useValue();
