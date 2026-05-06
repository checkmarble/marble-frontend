import { ScreeningCategory } from '@app-builder/models/screening';
import { AvailableFeatures, getListConfigFn } from '@app-builder/server-fns/screenings';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { ScreeningAvailableFilters, ScreeningAvailableFiltersSection } from 'marble-api';
import * as R from 'remeda';

type GroupedDataset = {
  name: string;
  title: string;
  datasets: { name: string; title: string }[];
};

type NormalizedSection = {
  datasets?: GroupedDataset[];
  topics?: Record<string, { name: string; title: string }[]>;
};

export type ListConfigFilters = Partial<Record<ScreeningCategory, NormalizedSection>>;

function groupBySection(datasets: { section?: string; name: string; title: string }[]): GroupedDataset[] {
  return Object.entries(R.groupBy(datasets, (d) => d.section ?? d.name)).map(([section, items]) => ({
    name: section,
    title: section,
    datasets: items.map(({ name, title }) => ({ name, title })),
  }));
}

function normalizeListConfig(config: ScreeningAvailableFilters): ListConfigFilters {
  function normalize(section: ScreeningAvailableFiltersSection | undefined): NormalizedSection | undefined {
    if (!section) return undefined;
    return {
      ...section,
      datasets: Array.isArray(section?.datasets) ? groupBySection(section.datasets) : undefined,
    };
  }
  if (!config) return {};

  return {
    sanctions: normalize(config.sections.sanctions),
    peps: normalize(config.sections.peps),
    'adverse-media': normalize(config.sections.adverse_media),
    'third-parties': normalize(config.sections.other),
  };
}

export const useListConfigQuery = (useCase: AvailableFeatures) => {
  const getListConfig = useServerFn(() => getListConfigFn({ data: { feature: useCase } }));

  return useQuery({
    queryKey: ['screening', 'datasets'],
    queryFn: async () => {
      const result = await getListConfig();
      return normalizeListConfig(result);
    },
  });
};
