import type { ScreeningCategory } from '@app-builder/models/screening';
import type { ListConfigFilters } from '@app-builder/queries/screening/lists-config';

type SectionData = NonNullable<ListConfigFilters[keyof ListConfigFilters]>;

export function getSectionLeafNames(sectionKey: ScreeningCategory, section: SectionData): string[] {
  if (
    sectionKey === 'sanctions' ||
    sectionKey === 'peps' ||
    sectionKey === 'adverse-media' ||
    sectionKey === 'third-parties'
  ) {
    return (section.datasets ?? []).flatMap((g) => g.datasets.map((d) => d.name));
  }
  return [];
}
