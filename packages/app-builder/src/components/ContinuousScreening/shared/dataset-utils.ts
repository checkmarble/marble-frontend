import type { ScreeningCategory } from '@app-builder/models/screening';
import type { ListConfigFilters } from '@app-builder/queries/screening/lists-config';

type SectionData = NonNullable<ListConfigFilters[keyof ListConfigFilters]>;
type SanctionsSection = NonNullable<ListConfigFilters['sanctions']>;
type PepsSection = NonNullable<ListConfigFilters['peps']>;
type AdverseMediaSection = NonNullable<ListConfigFilters['adverse-media']>;

export function getSectionLeafNames(sectionKey: ScreeningCategory, section: SectionData): string[] {
  if (sectionKey === 'sanctions') {
    const s = section as SanctionsSection;
    return s.datasets.flatMap((g) => g.datasets.map((d) => d.name));
  }
  if (sectionKey === 'peps') {
    const s = section as PepsSection;
    return [...s.role, ...s.geography, ...s.position].map((i) => i.name);
  }
  if (sectionKey === 'adverse-media') {
    const s = section as AdverseMediaSection;
    return [...s.geography, ...s.category].map((i) => i.name);
  }
  return [];
}
