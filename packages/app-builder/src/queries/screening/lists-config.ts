import { AvailableFeatures, ScreeningAvailableFiltersAdapted, ScreeningCategory } from '@app-builder/models/screening';
import { getListConfigFn } from '@app-builder/server-fns/screenings';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { ScreeningAvailableFilters, ScreeningAvailableFiltersSection } from 'marble-api';
import * as R from 'remeda';

type GroupedDataset = {
  name: string;
  title: string;
  datasets: { name: string; title: string }[];
};

type ConditionalTopic = {
  items: { name: string; key: string; title: string }[];
  dependsOn: string;
};

type NormalizedSection = {
  datasets?: GroupedDataset[];
  topics?: Record<string, { name: string; title: string }[]>;
  conditionalTopics?: Record<string, ConditionalTopic>;
};

export type ListConfigFilters = Partial<Record<ScreeningCategory, NormalizedSection>>;

function groupBySection(datasets: { section?: string; name: string; title: string }[]): GroupedDataset[] {
  return Object.entries(R.groupBy(datasets, (d) => d.section ?? d.name)).map(([section, items]) => ({
    name: section,
    title: section,
    datasets: items.map(({ name, title }) => ({ name, title })),
  }));
}

function normalizeListConfig(config: ScreeningAvailableFiltersAdapted): ListConfigFilters {
  function normalize(
    section: ScreeningAvailableFiltersSection | undefined,
    type: keyof ScreeningAvailableFilters['sections'],
  ): NormalizedSection | undefined {
    if (!section) return undefined;
    // complete all items name with section and key (sanctions, peps, adverse_medias)
    for (const dataset of section.datasets ?? []) {
      dataset.name = `${type}:dataset:${dataset.name}`;
    }
    for (const [key, topic] of Object.entries(section.topics ?? {})) {
      for (const item of topic) {
        item.name = `${type}:topic:${key}:${item.name}`;
      }
    }
    const adaptedSection: NormalizedSection = {
      ...section,
      datasets: Array.isArray(section?.datasets) ? groupBySection(section.datasets) : undefined,
    };

    if (config.conditional_filters && section.topics) {
      for (const cf of config.conditional_filters) {
        if (cf.key && cf.key in section.topics) {
          adaptedSection.conditionalTopics ??= {};
          adaptedSection.conditionalTopics[cf.name] = {
            items: cf.topics.map((t) => ({
              name: `${type}:topic:${cf.key}:${cf.name}:${t.name}`,
              key: `${type}:topic:${cf.key}:${t.name}`,
              title: t.title,
            })),
            dependsOn: cf.key,
          };
        }
      }
    }

    return adaptedSection;
  }
  if (!config) return {};

  return {
    sanctions: normalize(config.sections.sanctions, 'sanctions'),
    peps: normalize(config.sections.peps, 'peps'),
    'adverse-media': normalize(config.sections.adverse_media, 'adverse_media'),
    'third-parties': normalize(config.sections.other, 'other'),
  };
}

export const useListConfigQuery = (useCase: AvailableFeatures) => {
  const getListConfig = useServerFn(getListConfigFn);

  return useQuery({
    queryKey: ['screening', 'datasets', useCase],
    queryFn: async () => {
      const result = await getListConfig({ data: { feature: useCase } });
      return normalizeListConfig(result);
    },
  });
};
