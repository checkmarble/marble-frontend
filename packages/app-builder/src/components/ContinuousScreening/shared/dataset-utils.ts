import type { ScreeningCategory } from '@app-builder/models/screening';
import type { ListConfigFilters } from '@app-builder/queries/screening/lists-config';

type SectionData = NonNullable<ListConfigFilters[keyof ListConfigFilters]>;
type SanctionsSection = NonNullable<ListConfigFilters['sanctions']>;

export function getSectionLeafNames(sectionKey: ScreeningCategory, section: SectionData): string[] {
  if (sectionKey === 'sanctions') {
    const s = section as SanctionsSection;
    return s.datasets.flatMap((g) => g.datasets.map((d) => d.name));
  }
  if (sectionKey === 'peps' || sectionKey === 'adverse-media') {
    return Object.values(section)
      .filter((v): v is { name: string }[] => Array.isArray(v))
      .flat()
      .map((i) => i.name);
  }
  return [];
}
